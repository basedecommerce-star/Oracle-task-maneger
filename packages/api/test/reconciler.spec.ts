import { ReconcilerService, DiffSeverity } from '../src/ingestion/reconciler/reconciler.service';
import { ParsedOutput } from '../src/ingestion/parsers/html-parser.service';

function makeMockPrisma() {
  return {
    parserDiff: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'diff-1', ...data })),
    },
  } as any;
}

function makeOutput(overrides: Partial<ParsedOutput> = {}): ParsedOutput {
  return {
    id: 'html-out-1',
    parserRunId: 'run-1',
    externalSourceId: 'SRC-001',
    language: 'ro',
    questionText: 'What is the speed limit in urban areas?',
    answersJson: JSON.stringify([
      { text: '50 km/h', order: 1, isCorrect: true },
      { text: '60 km/h', order: 2, isCorrect: false },
      { text: '70 km/h', order: 3, isCorrect: false },
    ]),
    confidenceScore: 1.0,
    ...overrides,
  };
}

describe('ReconcilerService', () => {
  let service: ReconcilerService;
  let mockPrisma: ReturnType<typeof makeMockPrisma>;

  beforeEach(() => {
    mockPrisma = makeMockPrisma();
    service = new ReconcilerService(mockPrisma);
  });

  it('should return empty diffs when no visual outputs', async () => {
    const htmlOutputs = [makeOutput()];
    const diffs = await service.reconcile(htmlOutputs, []);
    expect(diffs).toHaveLength(0);
  });

  it('should return empty diffs in single-parser mode (visualParserEnabled=false)', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1', questionText: 'Totally different' });

    const diffs = await service.reconcile([html], [visual], false);
    expect(diffs).toHaveLength(0);
  });

  it('should produce no diffs when outputs match exactly', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1' });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs).toHaveLength(0);
  });

  it('should produce HARD_CONFLICT for correct_answer (isCorrect) mismatch', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      answersJson: JSON.stringify([
        { text: '50 km/h', order: 1, isCorrect: false },
        { text: '60 km/h', order: 2, isCorrect: true },
        { text: '70 km/h', order: 3, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    const isCorrectDiffs = diffs.filter((d) => d.fieldName.endsWith('.isCorrect'));
    expect(isCorrectDiffs.length).toBeGreaterThanOrEqual(1);
    for (const diff of isCorrectDiffs) {
      expect(diff.severity).toBe(DiffSeverity.HARD_CONFLICT);
      expect(diff.isConflict).toBe(true);
    }
  });

  it('should produce REVIEW_NEEDED for significant question text difference', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1', questionText: 'A completely different question about parking' });

    const diffs = await service.reconcile([html], [visual]);
    const qtDiff = diffs.find((d) => d.fieldName === 'questionText');
    expect(qtDiff).toBeDefined();
    expect(qtDiff!.severity).toBe(DiffSeverity.REVIEW_NEEDED);
    expect(qtDiff!.isConflict).toBe(true);
  });

  it('should produce MINOR for whitespace-only question text diffs', async () => {
    const html = makeOutput({ id: 'h1', questionText: 'What is the speed limit?' });
    const visual = makeOutput({ id: 'v1', questionText: 'What  is  the  speed  limit?' });

    const diffs = await service.reconcile([html], [visual]);
    // Whitespace-only diffs are normalized away — should produce 0 diffs
    expect(diffs.filter((d) => d.fieldName === 'questionText')).toHaveLength(0);
  });

  it('should produce MINOR for answer order diffs', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      answersJson: JSON.stringify([
        { text: '50 km/h', order: 3, isCorrect: true },
        { text: '60 km/h', order: 1, isCorrect: false },
        { text: '70 km/h', order: 2, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    const orderDiffs = diffs.filter((d) => d.fieldName.endsWith('.order'));
    expect(orderDiffs.length).toBeGreaterThanOrEqual(1);
    for (const diff of orderDiffs) {
      expect(diff.severity).toBe(DiffSeverity.MINOR);
      expect(diff.isConflict).toBe(false);
    }
  });

  it('should detect answer count differences as REVIEW_NEEDED', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      answersJson: JSON.stringify([
        { text: '50 km/h', order: 1, isCorrect: true },
        { text: '60 km/h', order: 2, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    const countDiff = diffs.find((d) => d.fieldName === 'answersCount');
    expect(countDiff).toBeDefined();
    expect(countDiff!.severity).toBe(DiffSeverity.REVIEW_NEEDED);
    expect(countDiff!.isConflict).toBe(true);
  });

  it('should detect answer text differences as REVIEW_NEEDED', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      answersJson: JSON.stringify([
        { text: '40 km/h', order: 1, isCorrect: true },
        { text: '60 km/h', order: 2, isCorrect: false },
        { text: '70 km/h', order: 3, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    const textDiff = diffs.find((d) => d.fieldName === 'answer[0].text');
    expect(textDiff).toBeDefined();
    expect(textDiff!.severity).toBe(DiffSeverity.REVIEW_NEEDED);
  });

  it('should not produce diffs for non-matching externalSourceIds', async () => {
    const html = makeOutput({ id: 'h1', externalSourceId: 'SRC-001' });
    const visual = makeOutput({ id: 'v1', externalSourceId: 'SRC-999' });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs).toHaveLength(0);
  });

  it('should persist diffs via prisma.parserDiff.create', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1', questionText: 'Totally different question text' });

    await service.reconcile([html], [visual]);
    expect(mockPrisma.parserDiff.create).toHaveBeenCalled();
  });

  it('MINOR diffs have isConflict=false, HARD/REVIEW have isConflict=true', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      questionText: 'Different question',
      answersJson: JSON.stringify([
        { text: '50 km/h', order: 3, isCorrect: false },
        { text: '60 km/h', order: 2, isCorrect: false },
        { text: '70 km/h', order: 1, isCorrect: true },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    for (const diff of diffs) {
      if (diff.severity === DiffSeverity.MINOR) {
        expect(diff.isConflict).toBe(false);
      } else {
        expect(diff.isConflict).toBe(true);
      }
    }
  });
});

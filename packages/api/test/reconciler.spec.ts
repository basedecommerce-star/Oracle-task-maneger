import { ReconcilerService } from '../src/ingestion/reconciler/reconciler.service';
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

  it('should match outputs by externalSourceId', async () => {
    const html = makeOutput({ id: 'h1', externalSourceId: 'SRC-001' });
    const visual = makeOutput({ id: 'v1', externalSourceId: 'SRC-001' });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs).toHaveLength(0);
  });

  it('should produce no diffs when outputs match exactly', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1' });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs).toHaveLength(0);
  });

  it('should detect questionText differences', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({ id: 'v1', questionText: 'Different question text here' });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs.length).toBeGreaterThanOrEqual(1);
    expect(diffs.some((d) => d.fieldName === 'questionText')).toBe(true);
  });

  it('should detect answer count differences', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      answersJson: JSON.stringify([
        { text: '50 km/h', order: 1, isCorrect: true },
        { text: '60 km/h', order: 2, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs.some((d) => d.fieldName === 'answersCount')).toBe(true);
  });

  it('should detect answer text differences', async () => {
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
    expect(diffs.some((d) => d.fieldName === 'answer[0].text')).toBe(true);
  });

  it('should detect answer isCorrect differences', async () => {
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
    expect(diffs.some((d) => d.fieldName === 'answer[0].isCorrect')).toBe(true);
    expect(diffs.some((d) => d.fieldName === 'answer[1].isCorrect')).toBe(true);
  });

  it('all diffs should have isConflict=true', async () => {
    const html = makeOutput({ id: 'h1' });
    const visual = makeOutput({
      id: 'v1',
      questionText: 'Different question',
      answersJson: JSON.stringify([
        { text: 'Different answer', order: 1, isCorrect: false },
        { text: '60 km/h', order: 2, isCorrect: false },
        { text: '70 km/h', order: 3, isCorrect: false },
      ]),
    });

    const diffs = await service.reconcile([html], [visual]);
    expect(diffs.length).toBeGreaterThan(0);
    for (const diff of diffs) {
      expect(diff.isConflict).toBe(true);
    }
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
});

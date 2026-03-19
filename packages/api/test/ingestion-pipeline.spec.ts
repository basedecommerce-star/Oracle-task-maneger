import { IngestionService } from '../src/ingestion/pipeline/ingestion.service';

const mockSnapshot = {
  id: 'snap-1',
  sourceProviderId: 'provider-1',
  sourceUrl: 'https://example.com/source',
  rawContent: '<div class="question"><p class="question-text">Test question</p></div>',
  screenshotKey: 'screenshots/snap-1.png',
  contentHash: 'abc123',
  parserVersion: '1.0.0',
  sourceProvider: { id: 'provider-1', name: 'Test Provider' },
};

const mockParsedOutput = {
  id: 'parsed-1',
  parserRunId: 'run-1',
  externalSourceId: 'SRC-001',
  categoryCode: 'B',
  ticketNumber: 1,
  topicCode: 'T01',
  language: 'ro',
  questionText: 'What is the speed limit in urban areas?',
  answersJson: JSON.stringify([
    { text: '50 km/h', order: 1, isCorrect: true },
    { text: '60 km/h', order: 2, isCorrect: false },
    { text: '70 km/h', order: 3, isCorrect: false },
  ]),
  explanationText: 'Speed limit is 50 km/h in urban areas.',
  confidenceScore: 1.0,
};

function createMockPrisma() {
  return {
    sourceSnapshot: {
      findUnique: jest.fn().mockResolvedValue(mockSnapshot),
    },
    parserRun: {
      create: jest.fn().mockResolvedValue({ id: 'run-1' }),
      update: jest.fn().mockResolvedValue({}),
    },
    evidenceBundle: {
      create: jest.fn().mockResolvedValue({ id: 'bundle-1' }),
    },
    question: {
      create: jest.fn().mockResolvedValue({ id: 'q-1' }),
    },
    category: {
      findUnique: jest.fn().mockResolvedValue({ id: 'cat-1', code: 'B' }),
    },
    topic: {
      findUnique: jest.fn().mockResolvedValue({ id: 'topic-1', code: 'T01' }),
    },
    country: {
      findFirst: jest.fn().mockResolvedValue({ id: 'country-1' }),
    },
  } as any;
}

function createMockHtmlParser(outputs = [mockParsedOutput]) {
  return { parse: jest.fn().mockResolvedValue(outputs) } as any;
}

function createMockVisualParser(outputs: any[] = []) {
  return { parse: jest.fn().mockResolvedValue(outputs) } as any;
}

function createMockReconciler(diffs: any[] = []) {
  return { reconcile: jest.fn().mockResolvedValue(diffs) } as any;
}

function createMockValidator(results?: any[]) {
  const defaultResults = [{ outputId: 'parsed-1', isValid: true, errors: [], warnings: [] }];
  return { validateAll: jest.fn().mockResolvedValue(results ?? defaultResults) } as any;
}

function createMockScorer(outputs?: any[]) {
  return {
    scoreAll: jest.fn().mockImplementation((outs) => Promise.resolve(outs)),
  } as any;
}

describe('IngestionService (pipeline)', () => {
  let service: IngestionService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockHtmlParser: ReturnType<typeof createMockHtmlParser>;
  let mockVisualParser: ReturnType<typeof createMockVisualParser>;
  let mockReconciler: ReturnType<typeof createMockReconciler>;
  let mockValidator: ReturnType<typeof createMockValidator>;
  let mockScorer: ReturnType<typeof createMockScorer>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockHtmlParser = createMockHtmlParser();
    mockVisualParser = createMockVisualParser();
    mockReconciler = createMockReconciler();
    mockValidator = createMockValidator();
    mockScorer = createMockScorer();

    service = new IngestionService(
      mockPrisma,
      mockHtmlParser,
      mockVisualParser,
      mockReconciler,
      mockValidator,
      mockScorer,
    );
  });

  it('should create an evidence bundle for each question', async () => {
    await service.runPipeline('snap-1');
    expect(mockPrisma.evidenceBundle.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.evidenceBundle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourcePageUrl: mockSnapshot.sourceUrl,
          screenshotKey: mockSnapshot.screenshotKey,
          extractedText: mockParsedOutput.questionText,
        }),
      }),
    );
  });

  it('should always set isPublished=false after pipeline', async () => {
    await service.runPipeline('snap-1');
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPublished: false }),
      }),
    );
  });

  it('should set verificationStatus to CONFLICT when diffs have conflicts', async () => {
    mockReconciler = createMockReconciler([
      { outputAId: 'parsed-1', outputBId: 'v-1', fieldName: 'questionText', isConflict: true, valueA: 'a', valueB: 'b' },
    ]);
    service = new IngestionService(mockPrisma, mockHtmlParser, mockVisualParser, mockReconciler, mockValidator, mockScorer);

    const result = await service.runPipeline('snap-1');
    expect(result.conflicts).toBe(1);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verificationStatus: 'CONFLICT' }),
      }),
    );
  });

  it('should set REVIEW_REQUIRED when confidence < 0.8', async () => {
    const lowConfOutput = { ...mockParsedOutput, confidenceScore: 0.5 };
    mockScorer = { scoreAll: jest.fn().mockResolvedValue([lowConfOutput]) } as any;
    service = new IngestionService(mockPrisma, mockHtmlParser, mockVisualParser, mockReconciler, mockValidator, mockScorer);

    const result = await service.runPipeline('snap-1');
    expect(result.requiresReview).toBe(1);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verificationStatus: 'REVIEW_REQUIRED' }),
      }),
    );
  });

  it('should set PARSED when high confidence and no conflicts', async () => {
    await service.runPipeline('snap-1');
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verificationStatus: 'PARSED' }),
      }),
    );
  });

  it('should throw when snapshot not found', async () => {
    mockPrisma.sourceSnapshot.findUnique.mockResolvedValue(null);
    await expect(service.runPipeline('nonexistent')).rejects.toThrow(
      'Snapshot nonexistent not found',
    );
  });

  it('should create evidence bundle with source data', async () => {
    await service.runPipeline('snap-1');
    expect(mockPrisma.evidenceBundle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourceHash: mockSnapshot.contentHash,
          extractedAnswers: mockParsedOutput.answersJson,
        }),
      }),
    );
  });
});

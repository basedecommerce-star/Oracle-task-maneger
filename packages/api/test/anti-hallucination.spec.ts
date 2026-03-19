import { PublicationPolicyService } from '../src/ingestion/pipeline/publication-policy.service';

function createMockPrisma(overrides: Record<string, any> = {}) {
  return {
    question: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 1.0,
        evidenceBundleId: 'eb-1',
        sourceProviderId: 'sp-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        answers: [
          { id: 'a1', text: 'Answer A', isCorrect: true },
          { id: 'a2', text: 'Answer B', isCorrect: false },
        ],
      }),
      ...overrides.question,
    },
    parserDiff: {
      count: jest.fn().mockResolvedValue(0),
      ...overrides.parserDiff,
    },
    moderationEvent: {
      findFirst: jest.fn().mockResolvedValue(null),
      ...overrides.moderationEvent,
    },
  } as any;
}

describe('Anti-Hallucination Guarantees – PublicationPolicyService', () => {
  describe('blocks publishing when requirements are not met', () => {
    it('blocks when verificationStatus is not VERIFIED', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'PARSED',
        confidenceScore: 1.0,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: true },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('verificationStatus is PARSED')]),
      );
    });

    it('blocks when no evidence bundle exists', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 1.0,
        evidenceBundleId: null,
        evidenceBundle: null,
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: true },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('Missing evidence bundle')]),
      );
    });

    it('blocks when fewer than 2 answers', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 1.0,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [{ id: 'a1', text: 'A', isCorrect: true }],
      });
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('minimum 2 required')]),
      );
    });

    it('blocks when no correct answer', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 1.0,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: false },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('No correct answer')]),
      );
    });

    it('blocks when confidence < 1.0 without manual approval', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 0.7,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: true },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      mockPrisma.moderationEvent.findFirst.mockResolvedValue(null);
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('< 1.0 and no manual approval')]),
      );
    });

    it('blocks non-official source without moderation approval', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 1.0,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'B' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: true },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      mockPrisma.moderationEvent.findFirst.mockResolvedValue(null);
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toEqual(
        expect.arrayContaining([expect.stringContaining('Non-official source requires moderation approval')]),
      );
    });

    it('returns not found when question does not exist', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue(null);
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('nonexistent');
      expect(result.canPublish).toBe(false);
      expect(result.reasons).toContain('Question not found');
    });
  });

  describe('allows publishing when all checks pass', () => {
    it('allows publishing a fully verified question from official source', async () => {
      const mockPrisma = createMockPrisma();
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('allows confidence < 1.0 if manual approval exists', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'VERIFIED',
        confidenceScore: 0.8,
        evidenceBundleId: 'eb-1',
        evidenceBundle: { id: 'eb-1' },
        sourceProvider: { id: 'sp-1', sourcePriority: 'A' },
        sourceProviderId: 'sp-1',
        answers: [
          { id: 'a1', text: 'A', isCorrect: true },
          { id: 'a2', text: 'B', isCorrect: false },
        ],
      });
      mockPrisma.moderationEvent.findFirst.mockResolvedValue({
        id: 'evt-1',
        action: 'approve',
      });
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('collects multiple failure reasons simultaneously', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        verificationStatus: 'RAW',
        confidenceScore: 0.5,
        evidenceBundleId: null,
        evidenceBundle: null,
        sourceProvider: { id: 'sp-1', sourcePriority: 'B' },
        sourceProviderId: 'sp-1',
        answers: [],
      });
      mockPrisma.moderationEvent.findFirst.mockResolvedValue(null);
      const service = new PublicationPolicyService(mockPrisma);

      const result = await service.checkPublishability('q-1');
      expect(result.canPublish).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(4);
    });
  });
});

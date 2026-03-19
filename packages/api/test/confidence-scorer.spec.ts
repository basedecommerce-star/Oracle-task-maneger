import { ConfidenceScorerService } from '../src/ingestion/confidence/confidence-scorer.service';
import { ParsedOutput } from '../src/ingestion/parsers/html-parser.service';
import { DiffResult } from '../src/ingestion/reconciler/reconciler.service';
import { ValidationResult } from '../src/ingestion/validators/question-validator.service';

function makeOutput(overrides: Partial<ParsedOutput> = {}): ParsedOutput {
  return {
    id: 'out-1',
    parserRunId: 'run-1',
    language: 'ro',
    questionText: 'A valid question text that is long enough for scoring',
    answersJson: JSON.stringify([
      { text: 'Answer A', order: 1, isCorrect: true },
      { text: 'Answer B', order: 2, isCorrect: false },
      { text: 'Answer C', order: 3, isCorrect: false },
    ]),
    explanationText: 'This is the explanation',
    confidenceScore: 1.0,
    ...overrides,
  };
}

function makeValidation(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    outputId: 'out-1',
    isValid: true,
    errors: [],
    warnings: [],
    ...overrides,
  };
}

function makeDiff(overrides: Partial<DiffResult> = {}): DiffResult {
  return {
    outputAId: 'out-1',
    outputBId: 'out-2',
    fieldName: 'questionText',
    valueA: 'a',
    valueB: 'b',
    isConflict: true,
    ...overrides,
  };
}

describe('ConfidenceScorerService', () => {
  let service: ConfidenceScorerService;

  beforeEach(() => {
    service = new ConfidenceScorerService();
  });

  it('should return perfect score (1.0) when no issues', async () => {
    const outputs = [makeOutput()];
    const diffs: DiffResult[] = [];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBe(1.0);
  });

  it('should reduce score by 0.3 when validation fails', async () => {
    const outputs = [makeOutput()];
    const validations = [makeValidation({ isValid: false })];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.7);
  });

  it('should reduce score by 0.15 per conflict diff', async () => {
    const outputs = [makeOutput()];
    const diffs = [makeDiff({ isConflict: true })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBe(0.85);
  });

  it('should reduce score by 0.05 per validation warning', async () => {
    const outputs = [makeOutput()];
    const validations = [makeValidation({ warnings: ['warn1', 'warn2'] })];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.9);
  });

  it('should reduce score by 0.05 for missing explanation', async () => {
    const outputs = [makeOutput({ explanationText: undefined })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.95);
  });

  it('should reduce score by 0.2 for invalid answers JSON', async () => {
    const outputs = [makeOutput({ answersJson: 'not-json' })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    // -0.2 (invalid JSON) -0.1 (< 3 answers since parse failed -> 0 answers)
    expect(scored[0].confidenceScore).toBe(0.7);
  });

  it('should reduce score by 0.1 for fewer than 3 answers', async () => {
    const outputs = [
      makeOutput({
        answersJson: JSON.stringify([
          { text: 'A', order: 1, isCorrect: true },
          { text: 'B', order: 2, isCorrect: false },
        ]),
      }),
    ];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.9);
  });

  it('should reduce score by 0.1 for short question text (<20 chars)', async () => {
    const outputs = [makeOutput({ questionText: 'Short question' })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.9);
  });

  it('should clamp score to minimum 0', async () => {
    const outputs = [
      makeOutput({
        questionText: 'Short',
        answersJson: 'bad',
        explanationText: undefined,
      }),
    ];
    const diffs = [
      makeDiff(), makeDiff(), makeDiff(), makeDiff(), makeDiff(),
      makeDiff(), makeDiff(), makeDiff(),
    ];
    const validations = [
      makeValidation({ isValid: false, warnings: ['w1', 'w2', 'w3', 'w4'] }),
    ];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBeGreaterThanOrEqual(0);
    expect(scored[0].confidenceScore).toBeLessThanOrEqual(1);
  });

  it('confidence < 1.0 blocks auto-publish (score reflects issues)', async () => {
    const outputs = [makeOutput({ explanationText: undefined })];
    const validations = [makeValidation({ warnings: ['minor issue'] })];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBeLessThan(1.0);
  });
});

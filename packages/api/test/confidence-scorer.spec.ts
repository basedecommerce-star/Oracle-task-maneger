import { ConfidenceScorerService } from '../src/ingestion/confidence/confidence-scorer.service';
import { ParsedOutput } from '../src/ingestion/parsers/html-parser.service';
import { DiffResult, DiffSeverity } from '../src/ingestion/reconciler/reconciler.service';
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
    ruleReference: 'Art. 42',
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
    severity: DiffSeverity.REVIEW_NEEDED,
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

  it('should penalize -0.5 for correct-answer ambiguity (isCorrect conflict)', async () => {
    const outputs = [makeOutput()];
    const diffs = [makeDiff({ fieldName: 'answer[0].isCorrect', severity: DiffSeverity.HARD_CONFLICT })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBe(0.5);
  });

  it('should penalize -0.4 for invalid answer structure (unparseable JSON)', async () => {
    const outputs = [makeOutput({ answersJson: 'not-json' })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    // -0.4 (invalid JSON) + -0.4 (fewer than 2 answers since parse returns 0) = 0.2
    expect(scored[0].confidenceScore).toBe(0.2);
  });

  it('should penalize -0.4 for no correct answer', async () => {
    const outputs = [makeOutput({
      answersJson: JSON.stringify([
        { text: 'A', order: 1, isCorrect: false },
        { text: 'B', order: 2, isCorrect: false },
      ]),
    })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.6);
  });

  it('should penalize -0.4 for fewer than 2 answers', async () => {
    const outputs = [makeOutput({
      answersJson: JSON.stringify([
        { text: 'A', order: 1, isCorrect: true },
      ]),
    })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.6);
  });

  it('should penalize -0.3 for answer text conflict', async () => {
    const outputs = [makeOutput()];
    const diffs = [makeDiff({ fieldName: 'answer[0].text', severity: DiffSeverity.REVIEW_NEEDED })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBe(0.7);
  });

  it('should penalize -0.2 for questionText conflict', async () => {
    const outputs = [makeOutput()];
    const diffs = [makeDiff({ fieldName: 'questionText', severity: DiffSeverity.REVIEW_NEEDED })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBe(0.8);
  });

  it('should penalize -0.05 for missing explanation (low penalty)', async () => {
    const outputs = [makeOutput({ explanationText: undefined })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.95);
  });

  it('should penalize -0.05 for missing rule reference', async () => {
    const outputs = [makeOutput({ ruleReference: undefined })];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBe(0.95);
  });

  it('should not penalize for diffs in single-parser mode', async () => {
    const outputs = [makeOutput()];
    const diffs = [
      makeDiff({ fieldName: 'answer[0].isCorrect', severity: DiffSeverity.HARD_CONFLICT }),
      makeDiff({ fieldName: 'questionText', severity: DiffSeverity.REVIEW_NEEDED }),
    ];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations, true);
    // single-parser mode skips all diff penalties
    expect(scored[0].confidenceScore).toBe(1.0);
  });

  it('should clamp score to minimum 0', async () => {
    const outputs = [makeOutput({
      answersJson: 'bad',
      explanationText: undefined,
      ruleReference: undefined,
    })];
    const diffs = [
      makeDiff({ fieldName: 'answer[0].isCorrect' }),
      makeDiff({ fieldName: 'answer[1].isCorrect' }),
      makeDiff({ fieldName: 'answer[0].text' }),
      makeDiff({ fieldName: 'questionText' }),
    ];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, diffs, validations);
    expect(scored[0].confidenceScore).toBeGreaterThanOrEqual(0);
    expect(scored[0].confidenceScore).toBeLessThanOrEqual(1);
  });

  it('should clamp score to maximum 1', async () => {
    const outputs = [makeOutput()];
    const validations = [makeValidation()];

    const scored = await service.scoreAll(outputs, [], validations);
    expect(scored[0].confidenceScore).toBeLessThanOrEqual(1);
  });
});

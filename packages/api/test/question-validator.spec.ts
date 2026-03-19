import { QuestionValidatorService } from '../src/ingestion/validators/question-validator.service';
import { ParsedOutput } from '../src/ingestion/parsers/html-parser.service';

function makeParsedOutput(overrides: Partial<ParsedOutput> = {}): ParsedOutput {
  return {
    id: 'test-output-1',
    parserRunId: 'run-1',
    language: 'ro',
    questionText: 'This is a valid question text with enough characters',
    answersJson: JSON.stringify([
      { text: 'Answer A', order: 1, isCorrect: true },
      { text: 'Answer B', order: 2, isCorrect: false },
      { text: 'Answer C', order: 3, isCorrect: false },
    ]),
    confidenceScore: 1.0,
    ...overrides,
  };
}

describe('QuestionValidatorService', () => {
  let service: QuestionValidatorService;

  beforeEach(() => {
    service = new QuestionValidatorService();
  });

  it('should pass validation for a valid question', () => {
    const output = makeParsedOutput();
    const result = service.validate(output);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.outputId).toBe('test-output-1');
  });

  it('should reject question text shorter than 10 characters', () => {
    const output = makeParsedOutput({ questionText: 'Short' });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Question text is too short (minimum 10 characters)',
    );
  });

  it('should reject empty question text', () => {
    const output = makeParsedOutput({ questionText: '' });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Question text is too short (minimum 10 characters)',
    );
  });

  it('should reject fewer than 2 answers', () => {
    const output = makeParsedOutput({
      answersJson: JSON.stringify([
        { text: 'Only answer', order: 1, isCorrect: true },
      ]),
    });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Question must have at least 2 answers');
  });

  it('should reject 0 correct answers', () => {
    const output = makeParsedOutput({
      answersJson: JSON.stringify([
        { text: 'Answer A', order: 1, isCorrect: false },
        { text: 'Answer B', order: 2, isCorrect: false },
      ]),
    });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Question must have at least one correct answer',
    );
  });

  it('should reject empty answer text', () => {
    const output = makeParsedOutput({
      answersJson: JSON.stringify([
        { text: '', order: 1, isCorrect: true },
        { text: 'Answer B', order: 2, isCorrect: false },
      ]),
    });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Answer 1 has empty text');
  });

  it('should detect duplicate answer texts', () => {
    const output = makeParsedOutput({
      answersJson: JSON.stringify([
        { text: 'Same answer', order: 1, isCorrect: true },
        { text: 'Same answer', order: 2, isCorrect: false },
      ]),
    });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate answer texts detected');
  });

  it('should warn when question text matches answer text', () => {
    const qText = 'This is the question text matching an answer';
    const output = makeParsedOutput({
      questionText: qText,
      answersJson: JSON.stringify([
        { text: qText, order: 1, isCorrect: true },
        { text: 'Different answer', order: 2, isCorrect: false },
      ]),
    });
    const result = service.validate(output);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain(
      'Question text is identical to an answer',
    );
  });

  it('should warn on very long question text (>2000 chars)', () => {
    const longText = 'A'.repeat(2001);
    const output = makeParsedOutput({ questionText: longText });
    const result = service.validate(output);

    expect(result.warnings).toContain(
      'Question text is unusually long (>2000 chars)',
    );
  });

  it('should fail on invalid JSON answersJson', () => {
    const output = makeParsedOutput({ answersJson: 'not-json' });
    const result = service.validate(output);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid answers JSON');
  });

  it('should validate all outputs via validateAll', async () => {
    const outputs = [
      makeParsedOutput({ id: 'o1' }),
      makeParsedOutput({ id: 'o2', questionText: 'Short' }),
    ];
    const results = await service.validateAll(outputs);

    expect(results).toHaveLength(2);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
  });
});

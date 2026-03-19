import { Injectable, Logger } from '@nestjs/common';
import { ParsedOutput } from '../parsers/html-parser.service';

export interface ValidationResult {
  outputId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validation rules – Step 5 of the ingestion pipeline.
 * Checks extracted questions against business rules before scoring.
 */
@Injectable()
export class QuestionValidatorService {
  private readonly logger = new Logger(QuestionValidatorService.name);

  async validateAll(outputs: ParsedOutput[]): Promise<ValidationResult[]> {
    return outputs.map((output) => this.validate(output));
  }

  validate(output: ParsedOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rule 1: Question text must not be empty and must be at least 10 chars
    if (!output.questionText || output.questionText.trim().length < 10) {
      errors.push('Question text is too short (minimum 10 characters)');
    }

    // Rule 2: Must have at least 2 answers
    let answers: any[] = [];
    try {
      answers = JSON.parse(output.answersJson);
    } catch {
      errors.push('Invalid answers JSON');
    }

    if (answers.length < 2) {
      errors.push('Question must have at least 2 answers');
    }

    // Rule 3: Must have exactly one correct answer (for SINGLE type)
    const correctCount = answers.filter((a: any) => a.isCorrect).length;
    if (correctCount === 0) {
      errors.push('Question must have at least one correct answer');
    }

    // Rule 4: Answer texts must not be empty
    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].text || answers[i].text.trim().length === 0) {
        errors.push(`Answer ${i + 1} has empty text`);
      }
    }

    // Rule 5: Question text should not be identical to any answer
    for (const answer of answers) {
      if (answer.text && output.questionText.trim() === answer.text.trim()) {
        warnings.push('Question text is identical to an answer');
      }
    }

    // Rule 6: No duplicate answer texts
    const answerTexts = answers.map((a: any) =>
      (a.text || '').toLowerCase().trim(),
    );
    const uniqueTexts = new Set(answerTexts);
    if (uniqueTexts.size < answerTexts.length) {
      errors.push('Duplicate answer texts detected');
    }

    // Rule 7: Question should not exceed reasonable length
    if (output.questionText && output.questionText.length > 2000) {
      warnings.push('Question text is unusually long (>2000 chars)');
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      this.logger.warn(
        `Validation failed for output ${output.id}: ${errors.join(', ')}`,
      );
    }

    return { outputId: output.id, isValid, errors, warnings };
  }
}

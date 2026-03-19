import { Injectable, Logger } from '@nestjs/common';
import { ParsedOutput } from '../parsers/html-parser.service';
import { DiffResult } from '../reconciler/reconciler.service';
import { ValidationResult } from '../validators/question-validator.service';

/**
 * Confidence scoring – Step 6 of the ingestion pipeline.
 * Assigns a confidence score (0.0 – 1.0) to each parsed question
 * based on parser agreement, validation results, and content quality.
 */
@Injectable()
export class ConfidenceScorerService {
  private readonly logger = new Logger(ConfidenceScorerService.name);

  async scoreAll(
    outputs: ParsedOutput[],
    diffs: DiffResult[],
    validationResults: ValidationResult[],
  ): Promise<ParsedOutput[]> {
    return outputs.map((output) => {
      const validation = validationResults.find((v) => v.outputId === output.id);
      const relatedDiffs = diffs.filter(
        (d) => d.outputAId === output.id || d.outputBId === output.id,
      );

      const score = this.calculateScore(output, relatedDiffs, validation);
      output.confidenceScore = score;

      return output;
    });
  }

  private calculateScore(
    output: ParsedOutput,
    diffs: DiffResult[],
    validation?: ValidationResult,
  ): number {
    let score = 1.0;

    // Validation penalties
    if (validation) {
      if (!validation.isValid) {
        score -= 0.3; // Major penalty for validation failures
      }
      score -= validation.warnings.length * 0.05; // Small penalty per warning
    }

    // Conflict penalties
    const conflicts = diffs.filter((d) => d.isConflict);
    score -= conflicts.length * 0.15; // Penalty per conflict field

    // Content quality factors
    if (!output.explanationText) {
      score -= 0.05; // Slight penalty for missing explanation
    }

    // Answer count factor
    let answers: any[] = [];
    try {
      answers = JSON.parse(output.answersJson);
    } catch {
      score -= 0.2;
    }

    if (answers.length < 3) {
      score -= 0.1; // Typical PDD questions have 3-4 answers
    }

    // Question text quality
    if (output.questionText.length < 20) {
      score -= 0.1;
    }

    // Clamp score between 0 and 1
    score = Math.max(0, Math.min(1, score));

    this.logger.debug(`Confidence score for ${output.id}: ${score.toFixed(2)}`);
    return Math.round(score * 100) / 100;
  }
}

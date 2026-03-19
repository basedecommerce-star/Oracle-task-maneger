import { Injectable, Logger } from '@nestjs/common';
import { ParsedOutput } from '../parsers/html-parser.service';
import { DiffResult, DiffSeverity } from '../reconciler/reconciler.service';
import { ValidationResult } from '../validators/question-validator.service';

/**
 * Confidence scoring – Step 6 of the ingestion pipeline.
 * Assigns a confidence score (0.0 – 1.0) to each parsed question
 * based on parser agreement, validation results, and content quality.
 *
 * The score is used for **review-queue priority**, NOT as a replacement
 * for human moderation.  A score < 1.0 on `correct_answer` confidence
 * always requires human review before publication.
 *
 * Penalty weights (most severe first):
 *   -0.50  Correct-answer ambiguity / conflict (blocks publish)
 *   -0.40  Invalid answer structure (missing answers, no correct answer)
 *   -0.30  Parser conflict on answer text
 *   -0.20  Parser conflict on question text
 *   -0.15  Missing image when expected
 *   -0.05  Missing explanation (low – should not block publish)
 *   -0.05  Missing rule reference
 */
@Injectable()
export class ConfidenceScorerService {
  private readonly logger = new Logger(ConfidenceScorerService.name);

  /**
   * @param singleParserMode – true when visual parser is feature-flagged off.
   *   In that mode no penalty is applied for missing parser cross-checks.
   */
  async scoreAll(
    outputs: ParsedOutput[],
    diffs: DiffResult[],
    validationResults: ValidationResult[],
    singleParserMode = false,
  ): Promise<ParsedOutput[]> {
    return outputs.map((output) => {
      const validation = validationResults.find(
        (v) => v.outputId === output.id,
      );
      const relatedDiffs = diffs.filter(
        (d) => d.outputAId === output.id || d.outputBId === output.id,
      );

      const score = this.calculateScore(
        output,
        relatedDiffs,
        validation,
        singleParserMode,
      );
      output.confidenceScore = score;

      return output;
    });
  }

  private calculateScore(
    output: ParsedOutput,
    diffs: DiffResult[],
    validation?: ValidationResult,
    singleParserMode = false,
  ): number {
    let score = 1.0;

    // ── Answer structure penalties ────────────────────────────────────
    let answers: any[] = [];
    try {
      answers = JSON.parse(output.answersJson);
    } catch {
      // Unparseable answer JSON → invalid structure (-0.4)
      score -= 0.4;
    }

    // No correct answer marked (-0.4, blocks publish)
    if (answers.length > 0 && !answers.some((a: any) => a.isCorrect)) {
      score -= 0.4;
    }

    // Fewer than 2 answers (-0.4, invalid structure)
    if (answers.length < 2) {
      score -= 0.4;
    }

    // ── Parser-conflict penalties (skipped in single-parser mode) ────
    if (!singleParserMode) {
      for (const diff of diffs) {
        if (diff.fieldName.endsWith('.isCorrect')) {
          // Correct-answer ambiguity / conflict (-0.5, highest)
          score -= 0.5;
        } else if (diff.fieldName.startsWith('answer[') && diff.fieldName.endsWith('.text')) {
          // Parser conflict on answer text (-0.3)
          score -= 0.3;
        } else if (diff.fieldName === 'questionText') {
          // Parser conflict on question text (-0.2)
          score -= 0.2;
        }
        // MINOR diffs (explanation, order) do not incur a penalty
      }
    }

    // ── Content-quality penalties ─────────────────────────────────────
    // Missing image when an <img> placeholder or reference is detected (-0.15)
    if (
      output.questionText.includes('[image]') &&
      !(output as any).imageUrl
    ) {
      score -= 0.15;
    }

    // Missing explanation (-0.05, low – should not block publish)
    if (!output.explanationText) {
      score -= 0.05;
    }

    // Missing rule reference (-0.05)
    if (!output.ruleReference) {
      score -= 0.05;
    }

    // Clamp between 0 and 1
    score = Math.max(0, Math.min(1, score));

    this.logger.debug(
      `Confidence score for ${output.id}: ${score.toFixed(2)}` +
        (singleParserMode ? ' (single-parser mode)' : ''),
    );
    return Math.round(score * 100) / 100;
  }
}

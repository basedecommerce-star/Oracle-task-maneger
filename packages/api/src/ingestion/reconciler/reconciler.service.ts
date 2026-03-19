import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParsedOutput } from '../parsers/html-parser.service';

/** Severity of a diff between parser outputs. */
export enum DiffSeverity {
  /** Cosmetic / whitespace – does not block publication. */
  MINOR = 'MINOR',
  /** Needs human review but is not necessarily wrong. */
  REVIEW_NEEDED = 'REVIEW_NEEDED',
  /** Critical mismatch – blocks publication until resolved. */
  HARD_CONFLICT = 'HARD_CONFLICT',
}

export interface DiffResult {
  outputAId: string;
  outputBId: string;
  fieldName: string;
  valueA: string | null;
  valueB: string | null;
  severity: DiffSeverity;
  /** Only true for HARD_CONFLICT and REVIEW_NEEDED – MINOR diffs are not conflicts. */
  isConflict: boolean;
}

/**
 * Reconciler – Step 4 of the ingestion pipeline.
 * Compares outputs from multiple parsers and creates diffs with severity levels.
 *
 * When the visual parser is disabled the reconciler operates in
 * single-parser mode: it validates the HTML output without requiring
 * a second parser.
 */
@Injectable()
export class ReconcilerService {
  private readonly logger = new Logger(ReconcilerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run reconciliation.
   * @param visualParserEnabled – when false, runs in single-parser mode.
   */
  async reconcile(
    htmlOutputs: ParsedOutput[],
    visualOutputs: ParsedOutput[],
    visualParserEnabled = true,
  ): Promise<DiffResult[]> {
    if (!visualParserEnabled) {
      this.logger.log(
        'Visual parser disabled – reconciler running in single-parser mode (HTML only)',
      );
      return [];
    }

    const diffs: DiffResult[] = [];

    if (visualOutputs.length === 0) {
      this.logger.log('No visual outputs to reconcile against');
      return diffs;
    }

    for (const htmlOut of htmlOutputs) {
      const visualMatch = visualOutputs.find(
        (v) =>
          v.externalSourceId &&
          v.externalSourceId === htmlOut.externalSourceId,
      );

      if (!visualMatch) continue;

      // Question text comparison
      if (
        this.normalizeText(htmlOut.questionText) !==
        this.normalizeText(visualMatch.questionText)
      ) {
        diffs.push(
          await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            'questionText',
            htmlOut.questionText,
            visualMatch.questionText,
            this.isWhitespaceOnly(htmlOut.questionText, visualMatch.questionText)
              ? DiffSeverity.MINOR
              : DiffSeverity.REVIEW_NEEDED,
          ),
        );
      }

      // Image URL comparison
      if ((htmlOut as any).imageUrl !== (visualMatch as any).imageUrl) {
        diffs.push(
          await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            'imageUrl',
            (htmlOut as any).imageUrl ?? null,
            (visualMatch as any).imageUrl ?? null,
            DiffSeverity.REVIEW_NEEDED,
          ),
        );
      }

      // Explanation text comparison
      if (
        htmlOut.explanationText !== visualMatch.explanationText &&
        this.normalizeText(htmlOut.explanationText ?? '') !==
          this.normalizeText(visualMatch.explanationText ?? '')
      ) {
        diffs.push(
          await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            'explanationText',
            htmlOut.explanationText ?? null,
            visualMatch.explanationText ?? null,
            DiffSeverity.MINOR,
          ),
        );
      }

      const htmlAnswers = JSON.parse(htmlOut.answersJson);
      const visualAnswers = JSON.parse(visualMatch.answersJson);

      // Answer count mismatch
      if (htmlAnswers.length !== visualAnswers.length) {
        diffs.push(
          await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            'answersCount',
            String(htmlAnswers.length),
            String(visualAnswers.length),
            DiffSeverity.REVIEW_NEEDED,
          ),
        );
      }

      const minLen = Math.min(htmlAnswers.length, visualAnswers.length);
      for (let i = 0; i < minLen; i++) {
        // Answer text diff
        if (
          this.normalizeText(htmlAnswers[i].text) !==
          this.normalizeText(visualAnswers[i].text)
        ) {
          diffs.push(
            await this.createDiff(
              htmlOut.id,
              visualMatch.id,
              `answer[${i}].text`,
              htmlAnswers[i].text,
              visualAnswers[i].text,
              DiffSeverity.REVIEW_NEEDED,
            ),
          );
        }

        // Answer order diff
        if (
          htmlAnswers[i].order !== undefined &&
          visualAnswers[i].order !== undefined &&
          htmlAnswers[i].order !== visualAnswers[i].order
        ) {
          diffs.push(
            await this.createDiff(
              htmlOut.id,
              visualMatch.id,
              `answer[${i}].order`,
              String(htmlAnswers[i].order),
              String(visualAnswers[i].order),
              DiffSeverity.MINOR,
            ),
          );
        }

        // Correct answer mismatch → highest severity
        if (htmlAnswers[i].isCorrect !== visualAnswers[i].isCorrect) {
          diffs.push(
            await this.createDiff(
              htmlOut.id,
              visualMatch.id,
              `answer[${i}].isCorrect`,
              String(htmlAnswers[i].isCorrect),
              String(visualAnswers[i].isCorrect),
              DiffSeverity.HARD_CONFLICT,
            ),
          );
        }
      }
    }

    this.logger.log(
      `Reconciler found ${diffs.length} diffs: ` +
        `${diffs.filter((d) => d.severity === DiffSeverity.HARD_CONFLICT).length} hard conflicts, ` +
        `${diffs.filter((d) => d.severity === DiffSeverity.REVIEW_NEEDED).length} review-needed, ` +
        `${diffs.filter((d) => d.severity === DiffSeverity.MINOR).length} minor`,
    );
    return diffs;
  }

  private async createDiff(
    outputAId: string,
    outputBId: string,
    fieldName: string,
    valueA: string | null,
    valueB: string | null,
    severity: DiffSeverity,
  ): Promise<DiffResult> {
    // Only HARD_CONFLICT and REVIEW_NEEDED are treated as conflicts
    const isConflict = severity !== DiffSeverity.MINOR;

    await this.prisma.parserDiff.create({
      data: {
        outputAId,
        outputBId,
        fieldName,
        valueA,
        valueB,
        isConflict,
      },
    });

    return { outputAId, outputBId, fieldName, valueA, valueB, severity, isConflict };
  }

  /** Returns true when two strings differ only in whitespace / punctuation. */
  private isWhitespaceOnly(a: string, b: string): boolean {
    return this.normalizeText(a) === this.normalizeText(b);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sа-яёăîșțâ]/gi, '')
      .trim();
  }
}

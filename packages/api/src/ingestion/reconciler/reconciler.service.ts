import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParsedOutput } from '../parsers/html-parser.service';

export interface DiffResult {
  outputAId: string;
  outputBId: string;
  fieldName: string;
  valueA: string | null;
  valueB: string | null;
  isConflict: boolean;
}

/**
 * Reconciler – Step 4 of the ingestion pipeline.
 * Compares outputs from multiple parsers and creates diffs.
 */
@Injectable()
export class ReconcilerService {
  private readonly logger = new Logger(ReconcilerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compare HTML parser outputs with Visual parser outputs.
   * For each question found by both parsers, compare key fields.
   */
  async reconcile(
    htmlOutputs: ParsedOutput[],
    visualOutputs: ParsedOutput[],
  ): Promise<DiffResult[]> {
    const diffs: DiffResult[] = [];

    if (visualOutputs.length === 0) {
      this.logger.log('No visual outputs to reconcile against');
      return diffs;
    }

    // Match questions by externalSourceId or by position
    for (const htmlOut of htmlOutputs) {
      const visualMatch = visualOutputs.find(
        (v) =>
          v.externalSourceId &&
          v.externalSourceId === htmlOut.externalSourceId,
      );

      if (!visualMatch) continue;

      // Compare question text
      if (this.normalizeText(htmlOut.questionText) !== this.normalizeText(visualMatch.questionText)) {
        const diff = await this.createDiff(
          htmlOut.id,
          visualMatch.id,
          'questionText',
          htmlOut.questionText,
          visualMatch.questionText,
        );
        diffs.push(diff);
      }

      // Compare answers
      const htmlAnswers = JSON.parse(htmlOut.answersJson);
      const visualAnswers = JSON.parse(visualMatch.answersJson);

      if (htmlAnswers.length !== visualAnswers.length) {
        const diff = await this.createDiff(
          htmlOut.id,
          visualMatch.id,
          'answersCount',
          String(htmlAnswers.length),
          String(visualAnswers.length),
        );
        diffs.push(diff);
      }

      // Compare each answer text and correctness
      const minLen = Math.min(htmlAnswers.length, visualAnswers.length);
      for (let i = 0; i < minLen; i++) {
        if (
          this.normalizeText(htmlAnswers[i].text) !==
          this.normalizeText(visualAnswers[i].text)
        ) {
          const diff = await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            `answer[${i}].text`,
            htmlAnswers[i].text,
            visualAnswers[i].text,
          );
          diffs.push(diff);
        }

        if (htmlAnswers[i].isCorrect !== visualAnswers[i].isCorrect) {
          const diff = await this.createDiff(
            htmlOut.id,
            visualMatch.id,
            `answer[${i}].isCorrect`,
            String(htmlAnswers[i].isCorrect),
            String(visualAnswers[i].isCorrect),
          );
          diffs.push(diff);
        }
      }
    }

    this.logger.log(
      `Reconciler found ${diffs.length} diffs, ` +
        `${diffs.filter((d) => d.isConflict).length} conflicts`,
    );
    return diffs;
  }

  private async createDiff(
    outputAId: string,
    outputBId: string,
    fieldName: string,
    valueA: string | null,
    valueB: string | null,
  ): Promise<DiffResult> {
    const isConflict = true; // Any difference between parsers is a conflict

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

    return { outputAId, outputBId, fieldName, valueA, valueB, isConflict };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sа-яёăîșțâ]/gi, '')
      .trim();
  }
}

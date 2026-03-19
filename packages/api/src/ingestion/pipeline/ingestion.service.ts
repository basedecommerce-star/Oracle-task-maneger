import { Injectable, Logger } from '@nestjs/common';
import { ParserType, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HtmlParserService } from '../parsers/html-parser.service';
import { VisualParserService } from '../parsers/visual-parser.service';
import { ReconcilerService } from '../reconciler/reconciler.service';
import { QuestionValidatorService } from '../validators/question-validator.service';
import { ConfidenceScorerService } from '../confidence/confidence-scorer.service';

/**
 * Core ingestion pipeline – 8-step process ensuring no AI-generated or
 * unverified content reaches users without human review.
 *
 * Step 1: Raw capture (source snapshot)
 * Step 2: Deterministic extraction (HTML parser)
 * Step 3: Secondary extraction (Visual/OCR parser)
 * Step 4: Diff comparison (reconciler)
 * Step 5: Validation rules
 * Step 6: Confidence scoring
 * Step 7: Queue for human moderation
 * Step 8: Publish only after verification
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly htmlParser: HtmlParserService,
    private readonly visualParser: VisualParserService,
    private readonly reconciler: ReconcilerService,
    private readonly validator: QuestionValidatorService,
    private readonly scorer: ConfidenceScorerService,
  ) {}

  /**
   * Run the full ingestion pipeline for a given source snapshot.
   */
  async runPipeline(snapshotId: string): Promise<{
    questionsCreated: number;
    conflicts: number;
    requiresReview: number;
  }> {
    this.logger.log(`Starting ingestion pipeline for snapshot ${snapshotId}`);

    const snapshot = await this.prisma.sourceSnapshot.findUnique({
      where: { id: snapshotId },
      include: { sourceProvider: true },
    });
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} not found`);

    // Step 1: Raw capture is already done (snapshot exists)
    this.logger.log('Step 1: Raw capture — snapshot already stored');

    // Step 2: Deterministic extraction via HTML DOM parser
    this.logger.log('Step 2: Deterministic extraction (HTML parser)');
    const htmlParserRun = await this.createParserRun(snapshotId, ParserType.HTML, snapshot.parserVersion);
    const htmlOutputs = await this.htmlParser.parse(
      snapshot.rawContent ?? '',
      htmlParserRun.id,
    );
    await this.finalizeParserRun(htmlParserRun.id, htmlOutputs.length);

    // Step 3: Secondary extraction via Visual/OCR parser
    this.logger.log('Step 3: Secondary extraction (Visual parser)');
    const visualParserRun = await this.createParserRun(snapshotId, ParserType.VISUAL, snapshot.parserVersion);
    const visualOutputs = await this.visualParser.parse(
      snapshot.screenshotKey ?? '',
      visualParserRun.id,
    );
    await this.finalizeParserRun(visualParserRun.id, visualOutputs.length);

    // Step 4: Diff comparison
    this.logger.log('Step 4: Diff comparison (reconciler)');
    const diffs = await this.reconciler.reconcile(htmlOutputs, visualOutputs);

    // Step 5: Validation rules
    this.logger.log('Step 5: Validation rules');
    const allOutputs = [...htmlOutputs];
    const validationResults = await this.validator.validateAll(allOutputs);

    // Step 6: Confidence scoring
    this.logger.log('Step 6: Confidence scoring');
    const scoredOutputs = await this.scorer.scoreAll(allOutputs, diffs, validationResults);

    // Step 7: Create questions and queue for human moderation
    this.logger.log('Step 7: Queue for human moderation');
    let questionsCreated = 0;
    let requiresReview = 0;

    for (const output of scoredOutputs) {
      const hasConflict = diffs.some(
        (d) => d.isConflict && (d.outputAId === output.id || d.outputBId === output.id),
      );

      let verificationStatus: VerificationStatus;
      if (hasConflict) {
        verificationStatus = VerificationStatus.CONFLICT;
      } else if (output.confidenceScore < 0.8) {
        verificationStatus = VerificationStatus.REVIEW_REQUIRED;
        requiresReview++;
      } else {
        verificationStatus = VerificationStatus.PARSED;
      }

      // Create evidence bundle for provenance
      const evidenceBundle = await this.prisma.evidenceBundle.create({
        data: {
          sourcePageUrl: snapshot.sourceUrl,
          screenshotKey: snapshot.screenshotKey,
          extractedText: output.questionText,
          extractedAnswers: output.answersJson,
          sourceHash: snapshot.contentHash,
        },
      });

      // Find or resolve category/topic
      const category = output.categoryCode
        ? await this.prisma.category.findUnique({ where: { code: output.categoryCode } })
        : null;
      const topic = output.topicCode
        ? await this.prisma.topic.findUnique({ where: { code: output.topicCode } })
        : null;

      // Create the question – isPublished is ALWAYS false until human review (Step 8)
      const country = await this.prisma.country.findFirst();
      if (!country) throw new Error('No country configured in database');

      await this.prisma.question.create({
        data: {
          externalSourceId: output.externalSourceId,
          sourceProviderId: snapshot.sourceProviderId,
          countryId: country.id,
          categoryId: category?.id,
          topicId: topic?.id,
          ticketNumber: output.ticketNumber,
          language: output.language,
          questionText: output.questionText,
          explanationText: output.explanationText,
          ruleReference: output.ruleReference,
          verificationStatus,
          confidenceScore: output.confidenceScore,
          evidenceBundleId: evidenceBundle.id,
          isPublished: false, // Step 8: NEVER auto-publish
          answers: {
            create: this.parseAnswers(output.answersJson),
          },
        },
      });
      questionsCreated++;
    }

    // Step 8: Publish only after human verification
    // (This step is handled by AdminService.publishQuestion)
    this.logger.log(
      `Pipeline complete: ${questionsCreated} questions created, ` +
        `${diffs.filter((d) => d.isConflict).length} conflicts, ` +
        `${requiresReview} require review`,
    );

    return {
      questionsCreated,
      conflicts: diffs.filter((d) => d.isConflict).length,
      requiresReview,
    };
  }

  private async createParserRun(snapshotId: string, parserType: ParserType, parserVersion: string) {
    return this.prisma.parserRun.create({
      data: {
        snapshotId,
        parserType,
        parserVersion,
        status: 'RUNNING',
      },
    });
  }

  private async finalizeParserRun(parserRunId: string, questionsFound: number) {
    await this.prisma.parserRun.update({
      where: { id: parserRunId },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
        questionsFound,
      },
    });
  }

  private parseAnswers(answersJson: string): Array<{
    answerOrder: number;
    answerText: string;
    isCorrect: boolean;
  }> {
    try {
      const answers = JSON.parse(answersJson);
      return answers.map((a: any, index: number) => ({
        answerOrder: a.order ?? index + 1,
        answerText: a.text,
        isCorrect: a.isCorrect ?? false,
      }));
    } catch {
      return [];
    }
  }
}

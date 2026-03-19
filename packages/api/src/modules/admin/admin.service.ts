import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ParserType, VerificationStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { PublicationPolicyService } from '../../ingestion/pipeline/publication-policy.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicationPolicy: PublicationPolicyService,
  ) {}

  async importSourceSnapshot(data: {
    sourceProviderId: string;
    sourceUrl: string;
    sourceType: string;
    rawContent?: string;
    storageKey?: string;
    screenshotKey?: string;
    parserVersion: string;
    adminUserId: string;
  }) {
    const contentHash = this.hashContent(data.rawContent ?? data.storageKey ?? '');

    const snapshot = await this.prisma.sourceSnapshot.create({
      data: {
        sourceProviderId: data.sourceProviderId,
        sourceUrl: data.sourceUrl,
        sourceType: data.sourceType,
        contentHash,
        rawContent: data.rawContent,
        storageKey: data.storageKey,
        screenshotKey: data.screenshotKey,
        parserVersion: data.parserVersion,
      },
    });

    await this.prisma.import.create({
      data: {
        sourceSnapshotId: snapshot.id,
        importedBy: data.adminUserId,
        status: 'PENDING',
      },
    });

    return snapshot;
  }

  async runParser(snapshotId: string, parserType: string) {
    const snapshot = await this.prisma.sourceSnapshot.findUnique({
      where: { id: snapshotId },
    });
    if (!snapshot) throw new NotFoundException('Snapshot not found');

    const parserRun = await this.prisma.parserRun.create({
      data: {
        snapshotId,
        parserType: parserType as ParserType,
        parserVersion: snapshot.parserVersion,
        status: 'RUNNING',
      },
    });

    return { parserRunId: parserRun.id, status: 'RUNNING' };
  }

  async getConflicts() {
    return this.prisma.parserDiff.findMany({
      where: { isConflict: true, resolvedAt: null },
      include: {
        outputA: { include: { parserRun: true } },
        outputB: { include: { parserRun: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveQuestion(questionId: string, moderatorId: string, comment?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const beforeSnapshot = JSON.stringify(question);

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { verificationStatus: VerificationStatus.VERIFIED },
    });

    await this.prisma.moderationEvent.create({
      data: {
        entityType: 'question',
        entityId: questionId,
        action: 'approve',
        beforeSnapshot,
        afterSnapshot: JSON.stringify(updated),
        moderatorId,
        comment,
      },
    });

    return updated;
  }

  async rejectQuestion(questionId: string, moderatorId: string, comment?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const beforeSnapshot = JSON.stringify(question);

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { verificationStatus: VerificationStatus.ARCHIVED },
    });

    await this.prisma.moderationEvent.create({
      data: {
        entityType: 'question',
        entityId: questionId,
        action: 'reject',
        beforeSnapshot,
        afterSnapshot: JSON.stringify(updated),
        moderatorId,
        comment,
      },
    });

    return updated;
  }

  /**
   * Publish: enforces full publication policy.
   * Never allow AI-generated content to be published without human verification
   * and passing all anti-hallucination checks.
   */
  async publishQuestion(questionId: string, moderatorId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    // Run all publication-policy checks
    const check = await this.publicationPolicy.checkPublishability(questionId);
    if (!check.canPublish) {
      throw new BadRequestException(
        `Cannot publish: ${check.reasons.join('; ')}`,
      );
    }

    const beforeSnapshot = JSON.stringify(question);

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        verificationStatus: VerificationStatus.PUBLISHED,
        isPublished: true,
      },
    });

    await this.prisma.moderationEvent.create({
      data: {
        entityType: 'question',
        entityId: questionId,
        action: 'publish',
        beforeSnapshot,
        afterSnapshot: JSON.stringify(updated),
        moderatorId,
      },
    });

    return updated;
  }

  async getEvidence(evidenceBundleId: string) {
    const bundle = await this.prisma.evidenceBundle.findUnique({
      where: { id: evidenceBundleId },
      include: { questions: true, reports: true },
    });
    if (!bundle) throw new NotFoundException('Evidence bundle not found');
    return bundle;
  }

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

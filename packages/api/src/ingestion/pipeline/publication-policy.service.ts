import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PublicationCheck {
  canPublish: boolean;
  reasons: string[];
}

@Injectable()
export class PublicationPolicyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check whether a question meets all publication requirements.
   * A question can only be published if ALL of the following are true:
   * 1. verificationStatus is VERIFIED
   * 2. evidenceBundle exists and is linked
   * 3. Question has at least 2 answers
   * 4. At least one answer is marked correct
   * 5. No unresolved hard conflicts exist
   * 6. confidenceScore for correct answer >= 1.0 (or human-approved override)
   * 7. For non-official sources: moderation event with 'approve' action exists
   */
  async checkPublishability(questionId: string): Promise<PublicationCheck> {
    const reasons: string[] = [];

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: true,
        evidenceBundle: true,
        sourceProvider: true,
      },
    });

    if (!question) {
      return { canPublish: false, reasons: ['Question not found'] };
    }

    // 1. Verification status
    if (question.verificationStatus !== 'VERIFIED') {
      reasons.push(`verificationStatus is ${question.verificationStatus}, must be VERIFIED`);
    }

    // 2. Evidence bundle
    if (!question.evidenceBundleId || !question.evidenceBundle) {
      reasons.push('Missing evidence bundle');
    }

    // 3. Minimum answers
    if (question.answers.length < 2) {
      reasons.push(`Only ${question.answers.length} answer(s), minimum 2 required`);
    }

    // 4. At least one correct answer
    const correctAnswers = question.answers.filter((a) => a.isCorrect);
    if (correctAnswers.length === 0) {
      reasons.push('No correct answer marked');
    }

    // 5. Check for unresolved hard conflicts
    const unresolvedConflicts = await this.prisma.parserDiff.count({
      where: {
        isConflict: true,
        resolvedAt: null,
        outputA: {
          parserRun: {
            snapshot: {
              sourceProvider: {
                id: question.sourceProviderId ?? undefined,
              },
            },
          },
        },
      },
    });

    if (unresolvedConflicts > 0) {
      reasons.push(`${unresolvedConflicts} unresolved parser conflict(s)`);
    }

    // 6. Confidence score check
    if (question.confidenceScore !== null && question.confidenceScore < 1.0) {
      const approvalEvent = await this.prisma.moderationEvent.findFirst({
        where: {
          entityType: 'question',
          entityId: questionId,
          action: 'approve',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!approvalEvent) {
        reasons.push(`Confidence score ${question.confidenceScore} < 1.0 and no manual approval`);
      }
    }

    // 7. Non-official source requires moderation
    if (question.sourceProvider && question.sourceProvider.sourcePriority !== 'A') {
      const moderationApproval = await this.prisma.moderationEvent.findFirst({
        where: {
          entityType: 'question',
          entityId: questionId,
          action: 'approve',
        },
      });

      if (!moderationApproval) {
        reasons.push('Non-official source requires moderation approval');
      }
    }

    return {
      canPublish: reasons.length === 0,
      reasons,
    };
  }
}

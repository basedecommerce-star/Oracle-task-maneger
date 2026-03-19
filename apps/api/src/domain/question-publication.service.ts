import { canPublishQuestion, type VerificationRecord } from '../../../../packages/shared/src/question-verification';
import { reduceModerationState, type ModerationEvent } from '../../../../packages/shared/src/moderation';

export interface QuestionPublicationInput {
  questionId: string;
  verification: VerificationRecord;
  moderationEvents: ModerationEvent[];
}

export interface QuestionPublicationDecision {
  questionId: string;
  allowed: boolean;
  reason: string;
  published: boolean;
}

export function decideQuestionPublication(input: QuestionPublicationInput): QuestionPublicationDecision {
  const publicationDecision = canPublishQuestion(input.verification);
  if (!publicationDecision.allowed) {
    return {
      questionId: input.questionId,
      allowed: false,
      reason: publicationDecision.reason,
      published: false,
    };
  }

  const moderationState = reduceModerationState(input.questionId, input.moderationEvents);
  if (moderationState.rejected) {
    return {
      questionId: input.questionId,
      allowed: false,
      reason: 'Question was rejected by moderation.',
      published: false,
    };
  }

  if (moderationState.needsFix) {
    return {
      questionId: input.questionId,
      allowed: false,
      reason: 'Question still requires fixes before publication.',
      published: false,
    };
  }

  if (!moderationState.approved) {
    return {
      questionId: input.questionId,
      allowed: false,
      reason: 'Question is not approved by moderation yet.',
      published: false,
    };
  }

  return {
    questionId: input.questionId,
    allowed: true,
    reason: 'Question passed verification and moderation checks.',
    published: true,
  };
}

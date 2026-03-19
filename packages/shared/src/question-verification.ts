export type VerificationStatus =
  | 'raw'
  | 'parsed'
  | 'normalized'
  | 'conflict'
  | 'review_required'
  | 'verified'
  | 'published'
  | 'archived';

export type SourcePriority = 'A' | 'B' | 'C';

export interface EvidenceBundle {
  sourceUrl: string;
  sourceSnapshotId: string;
  parserOutputIds: string[];
  parserDiffId?: string;
  moderatorApprovalId?: string;
}

export interface VerificationRecord {
  verificationStatus: VerificationStatus;
  sourcePriority: SourcePriority;
  hasExplicitCorrectAnswer: boolean;
  correctAnswerConfidence: number;
  questionTextConfidence: number;
  answerOptionsConfidence: number;
  evidenceBundle?: EvidenceBundle;
  reviewRequired: boolean;
}

export interface PublicationDecision {
  allowed: boolean;
  reason: string;
}

export function canPublishQuestion(record: VerificationRecord): PublicationDecision {
  if (record.verificationStatus !== 'verified' && record.verificationStatus !== 'published') {
    return {
      allowed: false,
      reason: 'Question is not in a verified state.',
    };
  }

  if (!record.hasExplicitCorrectAnswer) {
    return {
      allowed: false,
      reason: 'Correct answer is not explicitly verified.',
    };
  }

  if (record.correctAnswerConfidence < 1) {
    return {
      allowed: false,
      reason: 'Correct answer confidence must be exactly 1.0.',
    };
  }

  if (record.reviewRequired) {
    return {
      allowed: false,
      reason: 'Question still requires manual review.',
    };
  }

  if (!record.evidenceBundle) {
    return {
      allowed: false,
      reason: 'Evidence bundle is missing.',
    };
  }

  if (!record.evidenceBundle.sourceUrl || !record.evidenceBundle.sourceSnapshotId) {
    return {
      allowed: false,
      reason: 'Evidence bundle is incomplete.',
    };
  }

  return {
    allowed: true,
    reason: 'Question may be published.',
  };
}

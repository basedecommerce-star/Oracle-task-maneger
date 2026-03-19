export interface AdminReviewQueueItemDto {
  questionId: string;
  verificationStatus: string;
  sourcePriority: 'A' | 'B' | 'C';
  reviewRequired: boolean;
  correctAnswerConfidence: number;
  sourceUrl?: string;
  parserDiffId?: string;
}

export interface ApproveQuestionRequestDto {
  questionId: string;
  moderatorId: string;
  comment?: string;
}

export interface RejectQuestionRequestDto {
  questionId: string;
  moderatorId: string;
  comment?: string;
}

export interface PublishQuestionRequestDto {
  questionId: string;
  moderatorId: string;
  comment?: string;
}

export interface AdminModerationActionResponseDto {
  questionId: string;
  action: 'approve' | 'reject' | 'needs_fix' | 'publish' | 'archive';
  accepted: boolean;
  reason: string;
}

export interface EvidenceBundleDto {
  questionId: string;
  sourceUrl: string;
  sourceSnapshotId: string;
  parserOutputIds: string[];
  parserDiffId?: string;
  approvalEventId?: string;
}

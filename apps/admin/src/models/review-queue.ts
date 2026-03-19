export interface ReviewQueueItemModel {
  questionId: string;
  verificationStatus: string;
  sourcePriority: 'A' | 'B' | 'C';
  correctAnswerConfidence: number;
  reviewRequired: boolean;
  sourceUrl?: string;
}

export interface ReviewQueueScreenModel {
  title: string;
  subtitle: string;
  items: ReviewQueueItemModel[];
}

export function buildReviewQueueScreenModel(input: { items: ReviewQueueItemModel[] }): ReviewQueueScreenModel {
  return {
    title: 'Review queue',
    subtitle: 'Inspect parser conflicts and unresolved questions before publication.',
    items: input.items,
  };
}

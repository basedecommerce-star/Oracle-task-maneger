export interface ModerationHistoryItemModel {
  id: string;
  entityId: string;
  entityType: 'question' | 'answer' | 'rule' | 'sign' | 'source_snapshot';
  action: 'approve' | 'reject' | 'needs_fix' | 'publish' | 'archive';
  moderatorId: string;
  comment?: string;
  createdAt: string;
}

export interface ModerationHistoryScreenModel {
  title: string;
  subtitle: string;
  items: ModerationHistoryItemModel[];
}

export function buildModerationHistoryScreenModel(input: { items: ModerationHistoryItemModel[] }): ModerationHistoryScreenModel {
  return {
    title: 'Moderation history',
    subtitle: 'Audit every approval, rejection, publication, and archive action.',
    items: input.items,
  };
}

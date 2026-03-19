export interface SourceSnapshotItemModel {
  id: string;
  sourceProviderName: string;
  sourceUrl: string;
  contentHash: string;
  capturedAt: string;
}

export interface SourceSnapshotsScreenModel {
  title: string;
  subtitle: string;
  items: SourceSnapshotItemModel[];
}

export function buildSourceSnapshotsScreenModel(input: { items: SourceSnapshotItemModel[] }): SourceSnapshotsScreenModel {
  return {
    title: 'Source snapshots',
    subtitle: 'Review captured source states used by parser and moderation workflows.',
    items: input.items,
  };
}

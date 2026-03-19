export interface ImportJobItemModel {
  id: string;
  sourceProviderName: string;
  sourceUrl: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  finishedAt?: string;
  snapshotCount: number;
  questionCount: number;
}

export interface ImportJobsScreenModel {
  title: string;
  subtitle: string;
  items: ImportJobItemModel[];
}

export function buildImportJobsScreenModel(input: { items: ImportJobItemModel[] }): ImportJobsScreenModel {
  return {
    title: 'Import jobs',
    subtitle: 'Track source ingestion runs, captured snapshots, and parsed question volume.',
    items: input.items,
  };
}

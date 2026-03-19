export interface ParserRunItemModel {
  id: string;
  sourceSnapshotId: string;
  parserType: string;
  parserVersion: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  outputCount: number;
}

export interface ParserRunsScreenModel {
  title: string;
  subtitle: string;
  items: ParserRunItemModel[];
}

export function buildParserRunsScreenModel(input: { items: ParserRunItemModel[] }): ParserRunsScreenModel {
  return {
    title: 'Parser runs',
    subtitle: 'Inspect deterministic and visual parser executions, versions, and output volume.',
    items: input.items,
  };
}

export interface ParserConflictItemModel {
  questionId?: string;
  primaryOutputId: string;
  secondaryOutputId: string;
  conflictDetected: boolean;
  confidenceScore: number;
  diffs: Array<{
    field: 'questionText' | 'answers' | 'correctAnswerRef' | 'imageUrl';
    reason: string;
    primaryValue: unknown;
    secondaryValue: unknown;
  }>;
}

export interface ParserConflictsScreenModel {
  title: string;
  subtitle: string;
  items: ParserConflictItemModel[];
}

export function buildParserConflictsScreenModel(input: { items: ParserConflictItemModel[] }): ParserConflictsScreenModel {
  return {
    title: 'Parser conflicts',
    subtitle: 'Compare parser outputs before moderation decisions are made.',
    items: input.items,
  };
}

import { type QuestionCandidate } from '../../../../packages/shared/src/question-selection';

export interface CatalogQuestionRecord extends QuestionCandidate {
  questionText: string;
  language: string;
  explanationText?: string;
  ruleReference?: string;
  imageUrl?: string;
}

export interface QuestionCatalogFilter {
  category?: string;
  topicId?: string;
  ticketNumber?: number;
  language?: string;
  onlyPublished?: boolean;
}

export function filterQuestionCatalog(
  questions: CatalogQuestionRecord[],
  filter: QuestionCatalogFilter,
): CatalogQuestionRecord[] {
  return questions.filter((question) => {
    if (filter.category && question.category !== filter.category) return false;
    if (filter.topicId && question.topicId !== filter.topicId) return false;
    if (filter.ticketNumber !== undefined && question.ticketNumber !== filter.ticketNumber) return false;
    if (filter.language && question.language !== filter.language) return false;
    if (filter.onlyPublished && !question.isPublished) return false;
    return true;
  });
}

export function getQuestionById(
  questions: CatalogQuestionRecord[],
  questionId: string,
): CatalogQuestionRecord | undefined {
  return questions.find((question) => question.id === questionId);
}

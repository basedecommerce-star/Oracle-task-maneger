export interface ErrorQuestionCard {
  questionId: string;
  category: string;
  topicId?: string;
  ticketNumber?: number;
  questionText: string;
  route: string;
}

export interface ErrorsScreenModel {
  title: string;
  subtitle: string;
  questions: ErrorQuestionCard[];
}

export function buildErrorsScreenModel(input: {
  questions: Array<{
    questionId: string;
    category: string;
    topicId?: string;
    ticketNumber?: number;
    questionText: string;
  }>;
}): ErrorsScreenModel {
  return {
    title: 'My errors',
    subtitle: 'Review the questions you missed and launch a focused retry session.',
    questions: input.questions.map((question) => ({
      ...question,
      route: `/errors/${question.questionId}`,
    })),
  };
}

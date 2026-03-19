export interface QuestionOptionModel {
  id: string;
  orderIndex: number;
  text: string;
  selected?: boolean;
  correct?: boolean;
}

export interface QuestionScreenModel {
  title: string;
  category: string;
  progressLabel: string;
  timerLabel?: string;
  questionId: string;
  questionText: string;
  imageUrl?: string;
  options: QuestionOptionModel[];
  explanationText?: string;
  ruleReference?: string;
  canShowExplanation: boolean;
}

export function buildQuestionScreenModel(input: {
  title: string;
  category: string;
  currentIndex: number;
  totalQuestions: number;
  remainingSeconds?: number;
  questionId: string;
  questionText: string;
  imageUrl?: string;
  options: QuestionOptionModel[];
  explanationText?: string;
  ruleReference?: string;
  canShowExplanation: boolean;
}): QuestionScreenModel {
  const minutes = input.remainingSeconds !== undefined ? Math.floor(input.remainingSeconds / 60) : undefined;
  const seconds = input.remainingSeconds !== undefined ? input.remainingSeconds % 60 : undefined;

  return {
    title: input.title,
    category: input.category,
    progressLabel: `${input.currentIndex}/${input.totalQuestions}`,
    timerLabel:
      minutes !== undefined && seconds !== undefined
        ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : undefined,
    questionId: input.questionId,
    questionText: input.questionText,
    imageUrl: input.imageUrl,
    options: input.options,
    explanationText: input.explanationText,
    ruleReference: input.ruleReference,
    canShowExplanation: input.canShowExplanation,
  };
}

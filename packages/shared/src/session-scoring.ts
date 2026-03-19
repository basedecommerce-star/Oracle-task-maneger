import { getExamRule, type ExamCategory } from './exam-config';

export interface SessionAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  answeredAt: Date;
}

export interface SessionScore {
  category: ExamCategory;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  passed: boolean;
}

export function scoreSession(category: ExamCategory, answers: SessionAnswerRecord[]): SessionScore {
  const rule = getExamRule(category);
  const answeredQuestions = answers.length;
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const wrongAnswers = Math.max(answeredQuestions - correctAnswers, 0);
  const unansweredQuestions = Math.max(rule.totalQuestions - answeredQuestions, 0);

  return {
    category,
    totalQuestions: rule.totalQuestions,
    answeredQuestions,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    passed: correctAnswers >= rule.minimumCorrectAnswers,
  };
}

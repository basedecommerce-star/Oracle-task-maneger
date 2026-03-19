export type ExamCategory = 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';

export interface ExamRule {
  category: ExamCategory;
  totalQuestions: number;
  durationMinutes: number;
  minimumCorrectAnswers: number;
  maxWrongAnswers: number;
  officialSource: string;
}

export interface ExamEvaluation {
  category: ExamCategory;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  minimumCorrectAnswers: number;
  passed: boolean;
}

export const EXAM_RULES: Record<ExamCategory, ExamRule> = {
  AB: {
    category: 'AB',
    totalQuestions: 24,
    durationMinutes: 30,
    minimumCorrectAnswers: 22,
    maxWrongAnswers: 2,
    officialSource: 'ASP theoretical exam configuration',
  },
  BE: {
    category: 'BE',
    totalQuestions: 30,
    durationMinutes: 38,
    minimumCorrectAnswers: 27,
    maxWrongAnswers: 3,
    officialSource: 'ASP theoretical exam configuration',
  },
  C: {
    category: 'C',
    totalQuestions: 30,
    durationMinutes: 38,
    minimumCorrectAnswers: 27,
    maxWrongAnswers: 3,
    officialSource: 'ASP theoretical exam configuration',
  },
  CE: {
    category: 'CE',
    totalQuestions: 36,
    durationMinutes: 45,
    minimumCorrectAnswers: 32,
    maxWrongAnswers: 4,
    officialSource: 'ASP theoretical exam configuration',
  },
  D: {
    category: 'D',
    totalQuestions: 30,
    durationMinutes: 38,
    minimumCorrectAnswers: 27,
    maxWrongAnswers: 3,
    officialSource: 'ASP theoretical exam configuration',
  },
  DE: {
    category: 'DE',
    totalQuestions: 36,
    durationMinutes: 45,
    minimumCorrectAnswers: 32,
    maxWrongAnswers: 4,
    officialSource: 'ASP theoretical exam configuration',
  },
  F: {
    category: 'F',
    totalQuestions: 30,
    durationMinutes: 38,
    minimumCorrectAnswers: 27,
    maxWrongAnswers: 3,
    officialSource: 'ASP theoretical exam configuration',
  },
};

export function getExamRule(category: ExamCategory): ExamRule {
  return EXAM_RULES[category];
}

export function evaluateExam(category: ExamCategory, correctAnswers: number, answeredQuestions?: number): ExamEvaluation {
  const rule = getExamRule(category);
  const safeAnswered = answeredQuestions ?? rule.totalQuestions;
  const wrongAnswers = Math.max(safeAnswered - correctAnswers, 0);

  return {
    category,
    totalQuestions: rule.totalQuestions,
    answeredQuestions: safeAnswered,
    correctAnswers,
    wrongAnswers,
    minimumCorrectAnswers: rule.minimumCorrectAnswers,
    passed: correctAnswers >= rule.minimumCorrectAnswers,
  };
}

export interface ExamResultSummaryItem {
  id: 'correct' | 'wrong' | 'unanswered' | 'passed';
  title: string;
  value: string;
}

export interface ExamResultScreenModel {
  title: string;
  subtitle: string;
  category: string;
  summary: ExamResultSummaryItem[];
}

export function buildExamResultScreenModel(input: {
  category: string;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  passed: boolean;
}): ExamResultScreenModel {
  return {
    title: 'Exam result',
    subtitle: input.passed ? 'You passed the session.' : 'You did not pass the session.',
    category: input.category,
    summary: [
      {
        id: 'correct',
        title: 'Correct',
        value: String(input.correctAnswers),
      },
      {
        id: 'wrong',
        title: 'Wrong',
        value: String(input.wrongAnswers),
      },
      {
        id: 'unanswered',
        title: 'Unanswered',
        value: String(input.unansweredQuestions),
      },
      {
        id: 'passed',
        title: 'Status',
        value: input.passed ? 'Passed' : 'Failed',
      },
    ],
  };
}

export interface ExamCategoryCard {
  code: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
  totalQuestions: number;
  durationMinutes: number;
  minimumCorrectAnswers: number;
  description: string;
}

export interface ExamScreenModel {
  title: string;
  subtitle: string;
  categories: ExamCategoryCard[];
}

export function buildExamScreenModel(): ExamScreenModel {
  return {
    title: 'Exam mode',
    subtitle: 'Run a timed session that matches the category rules published by ASP.',
    categories: [
      {
        code: 'AB',
        totalQuestions: 24,
        durationMinutes: 30,
        minimumCorrectAnswers: 22,
        description: 'Passenger car categories with 24 questions and 30 minutes.',
      },
      {
        code: 'BE',
        totalQuestions: 30,
        durationMinutes: 38,
        minimumCorrectAnswers: 27,
        description: 'Trailer category extension with a 30-question timed test.',
      },
      {
        code: 'C',
        totalQuestions: 30,
        durationMinutes: 38,
        minimumCorrectAnswers: 27,
        description: 'Heavy vehicle category with special technical questions.',
      },
      {
        code: 'CE',
        totalQuestions: 36,
        durationMinutes: 45,
        minimumCorrectAnswers: 32,
        description: 'Heavy vehicle with trailer extension and extended timer.',
      },
      {
        code: 'D',
        totalQuestions: 30,
        durationMinutes: 38,
        minimumCorrectAnswers: 27,
        description: 'Passenger transport category with extra safety focus.',
      },
      {
        code: 'DE',
        totalQuestions: 36,
        durationMinutes: 45,
        minimumCorrectAnswers: 32,
        description: 'Passenger transport with trailer extension and longer exam.',
      },
      {
        code: 'F',
        totalQuestions: 30,
        durationMinutes: 38,
        minimumCorrectAnswers: 27,
        description: 'Agricultural and other special category practice exam.',
      },
    ],
  };
}

export interface StartExamRequestDto {
  category: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
}

export interface StartExamResponseDto {
  sessionId: string;
  category: string;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: string;
  questionIds: string[];
}

export interface SubmitExamAnswerRequestDto {
  sessionId: string;
  questionId: string;
  selectedAnswerIds: string[];
}

export interface SubmitExamAnswerResponseDto {
  sessionId: string;
  accepted: boolean;
  answeredQuestions: number;
  remainingQuestions: number;
}

export interface FinishExamResponseDto {
  sessionId: string;
  category: string;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  passed: boolean;
  expired: boolean;
}

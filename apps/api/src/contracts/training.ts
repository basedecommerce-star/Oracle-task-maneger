export interface StartTrainingRequestDto {
  category: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
  limit?: number;
  topicId?: string;
  ticketNumber?: number;
}

export interface StartTrainingResponseDto {
  sessionId: string;
  category: string;
  totalQuestions: number;
  questionIds: string[];
}

export interface SubmitTrainingAnswerRequestDto {
  sessionId: string;
  questionId: string;
  selectedAnswerIds: string[];
}

export interface SubmitTrainingAnswerResponseDto {
  sessionId: string;
  questionId: string;
  isCorrect: boolean;
  correctAnswerIds: string[];
  explanationText?: string;
  ruleReference?: string;
}

export interface PublicAnswerDto {
  id: string;
  orderIndex: number;
  text: string;
}

export interface PublicQuestionDto {
  id: string;
  category: string;
  topicId?: string;
  ticketNumber?: number;
  language: string;
  questionText: string;
  imageUrl?: string;
  answers: PublicAnswerDto[];
}

export interface TrainingQuestionResultDto {
  questionId: string;
  isCorrect: boolean;
  correctAnswerIds: string[];
  explanationText?: string;
  ruleReference?: string;
}

export interface QuestionReportRequestDto {
  questionId: string;
  userId: string;
  type: 'wrong_answer' | 'wrong_text' | 'wrong_image' | 'outdated_question' | 'other';
  comment?: string;
}

export interface QuestionReportResponseDto {
  questionId: string;
  accepted: boolean;
  recheckRequired: boolean;
}

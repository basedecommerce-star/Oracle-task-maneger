export interface CategoryDto {
  code: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
  totalQuestions: number;
  durationMinutes: number;
  minimumCorrectAnswers: number;
  maxWrongAnswers: number;
}

export interface TopicDto {
  id: string;
  name: string;
  slug: string;
  category?: string;
}

export interface TicketDto {
  category: string;
  ticketNumber: number;
  questionCount: number;
}

export interface CatalogResponseDto {
  categories: CategoryDto[];
  topics: TopicDto[];
  tickets: TicketDto[];
}

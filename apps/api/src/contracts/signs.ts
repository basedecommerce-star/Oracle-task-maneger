export interface SignDto {
  id: string;
  code?: string;
  title: string;
  language: string;
  category: string;
  imageUrl?: string;
  description: string;
}

export interface SignListRequestDto {
  category?: string;
  language?: string;
}

export interface SignListResponseDto {
  results: SignDto[];
}

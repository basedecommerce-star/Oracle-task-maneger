export interface RuleDto {
  id: string;
  slug: string;
  title: string;
  language: string;
  chapter?: string;
  content: string;
}

export interface RuleSearchRequestDto {
  query: string;
  language?: string;
}

export interface RuleSearchResponseDto {
  query: string;
  results: RuleDto[];
}

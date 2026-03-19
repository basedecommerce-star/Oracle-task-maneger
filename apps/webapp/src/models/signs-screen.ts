export interface SignCardModel {
  id: string;
  code?: string;
  title: string;
  category: string;
  language: string;
  imageUrl?: string;
  route: string;
}

export interface SignsScreenModel {
  title: string;
  subtitle: string;
  signs: SignCardModel[];
}

export function buildSignsScreenModel(input: {
  signs: Array<{ id: string; code?: string; title: string; category: string; language: string; imageUrl?: string }>;
}): SignsScreenModel {
  return {
    title: 'Road signs',
    subtitle: 'Study sign categories, descriptions, and visual references.',
    signs: input.signs.map((sign) => ({
      id: sign.id,
      code: sign.code,
      title: sign.title,
      category: sign.category,
      language: sign.language,
      imageUrl: sign.imageUrl,
      route: `/signs/${sign.id}`,
    })),
  };
}

export interface RuleCardModel {
  id: string;
  slug: string;
  title: string;
  language: string;
  chapter?: string;
  route: string;
}

export interface RulesScreenModel {
  title: string;
  subtitle: string;
  rules: RuleCardModel[];
}

export function buildRulesScreenModel(input: {
  rules: Array<{ id: string; slug: string; title: string; language: string; chapter?: string }>;
}): RulesScreenModel {
  return {
    title: 'Rules',
    subtitle: 'Browse the rulebook and open specific articles referenced by training questions.',
    rules: input.rules.map((rule) => ({
      id: rule.id,
      slug: rule.slug,
      title: rule.title,
      language: rule.language,
      chapter: rule.chapter,
      route: `/rules/${rule.slug}`,
    })),
  };
}

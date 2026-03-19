export interface RuleRecord {
  id: string;
  slug: string;
  title: string;
  language: string;
  chapter?: string;
  content: string;
}

export interface RuleCatalogFilter {
  language?: string;
  query?: string;
}

function normalize(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

export function filterRulesCatalog(rules: RuleRecord[], filter: RuleCatalogFilter): RuleRecord[] {
  const query = normalize(filter.query);

  return rules.filter((rule) => {
    if (filter.language && rule.language !== filter.language) return false;
    if (!query) return true;

    const haystack = [rule.slug, rule.title, rule.chapter ?? '', rule.content].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

export function getRuleBySlug(rules: RuleRecord[], slug: string, language?: string): RuleRecord | undefined {
  return rules.find((rule) => rule.slug === slug && (!language || rule.language === language));
}

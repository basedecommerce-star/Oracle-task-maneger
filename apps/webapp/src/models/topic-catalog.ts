export interface TopicCatalogCard {
  id: string;
  name: string;
  slug: string;
  category?: string;
  route: string;
}

export interface TopicCatalogScreenModel {
  title: string;
  subtitle: string;
  topics: TopicCatalogCard[];
}

export function buildTopicCatalogScreenModel(input: {
  topics: Array<{ id: string; name: string; slug: string; category?: string }>;
}): TopicCatalogScreenModel {
  return {
    title: 'Topics',
    subtitle: 'Train by focused themes like road signs, intersections, parking, and priority.',
    topics: input.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      category: topic.category,
      route: `/topics/${topic.slug}`,
    })),
  };
}

export interface RoadSignRecord {
  id: string;
  code?: string;
  title: string;
  language: string;
  category: string;
  imageUrl?: string;
  description: string;
}

export interface RoadSignFilter {
  category?: string;
  language?: string;
  query?: string;
}

function normalize(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

export function filterRoadSigns(signs: RoadSignRecord[], filter: RoadSignFilter): RoadSignRecord[] {
  const query = normalize(filter.query);

  return signs.filter((sign) => {
    if (filter.category && sign.category !== filter.category) return false;
    if (filter.language && sign.language !== filter.language) return false;
    if (!query) return true;

    const haystack = [sign.code ?? '', sign.title, sign.description, sign.category].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

export function getRoadSignById(signs: RoadSignRecord[], signId: string): RoadSignRecord | undefined {
  return signs.find((sign) => sign.id === signId);
}

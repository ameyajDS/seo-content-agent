import { SearchResult } from '@/types';

export async function webSearch(queries: string[]): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn('[Search] TAVILY_API_KEY not set — returning mock results');
    return getMockResults(queries);
  }

  const results: SearchResult[] = [];

  for (const query of queries.slice(0, 3)) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'basic',
          max_results: 3,
          include_answer: false,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();

      for (const r of data.results ?? []) {
        results.push({
          title: r.title,
          url: r.url,
          snippet: r.content?.slice(0, 400) ?? '',
        });
      }
    } catch {
      console.error(`[Search] Query failed: ${query}`);
    }
  }

  return results;
}

function getMockResults(queries: string[]): SearchResult[] {
  return queries.slice(0, 3).map((q, i) => ({
    title: `Research insight ${i + 1}: ${q}`,
    url: `https://example.com/research/${i + 1}`,
    snippet: `Comprehensive research findings related to "${q}". This area has seen significant development in recent years with multiple studies confirming key trends and best practices that experts recommend following.`,
  }));
}

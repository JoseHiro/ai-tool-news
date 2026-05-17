export interface Article {
  title: string
  url: string
  source: string
  score: number
}

async function fetchHN(query: string): Promise<Article[]> {
  const since = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000)
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=8`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.hits.map((h: { title: string; url?: string; objectID: string; points?: number }) => ({
    title: h.title,
    url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    source: 'Hacker News',
    score: h.points ?? 0,
  }))
}

async function fetchReddit(subreddit: string, sort: 'new' | 'top', timeframe?: string): Promise<Article[]> {
  const path = sort === 'top' ? `top.json?t=${timeframe ?? 'week'}&limit=8` : 'new.json?limit=8'
  const url = `https://www.reddit.com/r/${subreddit}/${path}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DevKnow/1.0 (personal dashboard)' },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.data.children.map((c: { data: { title: string; url: string; score: number } }) => ({
    title: c.data.title,
    url: c.data.url,
    source: `Reddit r/${subreddit}`,
    score: c.data.score,
  }))
}

export async function fetchArticles(): Promise<Article[]> {
  const results = await Promise.allSettled([
    fetchHN('claude code developer'),
    fetchHN('anthropic claude api feature'),
    fetchReddit('ClaudeAI', 'new'),
    fetchReddit('SideProject', 'top', 'week'),
    fetchReddit('indiehackers', 'top', 'week'),
    fetchReddit('entrepreneur', 'top', 'week'),
  ])
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

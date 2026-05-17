import type { MetadataRoute } from 'next'
import { getDocDates } from '@/lib/docs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dates = await getDocDates()
  const now = new Date()

  return [
    { url: '/', lastModified: now },
    { url: '/ideas', lastModified: now },
    { url: '/tips', lastModified: now },
    ...dates.map(date => ({
      url: `/digests/${date}`,
      lastModified: new Date(date),
    })),
  ]
}

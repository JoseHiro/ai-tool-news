import { redirect } from 'next/navigation'
import { getDocDates } from '@/lib/docs'

export default async function DigestsIndexPage() {
  const dates = await getDocDates()
  redirect(dates.length > 0 ? `/digests/${dates[0]}` : '/digests/2026-06-02')
}

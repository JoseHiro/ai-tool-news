'use client'

import { useEffect, useState } from 'react'
import type { SubHeading } from '@/lib/docs'

const SECTION_META: Record<string, { tag: string; label: string }> = {
  '🆕': { tag: 'UPDATE', label: 'Claude アップデート' },
  '💡': { tag: 'STORIES', label: '成功事例' },
  '💰': { tag: 'IDEAS', label: 'アイデア' },
}

function getSectionMeta(heading: string) {
  for (const [emoji, meta] of Object.entries(SECTION_META)) {
    if (heading.includes(emoji)) return meta
  }
  return { tag: 'NOTE', label: heading.replace(/^[^\s]+\s/, '') }
}

export type ToCSection = {
  heading: string
  sub: SubHeading[]
}

export function DigestToC({ sections }: { sections: ToCSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach((section, i) => {
      const ids = section.sub.length > 0
        ? section.sub.map(({ subIndex: j }) => `section-${i}-sub-${j}`)
        : [`section-${i}`]

      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (!el) return
        const obs = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
          { rootMargin: '-10% 0px -60% 0px' }
        )
        obs.observe(el)
        observers.push(obs)
      })
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  if (!sections.length) return null

  return (
    <nav className="sticky top-10">
      <p
        style={{ color: 'var(--text-muted)' }}
        className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
      >
        目次
      </p>
      <ul className="space-y-1">
        {sections.map((section, i) => {
          const meta = getSectionMeta(section.heading)
          const sectionId = `section-${i}`
          const isSectionActive =
            activeId === sectionId ||
            section.sub.some(({ subIndex: j }) => activeId === `${sectionId}-sub-${j}`)

          return (
            <li key={i}>
              <a
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  color: isSectionActive ? 'var(--text)' : 'var(--text-muted)',
                  borderLeft: `2px solid ${isSectionActive ? 'var(--accent)' : 'transparent'}`,
                }}
                className="flex items-center gap-2 py-1.5 pl-3 text-xs transition-colors hover:text-[var(--text)]"
              >
                <span
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  className="shrink-0 rounded px-1 py-px text-[8px] font-bold uppercase tracking-widest"
                >
                  {meta.tag}
                </span>
                <span className="truncate">{meta.label}</span>
              </a>

              {section.sub.length > 0 && (
                <ul className="mt-0.5 mb-1 space-y-0.5">
                  {section.sub.map(({ label, subIndex: j }) => {
                    const subId = `${sectionId}-sub-${j}`
                    const isSubActive = activeId === subId
                    return (
                      <li key={j}>
                        <a
                          href={`#${subId}`}
                          onClick={(e) => {
                            e.preventDefault()
                            const el = document.getElementById(subId)
                            if (!el) return
                            if (el.getAttribute('aria-expanded') === 'false') {
                              ;(el as HTMLButtonElement).click()
                              setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 160)
                            } else {
                              el.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                          style={{ color: isSubActive ? 'var(--text)' : 'var(--text-muted)' }}
                          className="flex items-center gap-1.5 py-0.5 pl-5 text-[11px] leading-snug transition-colors hover:text-[var(--text)]"
                        >
                          <span className="shrink-0 opacity-40">–</span>
                          <span className="truncate">{label}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

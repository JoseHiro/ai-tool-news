'use client'

import { useEffect, useState } from 'react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s぀-ヿ㐀-䶿一-鿿]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

export function GuideToC({ sections }: { sections: string[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sections.forEach(heading => {
      const id = `h2-${slugify(heading)}`
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-5% 0px -70% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
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
      <ul className="space-y-0.5">
        {sections.map(heading => {
          const id = `h2-${slugify(heading)}`
          const isActive = activeId === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={e => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                }}
                className="block py-1.5 pl-3 text-xs leading-snug transition-colors hover:text-[var(--text)]"
              >
                {heading}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

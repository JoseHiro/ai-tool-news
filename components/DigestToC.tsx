'use client'

import { useEffect, useState } from 'react'
import type { SubHeading } from '@/lib/docs'

export type ToCSection = { heading: string; sub: SubHeading[] }
export type PopularTopic = { title: string; likeCount: number }


const IDEA_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6']

function HeartIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}


export function DigestToC({
  sections,
  popularTopics = [],
  popularIdeas = [],
  showModelGuide = false,
}: {
  sections: ToCSection[]
  popularTopics?: PopularTopic[]
  popularIdeas?: PopularTopic[]
  showModelGuide?: boolean
}) {
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

  if (!sections.length && !popularTopics.length && !popularIdeas.length) return null

  return (
    <nav className="sticky top-10 space-y-6">
      {/* ── 目次 ── */}
      {sections.length > 0 && (
        <div
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }} className="mb-2 text-[10px] font-bold uppercase tracking-widest">
            目次
          </p>
          <ul className="space-y-0.5">
            {sections.map((section, i) => {
              const sectionId = `section-${i}`
              const isSectionActive =
                activeId === sectionId ||
                section.sub.some(({ subIndex: j }) => activeId === `${sectionId}-sub-${j}`)
              const label = section.heading.replace(/^[^\s]+\s/, '')

              return (
                <li key={i}>
                  <a
                    href={`#${sectionId}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    style={{
                      color: isSectionActive ? 'var(--accent)' : 'var(--text-muted)',
                      borderLeft: `2px solid ${isSectionActive ? 'var(--accent)' : 'transparent'}`,
                    }}
                    className="flex items-start gap-2 py-1.5 pl-3 text-xs leading-snug transition-colors hover:text-[var(--accent)]"
                  >
                    <span className="mt-0.5 shrink-0 text-[10px]">{isSectionActive ? '→' : '+'}</span>
                    <span className="line-clamp-2">{label}</span>
                  </a>
                  {section.sub.length > 0 && (
                    <ul className="mt-0.5 mb-1 space-y-0.5">
                      {section.sub.map(({ label: subLabel, subIndex: j }) => {
                        const subId = `${sectionId}-sub-${j}`
                        const isSubActive = activeId === subId
                        return (
                          <li key={j}>
                            <a
                              href={`#${subId}`}
                              onClick={(e) => {
                                e.preventDefault()
                                document.getElementById(subId)?.scrollIntoView({ behavior: 'smooth' })
                              }}
                              style={{ color: isSubActive ? 'var(--accent)' : 'var(--text-muted)' }}
                              className="flex items-start gap-1.5 py-0.5 pl-6 text-[11px] leading-snug transition-colors hover:text-[var(--text)]"
                            >
                              <span className="mt-0.5 shrink-0">・</span>
                              <span className="line-clamp-2">{subLabel}</span>
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
        </div>
      )}

      {/* ── モデル使い分けガイド ── */}
      {showModelGuide && (
        <a
          href="/guides/claude-model-guide"
          style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}
          className="flex items-start gap-3 transition-colors hover:border-[var(--accent)]"
        >
          <span className="mt-0.5 text-base">💡</span>
          <div className="min-w-0">
            <p style={{ color: 'var(--text)' }} className="mb-0.5 text-xs font-semibold leading-snug">
              モデル使い分けガイド
            </p>
            <p style={{ color: 'var(--text-muted)' }} className="text-[10px] leading-snug">
              Opus / Sonnet / Haiku をどう選ぶか
            </p>
            <p style={{ color: 'var(--accent)' }} className="mt-1.5 text-[10px] font-semibold">
              ガイドを読む →
            </p>
          </div>
        </a>
      )}

      {/* ── 今週の人気トピック ── */}
      {popularTopics.length > 0 && (
        <div
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }} className="mb-2 text-[10px] font-bold uppercase tracking-widest">
            今週の人気トピック
          </p>
          <ul className="space-y-2.5">
            {popularTopics.map((topic, i) => (
              <li key={i} className="flex items-center gap-2.5">
                {i < 3 ? (
                  <span
                    style={{ background: 'var(--accent)', color: '#fff' }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  >
                    {i + 1}
                  </span>
                ) : (
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-medium"
                  >
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0">
                  <p style={{ color: 'var(--text)' }} className="text-xs font-medium leading-snug line-clamp-1">
                    {topic.title}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }} className="flex items-center gap-1 text-[10px]">
                    <HeartIcon /> {topic.likeCount.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 人気のアイデア ── */}
      {popularIdeas.length > 0 && (
        <div
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }} className="mb-2 text-[10px] font-bold uppercase tracking-widest">
            人気のアイデア
          </p>
          <ul className="space-y-2.5">
            {popularIdeas.map((idea, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div
                  style={{ background: `${IDEA_COLORS[i % IDEA_COLORS.length]}20`, color: IDEA_COLORS[i % IDEA_COLORS.length] }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                >
                  💡
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ color: 'var(--text)' }} className="text-xs font-medium leading-snug line-clamp-1">
                    {idea.title}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }} className="flex items-center gap-1 text-[10px]">
                    <HeartIcon /> {idea.likeCount.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <a
            href="/ideas"
            style={{ color: 'var(--accent)' }}
            className="mt-3 block text-[11px] font-medium transition-opacity hover:opacity-75"
          >
            すべてのアイデアを見る →
          </a>
        </div>
      )}

    </nav>
  )
}

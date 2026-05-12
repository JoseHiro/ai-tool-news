import type { ReactNode } from 'react'

const SECTION_META: Record<string, { tag: string; label: string }> = {
  '🆕': { tag: 'UPDATE', label: 'Claude / Claude Code' },
  '💡': { tag: 'STORIES', label: '個人開発成功事例' },
  '💰': { tag: 'IDEAS', label: 'マネタイズアイデア' },
}

function getSectionMeta(heading: string) {
  for (const [emoji, meta] of Object.entries(SECTION_META)) {
    if (heading.includes(emoji)) return meta
  }
  return { tag: 'NOTE', label: heading }
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /(https?:\/\/[^\s)\]>]+|\*\*(.*?)\*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[0].startsWith('http')) {
      const url = m[0]
      nodes.push(
        <a key={m.index} href={url} target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--accent)' }} className="break-all underline">
          {url.length > 55 ? url.slice(0, 55) + '…' : url}
        </a>
      )
    } else {
      nodes.push(<strong key={m.index} style={{ color: 'var(--text)', fontWeight: 600 }}>{m[2]}</strong>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes.length ? nodes : [text]
}

type ListItem = { text: string; sub: boolean }
type Section = { heading: string; lines: string[] }

function parseSections(content: string): Section[] {
  const sections: Section[] = []
  let current: Section | null = null
  for (const line of content.split('\n')) {
    if (line.startsWith('### ')) {
      if (current) sections.push(current)
      current = { heading: line.slice(4), lines: [] }
    } else if (line.startsWith('【') || line.startsWith('# ')) {
      // skip title line
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
}

function renderLines(lines: string[]): ReactNode {
  const nodes: ReactNode[] = []
  let buffer: ListItem[] = []

  function flushList(key: string) {
    if (!buffer.length) return
    const items: ReactNode[] = []
    let i = 0
    while (i < buffer.length) {
      if (!buffer[i].sub) {
        const subs: string[] = []
        let j = i + 1
        while (j < buffer.length && buffer[j].sub) subs.push(buffer[j++].text)
        items.push(
          <li key={i} style={{ color: 'var(--text)' }} className="text-sm leading-relaxed">
            <span>{parseInline(buffer[i].text)}</span>
            {subs.length > 0 && (
              <ul className="mt-1.5 space-y-1 pl-3 border-l" style={{ borderColor: 'var(--border)' }}>
                {subs.map((s, si) => (
                  <li key={si} className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {parseInline(s)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
        i = j
      } else {
        i++
      }
    }
    nodes.push(<ul key={key} className="space-y-3">{items}</ul>)
    buffer = []
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      buffer.push({ text: line.slice(2), sub: false })
    } else if (/^ {2,}- /.test(line)) {
      buffer.push({ text: line.replace(/^ +- /, ''), sub: true })
    } else {
      flushList(`ul-${i}`)
      if (line.trim() === '' || line.match(/^---+$/)) return
      nodes.push(
        <p key={i} style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
          {parseInline(line)}
        </p>
      )
    }
  })
  flushList('ul-end')

  return <div className="space-y-3">{nodes}</div>
}

export function parseSectionHeadings(content: string): string[] {
  return content.split('\n').filter((l) => l.startsWith('### ')).map((l) => l.slice(4))
}

export function DigestContent({ content, indexOffset = 0 }: { content: string; indexOffset?: number }) {
  const sections = parseSections(content)
  if (!sections.length) return null

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const meta = getSectionMeta(section.heading)
        return (
          <div
            key={i}
            id={`section-${indexOffset + i}`}
            style={{ border: '1px solid var(--border)' }}
            className="overflow-hidden rounded-xl"
          >
            {/* Card header */}
            <div
              style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)' }}
              className="flex items-center gap-2.5 px-5 py-3"
            >
              <span
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
              >
                {meta.tag}
              </span>
              <h3 style={{ color: 'var(--text)' }} className="text-sm font-semibold">
                {meta.label}
              </h3>
            </div>
            {/* Card body */}
            <div style={{ background: 'var(--bg)' }} className="px-5 py-4">
              {renderLines(section.lines)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

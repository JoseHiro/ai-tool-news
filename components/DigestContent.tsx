import type { ReactNode } from 'react'

const SECTION_COLORS: [string, string][] = [
  ['🆕', '#7c3aed'],
  ['💡', '#16a34a'],
  ['💰', '#d97706'],
]

function sectionColor(heading: string): string {
  for (const [emoji, color] of SECTION_COLORS) {
    if (heading.includes(emoji)) return color
  }
  return '#6b7280'
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
      nodes.push(<strong key={m.index} style={{ color: 'var(--text)' }}>{m[2]}</strong>)
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
              <ul className="mt-1 space-y-0.5 pl-3">
                {subs.map((s, si) => (
                  <li key={si} className="flex gap-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-0.5 shrink-0">·</span>
                    <span>{parseInline(s)}</span>
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
    nodes.push(<ul key={key} className="space-y-2">{items}</ul>)
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

  return <div className="space-y-2">{nodes}</div>
}

export function DigestContent({ content }: { content: string }) {
  const sections = parseSections(content)
  if (!sections.length) return null

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const color = sectionColor(section.heading)
        return (
          <div
            key={i}
            style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${color}`,
            }}
            className="rounded-lg p-5"
          >
            <h3 style={{ color: 'var(--text)' }} className="mb-3 text-sm font-semibold">
              {section.heading}
            </h3>
            {renderLines(section.lines)}
          </div>
        )
      })}
    </div>
  )
}

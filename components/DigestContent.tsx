import type { ReactNode } from 'react'

function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text)' }}>{part}</strong> : part
  )
}

export function DigestContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const nodes: ReactNode[] = []
  let listBuffer: string[] = []

  function flushList(key: string) {
    if (listBuffer.length === 0) return
    nodes.push(
      <ul key={key} className="mb-4 space-y-1.5 pl-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            <span style={{ color: 'var(--text-muted)' }} className="mt-0.5 shrink-0">–</span>
            <span>{parseBold(item)}</span>
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2))
      return
    }

    flushList(`ul-${i}`)

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} style={{ color: 'var(--text)' }} className="mb-2 mt-7 text-base font-semibold">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} style={{ color: 'var(--text)' }} className="mb-2 mt-8 text-lg font-semibold">
          {line.slice(3)}
        </h2>
      )
    } else if (line.match(/^---+$/)) {
      nodes.push(<hr key={i} style={{ borderColor: 'var(--border)' }} className="my-6" />)
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={i} style={{ borderColor: 'var(--accent)', color: 'var(--text-muted)' }} className="my-4 border-l-2 pl-4 text-sm italic">
          {parseBold(line.slice(2))}
        </blockquote>
      )
    } else if (line.startsWith('【') || line.startsWith('#')) {
      // Skip the title line (already shown as page heading)
    } else if (line.trim() === '') {
      nodes.push(<div key={i} className="h-1" />)
    } else {
      nodes.push(
        <p key={i} style={{ color: 'var(--text)' }} className="text-sm leading-relaxed">
          {parseBold(line)}
        </p>
      )
    }
  })

  flushList('ul-end')

  return <div>{nodes}</div>
}

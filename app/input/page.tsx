'use client'

import { useState, useEffect } from 'react'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export default function InputPage() {
  const today = todayJST()
  const [notes, setNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/input?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes ?? [])
        setLoading(false)
      })
  }, [today])

  function addNote() {
    const trimmed = newNote.trim()
    if (!trimmed) return
    setNotes((prev) => [...prev, trimmed])
    setNewNote('')
    setSaved(false)
  }

  function removeNote(i: number) {
    setNotes((prev) => prev.filter((_, idx) => idx !== i))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, notes }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
        手動メモ
      </p>
      <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
        今日のメモ
      </h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm">
        今日気になった記事のURL・ツール・気づきを追加してください。Digest生成時に使われます。
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">読み込み中...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
              placeholder="URLやメモを入力してEnter"
              style={{
                background: 'var(--sidebar-bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              onClick={addNote}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              追加
            </button>
          </div>

          {notes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              メモはまだありません。
            </p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note, i) => (
                <li
                  key={i}
                  style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border)' }}
                  className="flex items-start justify-between gap-3 rounded-lg p-3"
                >
                  <span style={{ color: 'var(--text)' }} className="break-all text-sm">
                    {note}
                  </span>
                  <button
                    onClick={() => removeNote(i)}
                    style={{ color: 'var(--text-muted)' }}
                    className="shrink-0 transition hover:text-red-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
            {saved && (
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">
                保存しました
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export type Command = { id: string; label: string; hint?: string; group: string; run: () => void }

export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return commands
    return commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(s))
  }, [q, commands])

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null
      setQ('')
      setIdx(0)
      requestAnimationFrame(() => input.current?.focus())
    } else {
      lastFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => setIdx(0), [q])

  if (!open) return null

  const exec = (c: Command | undefined) => {
    if (!c) return
    onClose()
    window.setTimeout(c.run, 10)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIdx((i) => (i + 1) % Math.max(list.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIdx((i) => (i - 1 + list.length) % Math.max(list.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      exec(list[idx])
    } else if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="palette-input mono">
          <span aria-hidden="true">›</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="type a command…"
            aria-label="Search commands"
            aria-controls="palette-list"
            aria-activedescendant={list[idx] ? `cmd-${list[idx].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" className="palette-list" role="listbox">
          {list.length === 0 && <li className="palette-empty mono">no matching command</li>}
          {list.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === idx}
              className={i === idx ? 'is-active' : ''}
              onMouseEnter={() => setIdx(i)}
              onClick={() => exec(c)}
            >
              <span className="pc-group mono">{c.group}</span>
              <span className="pc-label">{c.label}</span>
              {c.hint && <span className="pc-hint mono">{c.hint}</span>}
            </li>
          ))}
        </ul>
        <div className="palette-foot mono">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}

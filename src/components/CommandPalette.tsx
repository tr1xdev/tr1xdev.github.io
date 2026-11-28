import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from '../ui'

const listRow = 'grid min-h-11 grid-cols-[64px_1fr_auto] items-center gap-3 rounded-[8px] px-3'

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
    <div className="fixed inset-0 z-50 grid animate-[fade_0.15s_ease-out] [place-items:start_center] bg-[rgba(0,0,0,0.62)] px-4 pt-[14vh] pb-4 backdrop-blur-[4px]" onMouseDown={onClose}>
      <div
        className="w-[min(100%,560px)] animate-[rise_0.18s_var(--ease-smooth)] overflow-hidden rounded-card border border-line-2 bg-surface-solid [box-shadow:0_32px_80px_rgba(0,0,0,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-b-line px-4 font-mono">
          <span className="font-bold text-accent-ink" aria-hidden="true">›</span>
          <input
            className="h-14 flex-1 [border:0] [background:transparent] [font:16px_var(--font-mono)] text-ink [outline:none]"
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
        <ul id="palette-list" className="max-h-90 overflow-y-auto p-1.5" role="listbox">
          {list.length === 0 && (
            <li className={cn(listRow, 'cursor-default py-4 font-mono text-[13px] text-ink-3')}>no matching command</li>
          )}
          {list.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === idx}
              className={cn(listRow, 'group cursor-pointer py-0 aria-selected:bg-surface-2 aria-selected:[box-shadow:inset_2px_0_0_var(--color-accent)]')}
              onMouseEnter={() => setIdx(i)}
              onClick={() => exec(c)}
            >
              <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase group-aria-selected:text-accent-ink">{c.group}</span>
              <span>{c.label}</span>
              {c.hint && <span className="font-mono text-[12px] opacity-60">{c.hint}</span>}
            </li>
          ))}
        </ul>
        <div className="flex gap-4 border-t border-t-line px-4 py-2.5 font-mono text-[11px] text-ink-3">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}

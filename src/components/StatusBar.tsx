import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { isMac, useClock } from '../hooks'
import { cn, led } from '../ui'

const pad = (n: number) => String(n).padStart(2, '0')

const item = 'inline-flex items-center gap-2 border-r border-r-line px-3.5 whitespace-nowrap'
const key = 'text-ink-3'

export function StatusBar({ section, onPalette }: { section: string; onPalette: () => void }) {
  const time = useClock(profile.timezone, true)
  const [start] = useState(() => Date.now())
  const [up, setUp] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setUp(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => window.clearInterval(t)
  }, [start])

  const uptime = `${pad(Math.floor(up / 3600))}:${pad(Math.floor((up % 3600) / 60))}:${pad(up % 60)}`

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-40 flex h-(--bar) items-stretch border-t border-t-line bg-[rgba(10,10,11,0.82)] font-mono text-[11.5px] text-ink-2 backdrop-blur-[10px] print:hidden"
      aria-label="Status bar"
    >
      <span className={cn(item, 'text-live-ink')}>
        <span className={led} aria-hidden="true" /> online
      </span>
      {time && (
        <span className={item}>
          <span className={key}>local</span> {time} {profile.tzLabel.split(' ')[0]}
        </span>
      )}
      <span className={cn(item, 'sm-down:hidden')}>
        <span className={key}>session</span> {uptime}
      </span>
      <span className={cn(item, 'sm-down:hidden')}>
        <span className={key}>§</span> {section}
      </span>
      <button
        type="button"
        className="ml-auto inline-flex cursor-pointer items-center gap-2 border-0 border-l border-l-line bg-transparent px-3.5 py-0 font-mono text-[11.5px] whitespace-nowrap text-ink-2 hover:text-ink"
        onClick={onPalette}
      >
        <kbd className="text-[10.5px]">{isMac ? '⌘' : 'Ctrl'} K</kbd> commands
      </button>
    </footer>
  )
}

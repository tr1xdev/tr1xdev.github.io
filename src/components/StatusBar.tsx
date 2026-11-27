import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { isMac, useClock } from '../hooks'

const pad = (n: number) => String(n).padStart(2, '0')

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
    <footer className="statusbar mono" aria-label="Status bar">
      <span className="sb-item sb-online">
        <span className="led" aria-hidden="true" /> online
      </span>
      <span className="sb-item">
        <span className="sb-k">local</span> {time} {profile.tzLabel.split(' ')[0]}
      </span>
      <span className="sb-item sb-hide-sm">
        <span className="sb-k">session</span> {uptime}
      </span>
      <span className="sb-item sb-hide-sm">
        <span className="sb-k">§</span> {section}
      </span>
      <button type="button" className="sb-item sb-cmd" onClick={onPalette}>
        <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd> commands
      </button>
    </footer>
  )
}

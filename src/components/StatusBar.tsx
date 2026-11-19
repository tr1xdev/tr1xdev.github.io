import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { isMac } from '../hooks'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: profile.timezone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function StatusBar({ section, onPalette }: { section: string; onPalette: () => void }) {
  const [now, setNow] = useState(() => new Date())
  const [start] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const up = Math.floor((now.getTime() - start) / 1000)
  const uptime = `${pad(Math.floor(up / 3600))}:${pad(Math.floor((up % 3600) / 60))}:${pad(up % 60)}`

  return (
    <footer className="statusbar mono" aria-label="Status bar">
      <span className="sb-item sb-online">
        <span className="led" aria-hidden="true" /> online
      </span>
      <span className="sb-item">
        <span className="sb-k">tr1x local</span> {fmt.format(now)} {profile.tzLabel.split(' ')[0]}
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

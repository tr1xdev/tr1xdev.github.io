import { useEffect, useState } from 'react'
import { profile, sections } from '../data/profile'
import { isMac } from '../hooks'

type Props = { active: string | null; onGo: (id: string) => void; onPalette: () => void }

export function Nav({ active, onGo, onPalette }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    onGo(id)
  }

  const links = sections.map((s) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      className={active === s.id ? 'is-active' : undefined}
      aria-current={active === s.id ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
    >
      {s.label}
    </a>
  ))

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap topbar-in">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            go('top')
          }}
        >
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">
            tr1x<span>/dev</span>
          </span>
        </a>
        <nav className="nav mono" aria-label="Sections">
          {links}
        </nav>
        <div className="topbar-actions">
          <button type="button" className="cmd-btn mono" onClick={onPalette} aria-label="Open command palette">
            <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <a
            className="btn btn-primary btn-sm"
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              go('contact')
            }}
          >
            Hire me
          </a>
          <button
            type="button"
            className="menu-btn mono"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-icon" aria-hidden="true" />
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" className="mnav" aria-label="Sections" hidden={!open}>
        {links}
        <a className="mnav-gh mono" href={profile.links.github} target="_blank" rel="noreferrer">
          github.com/{profile.githubUser} ↗
        </a>
      </nav>
    </header>
  )
}

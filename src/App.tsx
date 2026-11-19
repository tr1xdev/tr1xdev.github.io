import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { profile, sections } from './data/profile'
import { Pinout } from './components/Pinout'
import { Process } from './components/Process'
import { Work } from './components/Work'
import { Stats } from './components/Stats'
import { CommandPalette } from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import { StatusBar } from './components/StatusBar'
import { isMac, useActiveSection } from './hooks'

const ids = sections.map((s) => s.id)

function SectionHead({ no, title, aside }: { no: string; title: string; aside?: ReactNode }) {
  return (
    <header className="sec-head">
      <span className="sec-no mono">§{no}</span>
      <h2 className="sec-title">{title}</h2>
      <span className="sec-aside mono">{aside ?? `${profile.partNo} · datasheet`}</span>
    </header>
  )
}

export default function App() {
  const [palette, setPalette] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const active = useActiveSection(ids)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text)
        notify(`${label} copied to clipboard`)
      } catch {
        notify('Clipboard unavailable')
      }
    },
    [notify],
  )

  const go = useCallback((id: string) => {
    setMenu(false)
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (id === 'top') window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    else document.getElementById(id)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((o) => !o)
        return
      }
      if (e.key === 'Escape') setMenu(false)
      const t = e.target as HTMLElement
      if (palette || e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [palette])

  // Lock page scroll behind the open mobile menu.
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', menu)
  }, [menu])

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      ...sections.map((s) => ({
        id: `go-${s.id}`,
        group: 'go to',
        label: `${s.no} · ${s.label}`,
        run: () => go(s.id),
      })),
      { id: 'gh', group: 'open', label: 'GitHub profile', hint: '↗', run: () => window.open(profile.links.github, '_blank', 'noopener') },
      { id: 'copy-gh', group: 'copy', label: 'GitHub URL', run: () => copy(profile.links.github, 'GitHub URL') },
      { id: 'copy-site', group: 'copy', label: 'Link to this site', run: () => copy(profile.site, 'Site URL') },
      { id: 'print', group: 'export', label: 'Print datasheet', run: () => window.print() },
      { id: 'top', group: 'go to', label: '00 · Top', run: () => go('top') },
    ]
    if (profile.links.email) {
      list.splice(6, 0, { id: 'copy-mail', group: 'copy', label: 'Email address', run: () => copy(profile.links.email, 'Email') })
    }
    if (profile.links.telegram) {
      list.splice(6, 0, { id: 'tg', group: 'open', label: 'Telegram', hint: '↗', run: () => window.open(profile.links.telegram, '_blank', 'noopener') })
    }
    return list
  }, [copy, go])

  const current = sections.find((s) => s.id === active)
  const kbd = isMac ? '⌘K' : 'Ctrl K'

  const navLinks = sections.map((s) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      className={active === s.id ? 'is-active' : ''}
      aria-current={active === s.id ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
    >
      <span className="nav-no">{s.no}</span> {s.label}
    </a>
  ))

  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>

      <header className={`topbar${menu ? ' is-open' : ''}`}>
        <div className="wrap topbar-in">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); go('top') }}>
            <span className="brand-chip" aria-hidden="true" />
            <span className="brand-name">tr1x<span>/dev</span></span>
          </a>
          <nav className="nav mono" aria-label="Sections">
            {navLinks}
          </nav>
          <button type="button" className="cmd-btn mono" onClick={() => setPalette(true)} aria-label="Open command palette">
            <kbd>{kbd}</kbd>
          </button>
          <button
            type="button"
            className="menu-btn mono"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="menu-icon" aria-hidden="true" />
            {menu ? 'close' : 'menu'}
          </button>
        </div>
        <nav id="mobile-nav" className="mnav mono" aria-label="Sections" hidden={!menu}>
          {navLinks}
          <a className="mnav-gh" href={profile.links.github} target="_blank" rel="noreferrer">
            github.com/{profile.githubUser} ↗
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="top" aria-label="Intro">
          <div className="wrap">
            <p className="eyebrow mono">
              <span className="led" aria-hidden="true" /> {profile.partNo} <span className="sep">/</span> {profile.revision}{' '}
              <span className="sep">/</span> {profile.location}, {profile.tzLabel}
            </p>
            <h1 className="hero-name" aria-label={profile.handle}>
              <span className="hn-a">tr1x</span>
              <span className="hn-b">dev</span>
            </h1>
            <svg className="hero-trace" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 20H420l14-16 18 32 18-32 18 32 14-16H760l10-10 10 10H1200" />
            </svg>
            <div className="hero-row">
              <p className="lede">
                <strong>Backend &amp; systems developer.</strong> I build services that talk over the network, data that has to stay
                correct, and tools that make the rest of the stack faster. Go and Rust at the core, gRPC and Kafka on the wire,
                PostgreSQL underneath.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn btn-ink" onClick={() => go('work')}>
                  See the work <span aria-hidden="true">↓</span>
                </button>
                <a className="btn btn-line" href={profile.links.github} target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <dl className="specs">
              <div>
                <dt className="mono">core</dt>
                <dd>Go · Rust</dd>
              </div>
              <div>
                <dt className="mono">wire</dt>
                <dd>gRPC · Kafka</dd>
              </div>
              <div>
                <dt className="mono">storage</dt>
                <dd>Postgres · Redis</dd>
              </div>
              <div>
                <dt className="mono">status</dt>
                <dd className="dd-status">
                  <span className="led" aria-hidden="true" /> Open to projects
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="about" className="sec">
          <div className="wrap">
            <SectionHead no="01" title="General description" />
            <div className="overview">
              <p className="overview-lead">
                I’m a backend developer who likes the parts of a system nobody sees: <em>protocols, queues, storage</em> and the failure
                modes between them. Most of my time goes into services in Go and Rust; the rest goes into low-level side projects and ML
                experiments.
              </p>
              <div className="features">
                <h3 className="mono">Features</h3>
                <ul>
                  <li>Backend services &amp; system architecture</li>
                  <li>Message-driven pipelines on Kafka, gRPC and Protobuf</li>
                  <li>Low-level code in Rust, C and C++</li>
                  <li>Machine learning, mostly hands-on experiments</li>
                  <li>Tests, profiling and observability from day one</li>
                  <li>Side projects shipped end-to-end</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="sec">
          <div className="wrap">
            <SectionHead no="02" title="Application examples" aside="selected work · live from github" />
            <Work />
          </div>
        </section>

        <section id="stack" className="sec">
          <div className="wrap">
            <SectionHead no="03" title="Pin configuration" aside="22-pin DIP · top view" />
            <Pinout />
          </div>
        </section>

        <section id="process" className="sec sec-inset">
          <div className="wrap">
            <SectionHead no="04" title="Operating principles" aside="spec → ship" />
            <Process />
          </div>
        </section>

        <section id="specs" className="sec">
          <div className="wrap">
            <SectionHead no="05" title="Electrical characteristics" aside="measured live" />
            <Stats />
          </div>
        </section>

        <section id="contact" className="sec sec-contact">
          <div className="wrap">
            <SectionHead no="06" title="Ordering information" />
            <div className="order">
              <table className="order-table">
                <tbody>
                  <tr>
                    <th scope="row" className="mono">part number</th>
                    <td>{profile.partNo}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">handle</th>
                    <td>{profile.handle}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">time zone</th>
                    <td>{profile.tzLabel}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">interface</th>
                    <td>GitHub{profile.links.email ? ' · Email' : ''}{profile.links.telegram ? ' · Telegram' : ''}</td>
                  </tr>
                </tbody>
              </table>
              <div className="order-cta">
                <p className="mono muted">Open to backend work, collaborations and odd side projects.</p>
                <a className="mega-link" href={profile.links.github} target="_blank" rel="noreferrer">
                  <span>github.com/</span>
                  {profile.githubUser}
                  <span className="arrow" aria-hidden="true">↗</span>
                </a>
                <div className="order-actions">
                  <button type="button" className="btn btn-line" onClick={() => copy(profile.links.github, 'GitHub URL')}>
                    Copy link
                  </button>
                  {profile.links.email && (
                    <a className="btn btn-line" href={`mailto:${profile.links.email}`}>
                      Email
                    </a>
                  )}
                  {profile.links.telegram && (
                    <a className="btn btn-line" href={profile.links.telegram} target="_blank" rel="noreferrer">
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
            <p className="colophon mono">
              <span>© {new Date().getFullYear()} {profile.handle}</span>
              <span>react + typescript + vite</span>
              <span>hosted on github pages</span>
              <span className="colophon-kbd">
                press <kbd>{kbd}</kbd>
              </span>
            </p>
          </div>
        </section>
      </main>

      <StatusBar section={current ? `${current.no} ${current.label.toLowerCase()}` : '00 top'} onPalette={() => setPalette(true)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
      <div className={`toast mono${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

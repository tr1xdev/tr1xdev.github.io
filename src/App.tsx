import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { profile, sections } from './data/profile'
import { DitherBackground } from './dither/DitherBackground'
import { About } from './components/About'
import { CommandPalette } from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Pinout } from './components/Pinout'
import { Process } from './components/Process'
import { Section } from './components/Section'
import { Stats } from './components/Stats'
import { StatusBar } from './components/StatusBar'
import { Work } from './components/Work'
import { isMac, prefersReducedMotion, useActiveSection, useRevealOnScroll } from './hooks'
import { cn } from './ui'

const ids = sections.map((s) => s.id)

export default function App() {
  const [palette, setPalette] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const active = useActiveSection(ids)
  useRevealOnScroll()

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
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    if (id === 'top') window.scrollTo({ top: 0, behavior })
    else document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
    // Keep the address bar shareable: tr1xdev.github.io/#work opens on that section.
    history.replaceState(null, '', id === 'top' ? location.pathname + location.search : `#${id}`)
  }, [])

  // The sections mount after the browser's own jump to the URL fragment, so honour /#section links here.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((o) => !o)
        return
      }
      const target = e.target as HTMLElement
      if (palette || e.metaKey || e.ctrlKey || e.altKey || target.closest('input, textarea, [contenteditable="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [palette])

  const commands = useMemo<Command[]>(() => {
    const open = (url: string) => () => window.open(url, '_blank', 'noopener')
    return [
      { id: 'top', group: 'go to', label: '00 · Top', run: () => go('top') },
      ...sections.map((s) => ({ id: `go-${s.id}`, group: 'go to', label: `${s.no} · ${s.label}`, run: () => go(s.id) })),
      { id: 'gh', group: 'open', label: 'GitHub profile', hint: '↗', run: open(profile.links.github) },
      ...(profile.links.telegram ? [{ id: 'tg', group: 'open', label: 'Telegram', hint: '↗', run: open(profile.links.telegram) }] : []),
      ...(profile.links.email ? [{ id: 'copy-mail', group: 'copy', label: 'Email address', run: () => copy(profile.links.email, 'Email') }] : []),
      { id: 'copy-gh', group: 'copy', label: 'GitHub URL', run: () => copy(profile.links.github, 'GitHub URL') },
      { id: 'copy-site', group: 'copy', label: 'Link to this site', run: () => copy(profile.site, 'Site URL') },
      { id: 'source', group: 'open', label: 'Source code of this site', hint: '↗', run: open(`${profile.links.github}/${profile.githubUser}.github.io`) },
      { id: 'print', group: 'export', label: 'Print / save as PDF', run: () => window.print() },
    ]
  }, [copy, go])

  const current = sections.find((s) => s.id === active)

  return (
    <>
      <DitherBackground />
      <a
        className="fixed top-3 left-3 z-100 -translate-y-[200%] rounded-control bg-accent px-4 py-2.5 font-semibold text-on-accent focus:translate-y-0 print:hidden"
        href="#about"
      >
        Skip to content
      </a>

      <Nav active={active} onGo={go} onPalette={() => setPalette(true)} />

      <main className="relative z-1">
        <Hero onGo={go} />

        <Section id="about" no="01" title="About" kicker="who’s behind the handle">
          <About />
        </Section>

        <Section id="work" no="02" title="Selected work" kicker="live from github · hover a cover">
          <Work />
        </Section>

        <Section id="stack" no="03" title="Stack" kicker="22-pin DIP · hover the pins">
          <Pinout />
        </Section>

        <Section id="process" no="04" title="How I work" kicker="spec → ship">
          <Process />
        </Section>

        <Section id="github" no="05" title="GitHub, live" kicker="measured on page load">
          <Stats />
        </Section>

        <Section id="contact" no="06" title="Contact" kicker="let’s talk">
          <Contact onCopy={copy} />
          <p className="flex flex-wrap gap-x-7 gap-y-2 pt-14 pb-10 font-mono text-[12px] text-ink-3">
            <span>© {new Date().getFullYear()} {profile.handle}</span>
            <span>react + typescript + webgl</span>
            <a className="hover:text-ink" href={`${profile.links.github}/${profile.githubUser}.github.io`} target="_blank" rel="noreferrer">
              source on github ↗
            </a>
            <span className="ml-auto sm-down:hidden">
              press <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
            </span>
          </p>
        </Section>
      </main>

      <StatusBar section={current ? `${current.no} ${current.label.toLowerCase()}` : '00 top'} onPalette={() => setPalette(true)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
      <div
        className={cn(
          'pointer-events-none fixed bottom-[calc(var(--bar)+16px)] left-1/2 z-60 -translate-x-1/2 rounded-pill bg-accent px-4 py-2.5 font-mono text-[13px] font-semibold text-on-accent',
          '[transition:opacity_0.2s,translate_0.2s_var(--ease-smooth)] print:hidden',
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </>
  )
}

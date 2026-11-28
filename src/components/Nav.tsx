import { useEffect, useState } from 'react'
import { profile, sections } from '../data/profile'
import { isMac } from '../hooks'
import { button, cn, wrap } from '../ui'

type Props = { active: string | null; onGo: (id: string) => void; onPalette: () => void }

const desktopLink = 'relative rounded-[8px] px-2.5 py-2 [transition:color_0.2s,background_0.2s] hover:bg-[rgba(242,240,235,0.05)] hover:text-ink'
const desktopActive =
  "text-ink after:absolute after:bottom-0.5 after:left-1/2 after:-ml-0.5 after:size-1 after:bg-accent after:content-['']"
const mobileLink = 'flex items-baseline gap-3.5 border-b border-b-line py-3 text-[32px] font-semibold tracking-[-0.03em]'

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

  // The same links render twice: inline on desktop, as a full-screen list on narrow screens.
  const links = (mobile: boolean) =>
    sections.map((s) => {
      const current = active === s.id
      return (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={mobile ? mobileLink : cn(desktopLink, current ? desktopActive : 'text-ink-2')}
          aria-current={current ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault()
            go(s.id)
          }}
        >
          <span
            className={cn(
              'mr-1.5 lg-down:hidden',
              mobile ? 'font-(family-name:--font-mono) text-[13px] font-normal tracking-normal text-accent-ink' : 'text-ink-3',
            )}
          >
            {s.no}
          </span>
          {s.label}
        </a>
      )
    })

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b [transition:background_0.3s,border-color_0.3s] print:hidden',
        scrolled || open
          ? 'border-line bg-[rgba(10,10,11,0.72)] backdrop-blur-[14px] backdrop-saturate-[140%]'
          : 'border-b-transparent',
      )}
    >
      <div className={cn(wrap, 'flex h-(--topbar) items-center gap-6')}>
        <a
          className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em]"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            go('top')
          }}
        >
          {/* A tiny dithered square: accent with a dot screen punched into it. */}
          <span
            className="size-3.5 rounded-[2px] [background:radial-gradient(var(--color-bg)_0.9px,transparent_1.1px)_0_0/3px_3px,var(--color-accent)]"
            aria-hidden="true"
          />
          <span>
            tr1x<span className="text-ink-3">/dev</span>
          </span>
        </a>
        <nav className="ml-auto flex gap-1 font-mono text-[12.5px] md-down:hidden" aria-label="Sections">
          {links(false)}
        </nav>
        <div className="flex items-center gap-2.5 md-down:ml-auto">
          <button
            type="button"
            className="group cursor-pointer border-0 bg-transparent p-0 font-mono sm-down:hidden"
            onClick={onPalette}
            aria-label="Open command palette"
          >
            <kbd className="group-hover:border-line-3 group-hover:text-ink">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <a
            className={button('primary', 'sm')}
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
            className="group hidden size-10 cursor-pointer place-items-center rounded-pill border border-line-2 bg-[rgba(10,10,11,0.55)] font-mono md-down:grid"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {/* Two bars that turn into a cross while the menu is open. */}
            <span
              className={cn(
                'relative block h-[1.5px] w-4 -translate-y-[3px] bg-ink transition-transform duration-250 ease-smooth',
                'group-aria-expanded:translate-y-0 group-aria-expanded:rotate-45',
                "before:absolute before:top-1.5 before:block before:h-[1.5px] before:w-4 before:bg-ink before:transition-transform before:duration-250 before:ease-smooth before:content-['']",
                'group-aria-expanded:before:-translate-y-1.5 group-aria-expanded:before:-rotate-90',
              )}
              aria-hidden="true"
            />
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        className="fixed inset-x-0 top-(--topbar) bottom-0 flex flex-col gap-1 overflow-y-auto bg-[rgba(10,10,11,0.96)] px-(--gutter) py-6 md-up:hidden [&[hidden]]:hidden"
        aria-label="Sections"
        hidden={!open}
      >
        {links(true)}
        <a
          className="mt-4 flex items-baseline gap-3.5 py-3 font-mono text-[14px] font-normal tracking-[-0.03em] text-ink-2"
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
        >
          github.com/{profile.githubUser} ↗
        </a>
      </nav>
    </header>
  )
}

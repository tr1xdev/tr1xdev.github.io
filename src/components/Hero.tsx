import { pins, profile, specs } from '../data/profile'
import { useClock } from '../hooks'
import { button, cn, wrap } from '../ui'
import { Scramble } from './Scramble'

const ticker = pins.map((p) => p.name)

export function Hero({ onGo }: { onGo: (id: string) => void }) {
  const time = useClock(profile.timezone)

  return (
    <section
      id="top"
      aria-label="Intro"
      className={cn(
        'relative flex min-h-svh flex-col justify-end pt-[calc(var(--topbar)+40px)] print:min-h-0',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-1 print:before:hidden',
        'before:bg-[radial-gradient(ellipse_70%_60%_at_18%_62%,rgba(10,10,11,0.78),transparent_70%)]',
      )}
    >
      <div className={cn(wrap, 'pb-[clamp(40px,6vh,72px)]')}>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2.5 font-mono text-[12px] text-ink-2">
          {profile.availability && <span className="text-live-ink">{profile.availability}</span>}
          {(profile.location || time) && (
            <span>
              {profile.location}
              {profile.location && time && <span className="text-ink-3"> / </span>}
              {time && (
                <>
                  <time>{time}</time> local
                </>
              )}
            </span>
          )}
        </p>

        <h1 className="mt-5 ml-[-0.05em] flex items-end text-[clamp(92px,20vw,300px)] leading-[0.8] font-[650] tracking-[-0.07em] print:text-[96px]">
          <Scramble text="tr1x" />
          <Scramble
            text="dev"
            className="pe-[0.07em] text-transparent [--scramble-stroke:var(--color-ink-2)] [-webkit-text-stroke:max(1px,0.012em)_var(--scramble-stroke)] print:[-webkit-text-stroke-color:#999]"
          />
          <span
            aria-hidden="true"
            className="mb-[0.04em] ml-[0.08em] inline-block h-[0.66em] w-[0.1em] animate-[blink_1.1s_steps(1)_infinite] bg-accent"
          />
        </h1>

        <p className="mt-[clamp(20px,3vw,36px)] text-[clamp(24px,3.2vw,40px)] leading-[1.1] font-[550] tracking-[-0.035em]">{profile.role}</p>
        <p className="mt-3.5 max-w-[580px] text-[clamp(16px,1.4vw,18px)] text-ink-2">{profile.lede}</p>

        <div className="mt-7 flex flex-wrap gap-2.5 xs-down:*:flex-auto print:hidden">
          <button type="button" className={button('primary')} onClick={() => onGo('work')}>
            See selected work <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className={button('ghost')} onClick={() => onGo('contact')}>
            Get in touch
          </button>
          <a className={button('ghost')} href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>

        <dl className="mt-[clamp(40px,6vh,64px)] grid grid-cols-4 border-t border-line-2 md-down:grid-cols-2">
          {specs.map((s) => (
            <div key={s.key} className="border-l border-line px-4 pt-4 first:border-l-0 first:pl-0 md-down:nth-3:border-l-0 md-down:nth-3:pl-0">
              <dt className="font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">{s.key}</dt>
              <dd className="mt-1 text-[15px] font-medium">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'group/ticker overflow-hidden border-y border-line bg-[rgba(10,10,11,0.7)] font-mono text-[12px] tracking-[0.12em] text-ink-3 uppercase print:hidden',
          '[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]',
        )}
      >
        <div className="flex w-max animate-[ticker_60s_linear_infinite] group-hover/ticker:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <span key={copy} className="flex">
              {ticker.map((t) => (
                <span key={t} className="py-3.5 after:mx-5.5 after:text-accent after:content-['▪']">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

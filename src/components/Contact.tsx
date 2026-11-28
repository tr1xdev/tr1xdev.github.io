import { profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { horizon } from '../dither/patterns'
import { useInView } from '../hooks'
import { arrow, button, card, cn } from '../ui'

export function Contact({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '0px' })

  return (
    <div className={cn(card, 'min-h-[520px] overflow-hidden bg-[#0b0b0d] sm-down:min-h-[480px]')} ref={ref} data-reveal>
      <DitherCanvas
        field={horizon}
        width={240}
        height={110}
        play={inView}
        startAt={0.5}
        className="absolute inset-x-0 top-auto bottom-0 opacity-95 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_55%)] sm-down:left-[-40%] sm-down:w-[180%] print:hidden!"
      />
      <div className="relative flex flex-col items-start gap-6 p-[clamp(28px,5vw,64px)]">
        {profile.availability && <p className="m-0 font-mono text-[12px] text-live-ink">{profile.availability}</p>}
        <p className="max-w-[900px] text-[length:clamp(38px,6vw,84px)] leading-[0.95] font-semibold tracking-[-0.055em] text-balance">
          Let’s build something that holds up <em className="text-accent">under load.</em>
        </p>
        <a
          className="group inline-flex items-baseline gap-0.5 border-b-2 border-b-line-2 text-[length:clamp(22px,3.2vw,38px)] font-medium tracking-[-0.03em] transition-[border-color] duration-200 hover:border-b-accent"
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-ink-3">github.com/</span>
          {profile.githubUser}
          <span className={cn(arrow, 'ml-2 text-accent')} aria-hidden="true">
            ↗
          </span>
        </a>
        <div className="flex flex-wrap gap-2.5">
          {profile.links.email && (
            <a className={button('primary')} href={`mailto:${profile.links.email}`}>
              Email me
            </a>
          )}
          {profile.links.telegram && (
            <a className={button('ghost')} href={profile.links.telegram} target="_blank" rel="noreferrer">
              Telegram ↗
            </a>
          )}
          {profile.links.email && (
            <button type="button" className={button('ghost')} onClick={() => onCopy(profile.links.email, 'Email')}>
              Copy email
            </button>
          )}
          <button type="button" className={button('ghost')} onClick={() => onCopy(profile.links.github, 'GitHub URL')}>
            Copy GitHub link
          </button>
        </div>
      </div>
    </div>
  )
}

import { profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { horizon } from '../dither/patterns'
import { useInView } from '../hooks'

export function Contact({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '0px' })

  return (
    <div className="contact card" ref={ref}>
      <DitherCanvas field={horizon} width={240} height={110} play={inView} startAt={0.5} className="contact-art" />
      <div className="contact-in">
        <p className="contact-title">
          Let’s build something that holds up <em>under load.</em>
        </p>
        <a className="mega-link" href={profile.links.github} target="_blank" rel="noreferrer">
          <span className="mega-dim">github.com/</span>
          {profile.githubUser}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <div className="contact-actions">
          {profile.links.email && (
            <a className="btn btn-primary" href={`mailto:${profile.links.email}`}>
              Email me
            </a>
          )}
          {profile.links.telegram && (
            <a className="btn btn-ghost" href={profile.links.telegram} target="_blank" rel="noreferrer">
              Telegram ↗
            </a>
          )}
          {profile.links.email && (
            <button type="button" className="btn btn-ghost" onClick={() => onCopy(profile.links.email, 'Email')}>
              Copy email
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => onCopy(profile.links.github, 'GitHub URL')}>
            Copy GitHub link
          </button>
        </div>
      </div>
    </div>
  )
}

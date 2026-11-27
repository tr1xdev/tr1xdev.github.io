import { profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { horizon } from '../dither/patterns'
import { useInView } from '../hooks'

export function Contact({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '0px' })
  const { email, telegram, github } = profile.links

  return (
    <div className="contact card" ref={ref}>
      <DitherCanvas field={horizon} width={240} height={110} play={inView} startAt={0.5} className="contact-art" />
      <div className="contact-in">
        <p className="contact-lede">
          {email ? 'Email is the fastest way to reach me.' : 'The fastest way to reach me is GitHub.'}
          {profile.availability && ` ${profile.availability}.`}
        </p>
        {email ? (
          <a className="mega-link" href={`mailto:${email}`}>
            {email}
          </a>
        ) : (
          <a className="mega-link" href={github} target="_blank" rel="noreferrer">
            <span className="mega-dim">github.com/</span>
            {profile.githubUser}
          </a>
        )}
        <div className="contact-actions">
          {email && (
            <button type="button" className="btn btn-primary" onClick={() => onCopy(email, 'Email')}>
              Copy email
            </button>
          )}
          {telegram && (
            <a className="btn btn-ghost" href={telegram} target="_blank" rel="noreferrer">
              Telegram <span aria-hidden="true">↗</span>
            </a>
          )}
          {email && (
            <a className="btn btn-ghost" href={github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => onCopy(github, 'GitHub URL')}>
            Copy GitHub link
          </button>
        </div>
      </div>
    </div>
  )
}

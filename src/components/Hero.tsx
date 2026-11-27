import { profile } from '../data/profile'
import { useClock } from '../hooks'

export function Hero({ onGo }: { onGo: (id: string) => void }) {
  const time = useClock(profile.timezone)

  return (
    <section className="hero" id="top" aria-label="Intro">
      <div className="wrap hero-in">
        <h1 className="hero-name">
          tr1x<span className="hero-name-dim">dev</span>
        </h1>

        <p className="hero-role">{profile.role}</p>
        <p className="hero-lede">{profile.lede}</p>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onGo('work')}>
            See selected work <span aria-hidden="true">↓</span>
          </button>
          <a className="btn btn-ghost" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>

        <p className="hero-meta mono">
          {profile.location}, <time>{time}</time> local time
        </p>
      </div>
    </section>
  )
}

import { profile } from '../data/profile'
import { useClock } from '../hooks'

export function Hero({ onGo }: { onGo: (id: string) => void }) {
  const { time, offset } = useClock(profile.timezone)
  const [solid, outlined] = profile.wordmark

  return (
    <section className="hero" id="top" aria-label="Intro">
      <div className="wrap hero-in">
        <h1 className="hero-name">
          {solid}
          {outlined && <span className="hero-name-dim">{outlined}</span>}
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

        {(profile.location || time) && (
          <p className="hero-meta mono">
            {profile.location}
            {profile.location && time && ', '}
            {time && (
              <>
                <time>{time}</time> local time ({offset})
              </>
            )}
          </p>
        )}
      </div>
    </section>
  )
}

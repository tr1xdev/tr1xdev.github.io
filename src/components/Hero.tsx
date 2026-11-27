import { profile, specs } from '../data/profile'
import { useClock } from '../hooks'

export function Hero({ onGo }: { onGo: (id: string) => void }) {
  const time = useClock(profile.timezone)

  return (
    <section className="hero" id="top" aria-label="Intro">
      <div className="wrap hero-in">
        <p className="hero-eyebrow mono">
          {profile.availability && <span>{profile.availability}</span>}
          <span>
            {profile.location}, <time>{time}</time> local time
          </span>
        </p>

        <h1 className="hero-name">
          tr1x<span className="hero-name-dim">dev</span>
          <span className="hero-mark" aria-hidden="true" />
        </h1>

        <p className="hero-role">{profile.role}</p>
        <p className="hero-lede">{profile.lede}</p>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onGo('work')}>
            See selected work <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onGo('contact')}>
            Get in touch
          </button>
          <a className="btn btn-ghost" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>

        <dl className="hero-specs">
          {specs.map((s) => (
            <div key={s.key}>
              <dt className="mono">{s.key}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

    </section>
  )
}

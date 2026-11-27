import { pins, profile, specs } from '../data/profile'
import { useClock } from '../hooks'
import { Scramble } from './Scramble'

const ticker = pins.map((p) => p.name)

export function Hero({ onGo }: { onGo: (id: string) => void }) {
  const time = useClock(profile.timezone)

  return (
    <section className="hero" id="top" aria-label="Intro">
      <div className="wrap hero-in">
        <p className="hero-eyebrow mono">
          {profile.availability && (
            <span className="pill pill-live">
              <span className="led" aria-hidden="true" />
              {profile.availability}
            </span>
          )}
          <span className="hero-meta">
            {profile.location} <span className="sep">/</span> <time>{time}</time> local
          </span>
        </p>

        <h1 className="hero-name">
          <Scramble text="tr1x" />
          <Scramble text="dev" className="hero-name-dim" />
          <span className="hero-caret" aria-hidden="true" />
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

      <div className="ticker mono" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy} className="ticker-group">
              {ticker.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

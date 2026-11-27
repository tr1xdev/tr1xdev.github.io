import { profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'

const ACTIVE_DAYS = 90

export function Stats() {
  const state = useRepos()
  const langs = useLanguages()
  const repos = state.status === 'ok' ? state.repos : []
  const rows = langs.status === 'ok' ? mix(langs.total) : []
  const langReady = langs.status === 'ok'
  const distinct = langReady ? Object.keys(langs.total).length : 0
  const bytes = langReady && langs.basis === 'bytes' ? Object.values(langs.total).reduce((a, b) => a + b, 0) : 0
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0)
  const active = repos.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < ACTIVE_DAYS * 86_400_000).length

  const placeholder = state.status === 'error' ? '—' : '…'
  const v = (x: string | number, ready: boolean) => (ready ? String(x) : placeholder)
  const ready = state.status === 'ok'

  const tiles = [
    { label: 'Public repositories', value: v(repos.length, ready) },
    { label: `Active in the last ${ACTIVE_DAYS} days`, value: v(active, ready) },
    { label: 'Languages in use', value: v(distinct, langReady) },
    { label: 'Code measured', value: v(bytes ? `${(bytes / 1024).toFixed(0)} KiB` : '—', langReady) },
    { label: 'Stars received', value: v(stars, ready) },
    { label: 'Last push', value: v(repos[0] ? ago(repos[0].pushed_at) : '—', ready) },
  ]

  const basis = langReady && langs.basis === 'repos' ? 'by repository (API limit)' : 'by bytes of code'

  return (
    <div className="stats">
      <dl className="tiles" aria-busy={state.status === 'loading'}>
        {tiles.map((t) => (
          <div key={t.label} className="tile card">
            <dt className="mono">{t.label}</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>

      <figure className="card mix">
        <figcaption className="mix-head mono">
          <span>Language mix</span>
          <span>{basis}</span>
        </figcaption>
        <div
          className={`lang-bar lang-bar-lg${rows.length ? '' : ' is-empty'}`}
          role="img"
          aria-label={rows.length ? 'Language mix: ' + rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ') : 'Language mix unavailable'}
        >
          {rows.map((r) => (
            <span key={r.name} style={{ flexGrow: r.value, background: r.color }} />
          ))}
        </div>
        <ul className="mix-legend">
          {rows.length > 0 ? (
            rows.map((r) => (
              <li key={r.name}>
                <span className="swatch" style={{ background: r.color }} aria-hidden="true" />
                <span>{r.name}</span>
                <span className="mono">{pct(r.share)}</span>
              </li>
            ))
          ) : (
            <li className="mono muted">{langs.status === 'error' || state.status === 'error' ? 'no signal' : 'measuring…'}</li>
          )}
        </ul>
        <p className="note mono">
          {state.status === 'error'
            ? 'GitHub API is not answering right now (rate limit or offline). Values will appear on the next visit.'
            : `Public, non-fork repositories of @${profile.githubUser}, this site excluded. Measured by GitHub linguist in bytes, so markup and styles count too. Private work is not included.`}
        </p>
      </figure>
    </div>
  )
}

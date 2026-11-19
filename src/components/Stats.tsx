import { profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'

const ACTIVE_DAYS = 90

export function Stats() {
  const state = useRepos()
  const langs = useLanguages()
  const repos = state.status === 'ok' ? state.repos : []
  const ready = state.status === 'ok'
  const rows = langs.status === 'ok' ? mix(langs.total) : []
  const distinct = langs.status === 'ok' ? Object.keys(langs.total).length : 0
  const bytes = langs.status === 'ok' && langs.basis === 'bytes' ? Object.values(langs.total).reduce((a, b) => a + b, 0) : 0
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0)
  const active = repos.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < ACTIVE_DAYS * 86_400_000).length
  const v = (x: string | number, ok = ready) => (ok ? String(x) : state.status === 'error' ? '—' : '…')
  const langReady = langs.status === 'ok'

  const table: { param: string; sym: string; sub?: string; value: string; unit: string }[] = [
    { param: 'Public repositories', sym: 'N', sub: 'repo', value: v(repos.length), unit: '' },
    { param: `Active in the last ${ACTIVE_DAYS} days`, sym: 'N', sub: 'act', value: v(active), unit: 'repo' },
    { param: 'Languages in use', sym: 'N', sub: 'lang', value: v(distinct, langReady), unit: '' },
    { param: 'Largest language', sym: 'L', sub: '0', value: v(rows[0] ? `${rows[0].name} ${pct(rows[0].share)}` : '—', langReady), unit: '' },
    { param: 'Code measured', sym: 'B', value: v(bytes ? (bytes / 1024).toFixed(0) : '—', langReady), unit: bytes ? 'KiB' : '' },
    { param: 'Stars received', sym: 'Σ★', value: v(stars), unit: '' },
    { param: 'Last push', sym: 't', sub: 'push', value: v(repos[0] ? ago(repos[0].pushed_at) : '—'), unit: '' },
  ]

  const basis = langs.status === 'ok' && langs.basis === 'repos' ? 'by repository (API limit)' : 'by bytes of code'

  return (
    <div className="stats">
      <div className="stats-table-wrap">
        <table className="stats-table" aria-busy={state.status === 'loading'}>
          <thead className="mono">
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col" className="sym-col">Symbol</th>
              <th scope="col" className="num">Value</th>
              <th scope="col" className="unit-col">Unit</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r) => (
              <tr key={r.param}>
                <th scope="row">{r.param}</th>
                <td className="mono sym">
                  {r.sym}
                  {r.sub && <sub>{r.sub}</sub>}
                </td>
                <td className="mono num">{r.value}</td>
                <td className="mono unit">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="stats-note mono">
          {state.status === 'error'
            ? 'GitHub API is not answering right now (rate limit or offline). Values will appear on the next visit.'
            : `Test conditions: public, non-fork repositories of @${profile.githubUser}, this site excluded. Languages are measured by GitHub linguist in bytes, so markup and styles count too. Private work is not included.`}
        </p>
      </div>

      <figure className="mix">
        <figcaption className="mix-bar-head mono">
          <span>Language mix</span>
          <span>{basis}</span>
        </figcaption>
        <div className="mix-body">
          <div
            className={`mix-bar${rows.length ? '' : ' is-empty'}`}
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
              <li className="mix-empty mono">{langs.status === 'error' || state.status === 'error' ? 'no signal' : 'measuring…'}</li>
            )}
          </ul>
        </div>
      </figure>
    </div>
  )
}

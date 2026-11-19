import { featured, profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'
import type { Repo } from '../github'

const MORE_LIMIT = 6

function LangBar({ name }: { name: string }) {
  const langs = useLanguages()
  const bytes = langs.status === 'ok' ? langs.byRepo[name] : undefined
  const rows = bytes ? mix(bytes, 3) : []
  if (!rows.length) return <div className="wk-bar is-empty" aria-hidden="true" />
  return (
    <div className="wk-lang">
      <div className="wk-bar" role="img" aria-label={rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ')}>
        {rows.map((r) => (
          <span key={r.name} style={{ flexGrow: r.value, background: r.color }} />
        ))}
      </div>
      <ul className="wk-lang-list mono" aria-hidden="true">
        {rows.map((r) => (
          <li key={r.name}>
            <i style={{ background: r.color }} />
            {r.name} {pct(r.share)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Work() {
  const state = useRepos()
  const repos = state.status === 'ok' ? state.repos : []
  const byName = new Map<string, Repo>(repos.map((r) => [r.name.toLowerCase(), r]))
  const picked = new Set(featured.map((f) => f.repo.toLowerCase()))
  const more = repos.filter((r) => !picked.has(r.name.toLowerCase()))

  return (
    <div className="work">
      <ol className="wk-grid">
        {featured.map((f, i) => {
          const r = byName.get(f.repo.toLowerCase())
          const href = r?.html_url ?? `${profile.links.github}/${f.repo}`
          return (
            <li key={f.repo} className={`wk${i === 0 ? ' wk-lead' : ''}`}>
              <a href={href} target="_blank" rel="noreferrer">
                <span className="wk-top mono">
                  <span className="wk-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wk-kind">{f.kind}</span>
                  {r?.archived && <span className="wk-flag">archived</span>}
                </span>
                <span className="wk-title">
                  {f.title}
                  <span className="arrow" aria-hidden="true">↗</span>
                </span>
                <span className="wk-sum">{f.summary}</span>
                <span className="wk-stack mono">
                  {f.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </span>
                <LangBar name={r?.name ?? f.repo} />
                <span className="wk-meta mono">
                  <span>github.com/{profile.githubUser}/{f.repo}</span>
                  <span>
                    {r ? (
                      <>
                        ★ {r.stargazers_count} · {ago(r.pushed_at)}
                      </>
                    ) : state.status === 'loading' ? (
                      '…'
                    ) : (
                      ''
                    )}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      {state.status === 'ok' && more.length > 0 && (
        <div className="wk-more">
          <h3 className="wk-more-title mono">More repositories</h3>
          <ul className="repo-list">
            {more.slice(0, MORE_LIMIT).map((r) => (
              <li key={r.name} className="repo">
                <a href={r.html_url} target="_blank" rel="noreferrer">
                  <span className="repo-main">
                    <span className="repo-name">
                      {r.name} <span className="arrow" aria-hidden="true">↗</span>
                    </span>
                    {r.description && <span className="repo-desc">{r.description}</span>}
                  </span>
                  <span className="repo-lang mono">{r.language ?? '—'}</span>
                  <span className="repo-time mono">{ago(r.pushed_at)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'error' && (
        <p className="wk-error mono">GitHub API is not answering (rate limit or offline). Live stats will appear on the next visit.</p>
      )}

      <a className="repos-more mono" href={profile.links.github + '?tab=repositories'} target="_blank" rel="noreferrer">
        All repositories on GitHub ↗
      </a>
    </div>
  )
}

import { useState } from 'react'
import { featured, profile } from '../data/profile'
import type { Featured } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { patterns } from '../dither/patterns'
import { ago, mix, pct, useLanguages, useRepos } from '../github'
import type { Repo } from '../github'

const MORE_LIMIT = 6

function LangBar({ name }: { name: string }) {
  const langs = useLanguages()
  const bytes = langs.status === 'ok' ? langs.byRepo[name] : undefined
  const rows = bytes ? mix(bytes, 3) : []
  if (!rows.length) return <div className="lang-bar is-empty" aria-hidden="true" />
  return (
    <div className="wk-lang">
      <div className="lang-bar" role="img" aria-label={rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ')}>
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

function ProjectCard({ project, repo, index, loading }: { project: Featured; repo?: Repo; index: number; loading: boolean }) {
  const [active, setActive] = useState(false)
  const lead = index === 0
  const href = repo?.html_url ?? `${profile.links.github}/${project.repo}`

  return (
    <li className={`wk${lead ? ' wk-lead' : ''}`}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        <span className="wk-cover">
          <DitherCanvas field={patterns[project.cover]} fill={lead} play={active} startAt={index * 3 + 1} />
        </span>
        <span className="wk-body">
          <span className="wk-top mono">
            <span>{project.kind}</span>
            {repo?.archived && <span className="wk-flag">archived</span>}
          </span>
          <span className="wk-title">
            {project.title}
            <span className="arrow" aria-hidden="true">
              ↗
            </span>
          </span>
          <span className="wk-sum">{project.summary}</span>
          <span className="chips mono">
            {project.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </span>
          <LangBar name={repo?.name ?? project.repo} />
          <span className="wk-meta mono">
            <span className="wk-path">
              {profile.githubUser}/{project.repo}
            </span>
            <span>{repo ? `★ ${repo.stargazers_count} · ${ago(repo.pushed_at)}` : loading ? '…' : ''}</span>
          </span>
        </span>
      </a>
    </li>
  )
}

/** Bytes of code per language across every public repository, from GitHub linguist. */
function LanguageMix() {
  const langs = useLanguages()
  const rows = langs.status === 'ok' ? mix(langs.total) : []
  const basis = langs.status === 'ok' && langs.basis === 'repos' ? 'by repository (API limit)' : 'by bytes of code'
  return (
    <figure className="mix">
      <figcaption className="mix-head mono">
        <span>Language mix, all public repositories</span>
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
          <li className="mono muted">{langs.status === 'error' ? 'GitHub API unavailable right now' : 'measuring…'}</li>
        )}
      </ul>
      <p className="note mono">
        Public, non-fork repositories of @{profile.githubUser}, this site excluded. GitHub counts bytes, so markup and styles count
        too. Private work is not included.
      </p>
    </figure>
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
        {featured.map((f, i) => (
          <ProjectCard key={f.repo} project={f} repo={byName.get(f.repo.toLowerCase())} index={i} loading={state.status === 'loading'} />
        ))}
      </ol>

      {more.length > 0 && (
        <div className="wk-more">
          <h3 className="label mono">More repositories</h3>
          <ul className="repo-list">
            {more.slice(0, MORE_LIMIT).map((r) => (
              <li key={r.name}>
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

      <LanguageMix />

      {state.status === 'error' && (
        <p className="note mono">GitHub API is not answering (rate limit or offline). Live stats will appear on the next visit.</p>
      )}

      <a className="link-more mono" href={`${profile.links.github}?tab=repositories`} target="_blank" rel="noreferrer">
        All repositories on GitHub ↗
      </a>
    </div>
  )
}

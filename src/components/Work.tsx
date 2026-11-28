import { useState } from 'react'
import { featured, profile } from '../data/profile'
import type { Featured } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { patterns } from '../dither/patterns'
import { ago, mix, pct, useLanguages, useRepos } from '../github'
import type { Repo } from '../github'
import { arrow, cardLabel, chip, cn, note, surface } from '../ui'

const MORE_LIMIT = 6

function LangBar({ name }: { name: string }) {
  const langs = useLanguages()
  const bytes = langs.status === 'ok' ? langs.byRepo[name] : undefined
  const rows = bytes ? mix(bytes, 3) : []
  if (!rows.length) return <div className="lang-bar is-empty" aria-hidden="true" />
  return (
    <div className="grid gap-2">
      <div className="lang-bar" role="img" aria-label={rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ')}>
        {rows.map((r) => (
          <span key={r.name} style={{ flexGrow: r.value, background: r.color }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[11.5px] text-ink-3" aria-hidden="true">
        {rows.map((r) => (
          <li key={r.name} className="inline-flex items-center gap-1.5">
            <i className="size-2 rounded-[2px]" style={{ background: r.color }} />
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
    <li className={lead ? 'col-span-full' : undefined} data-reveal>
      <a
        className={cn(
          'group h-full flex-col overflow-hidden rounded-card border border-line', surface,
          '[transition:border-color_0.3s,transform_0.4s_var(--ease-smooth),box-shadow_0.4s_var(--ease-smooth)]',
          'hover:border-line-3 hover:[transform:translateY(-3px)] hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]',
          'focus-visible:border-line-3 focus-visible:[transform:translateY(-3px)] focus-visible:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]',
          'print:break-inside-avoid print:bg-[#fff]! print:shadow-none!',
          lead ? 'grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md-down:flex' : 'flex',
        )}
        href={href}
        target="_blank"
        rel="noreferrer"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        <span className={cn('relative block border-line bg-[#0d0d10]', lead ? 'border-r md-down:border-r-0 md-down:border-b' : 'border-b')}>
          <DitherCanvas
            className={lead ? 'h-full min-h-full object-cover' : undefined}
            field={patterns[project.cover]}
            width={lead ? 200 : 160}
            height={lead ? 120 : 90}
            play={active}
            startAt={index * 3 + 1}
          />
          <span className="absolute top-3 left-3.5 rounded-pill bg-[rgba(10,10,11,0.7)] px-2 py-[3px] font-mono text-[11px] text-ink-2">fig. {String(index + 1).padStart(2, '0')}</span>
        </span>
        <span className={cn('flex flex-1 flex-col gap-3.5', lead ? 'p-[clamp(24px,3vw,36px)]' : 'px-6 pt-5.5 pb-5')}>
          <span className="flex gap-2.5 font-mono text-[11px] tracking-[0.12em] text-accent-ink uppercase">
            <span>{project.kind}</span>
            {repo?.archived && <span className="text-ink-3">archived</span>}
          </span>
          <span className={cn(
            'flex justify-between gap-4 leading-none font-semibold tracking-[-0.04em]',
            lead ? 'text-[clamp(36px,4.4vw,60px)]' : 'text-[clamp(28px,2.8vw,36px)]',
          )}>
            {project.title}
            <span className={cn(arrow, 'text-[0.7em] text-ink-3 group-hover:text-accent')} aria-hidden="true">
              ↗
            </span>
          </span>
          <span className={cn('text-ink-2', lead && 'text-[17px]')}>{project.summary}</span>
          <span className="flex flex-wrap gap-1.5 font-mono">
            {project.stack.map((s) => (
              <span key={s} className={chip}>{s}</span>
            ))}
          </span>
          <LangBar name={repo?.name ?? project.repo} />
          <span className="mt-auto flex justify-between gap-3 [border-top:1px_dashed_var(--color-line-2)] pt-3.5 font-mono text-[12px] text-ink-3">
            <span className="truncate">
              {profile.githubUser}/{project.repo}
            </span>
            <span>{repo ? `★ ${repo.stargazers_count} · ${ago(repo.pushed_at)}` : loading ? '…' : ''}</span>
          </span>
        </span>
      </a>
    </li>
  )
}

export function Work() {
  const state = useRepos()
  const repos = state.status === 'ok' ? state.repos : []
  const byName = new Map<string, Repo>(repos.map((r) => [r.name.toLowerCase(), r]))
  const picked = new Set(featured.map((f) => f.repo.toLowerCase()))
  const more = repos.filter((r) => !picked.has(r.name.toLowerCase()))

  return (
    <div>
      <ol className="grid grid-cols-2 gap-4 md-down:grid-cols-1">
        {featured.map((f, i) => (
          <ProjectCard key={f.repo} project={f} repo={byName.get(f.repo.toLowerCase())} index={i} loading={state.status === 'loading'} />
        ))}
      </ol>

      {more.length > 0 && (
        <div className="mt-10" data-reveal>
          <h3 className={cardLabel}>More repositories</h3>
          <ul className="mt-3">
            {more.slice(0, MORE_LIMIT).map((r) => (
              <li key={r.name}>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_120px_80px] items-baseline gap-4 border-t border-line px-1 py-4 [transition:background_0.2s] hover:bg-[rgba(242,240,235,0.03)] md-down:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <span className="grid gap-0.5">
                    <span className="font-semibold">
                      {r.name} <span className={arrow} aria-hidden="true">↗</span>
                    </span>
                    {r.description && <span className="text-[14px] text-ink-2">{r.description}</span>}
                  </span>
                  <span className="font-mono text-[12px] text-ink-3 md-down:hidden">{r.language ?? '—'}</span>
                  <span className="text-right font-mono text-[12px] text-ink-3">{ago(r.pushed_at)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'error' && (
        <p className={note}>GitHub API is not answering (rate limit or offline). Live stats will appear on the next visit.</p>
      )}

      <a className="mt-7 inline-block border-b border-line-2 font-mono text-[13px] text-ink-2 [transition:color_0.2s,border-color_0.2s] hover:border-accent hover:text-ink" href={`${profile.links.github}?tab=repositories`} target="_blank" rel="noreferrer">
        All repositories on GitHub ↗
      </a>
    </div>
  )
}

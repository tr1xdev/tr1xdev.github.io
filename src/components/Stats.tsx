import { profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'
import { card, cn, note, surface, swatch } from '../ui'

const ACTIVE_DAYS = 90

const caption = 'font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase'

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
    <div className="grid gap-4">
      <dl
        className="grid grid-cols-3 gap-4 md-down:grid-cols-2 [&>:nth-child(3n+2)]:delay-[60ms] [&>:nth-child(3n+3)]:delay-[120ms]"
        aria-busy={state.status === 'loading'}>
        {tiles.map((t) => (
          <div key={t.label} className={cn(card, surface, 'flex min-h-[150px] flex-col justify-between gap-6 px-[22px] py-5 2xs-down:min-h-[120px] 2xs-down:px-4 2xs-down:py-4')} data-reveal>
            <dt className={caption}>{t.label}</dt>
            <dd className="text-[length:clamp(34px,4vw,56px)] leading-none font-semibold tracking-[-0.045em] tabular-nums 2xs-down:text-[30px]">{t.value}</dd>
          </div>
        ))}
      </dl>

      <figure className={cn(card, surface, 'grid gap-4 p-[22px]')} data-reveal>
        <figcaption className={cn(caption, 'flex justify-between gap-4')}>
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
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {rows.length > 0 ? (
            rows.map((r) => (
              <li key={r.name} className="inline-flex items-center gap-2 text-[14px]">
                <span className={swatch} style={{ background: r.color }} aria-hidden="true" />
                <span>{r.name}</span>
                <span className="font-mono text-[12px] text-ink-3">{pct(r.share)}</span>
              </li>
            ))
          ) : (
            <li className="inline-flex items-center gap-2 font-mono text-[12px] text-ink-3">{langs.status === 'error' || state.status === 'error' ? 'no signal' : 'measuring…'}</li>
          )}
        </ul>
        <p className={note}>
          {state.status === 'error'
            ? 'GitHub API is not answering right now (rate limit or offline). Values will appear on the next visit.'
            : `Public, non-fork repositories of @${profile.githubUser}, this site excluded. Measured by GitHub linguist in bytes, so markup and styles count too. Private work is not included.`}
        </p>
      </figure>
    </div>
  )
}

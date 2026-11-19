import { useEffect, useState } from 'react'
import { profile } from './data/profile'

export type Repo = {
  name: string
  html_url: string
  description: string | null
  language: string | null
  languages_url: string
  stargazers_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
}

export type ReposState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; repos: Repo[] }

/** Bytes of code per language, as reported by GitHub linguist. */
export type LangBytes = Record<string, number>
export type LangState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; byRepo: Record<string, LangBytes>; total: LangBytes; basis: 'bytes' | 'repos' }

const user = profile.githubUser
const REPOS_KEY = 'gh-repos:v3:' + user
const LANGS_KEY = 'gh-langs:v1:' + user
const API = 'https://api.github.com'
const HEADERS = { Accept: 'application/vnd.github+json' }

// The site itself and the profile README are not "work", and would skew the language mix
// (this site alone is a few hundred KB of TypeScript and CSS).
const SELF = new Set([user, user + '.github.io', 'portfolio', user + '-portfolio'].map((s) => s.toLowerCase()))
export const isSelf = (name: string) => SELF.has(name.toLowerCase())

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or disabled: skip caching */
  }
}

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: HEADERS })
  if (!r.ok) throw new Error(String(r.status))
  return (await r.json()) as T
}

// One request per page load, shared by every section that needs repo data.
let reposInflight: Promise<Repo[]> | null = null
function loadRepos(): Promise<Repo[]> {
  reposInflight ??= getJSON<Repo[]>(`${API}/users/${user}/repos?sort=pushed&per_page=100`)
    .then((all) => {
      const repos = all
        .filter((r) => !r.fork && !isSelf(r.name))
        .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
      write(REPOS_KEY, repos)
      return repos
    })
    .catch((err: unknown) => {
      reposInflight = null
      throw err
    })
  return reposInflight
}

export function useRepos(): ReposState {
  const [state, setState] = useState<ReposState>(() => {
    const cached = read<Repo[]>(REPOS_KEY)
    return cached ? { status: 'ok', repos: cached } : { status: 'loading' }
  })

  useEffect(() => {
    if (state.status === 'ok') return
    let alive = true
    loadRepos()
      .then((repos) => alive && setState({ status: 'ok', repos }))
      .catch(() => alive && setState({ status: 'error' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

function sum(maps: LangBytes[]): LangBytes {
  const out: LangBytes = {}
  for (const m of maps) for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v
  return out
}

// A repo's primary language only says which language is the largest in it,
// so counting primaries reports "TypeScript 100%" for a Go + React project.
// Ask GitHub for the real byte breakdown of every repository instead.
let langsInflight: Promise<LangState & { status: 'ok' }> | null = null
function loadLangs(repos: Repo[]): Promise<LangState & { status: 'ok' }> {
  langsInflight ??= Promise.allSettled(repos.map((r) => getJSON<LangBytes>(r.languages_url))).then((results) => {
    const byRepo: Record<string, LangBytes> = {}
    let failed = 0
    results.forEach((res, i) => {
      if (res.status === 'fulfilled') byRepo[repos[i].name] = res.value
      else failed++
    })
    if (failed > 0 && Object.keys(byRepo).length === 0) {
      // Rate limited: fall back to one vote per repository so the section still says something honest.
      const fallback: LangBytes = {}
      for (const r of repos) if (r.language) fallback[r.language] = (fallback[r.language] ?? 0) + 1
      return { status: 'ok', byRepo: {}, total: fallback, basis: 'repos' }
    }
    const state = { status: 'ok' as const, byRepo, total: sum(Object.values(byRepo)), basis: 'bytes' as const }
    if (failed === 0) write(LANGS_KEY, state)
    return state
  })
  return langsInflight
}

export function useLanguages(): LangState {
  const repos = useRepos()
  const [state, setState] = useState<LangState>(() => read<LangState>(LANGS_KEY) ?? { status: 'loading' })

  useEffect(() => {
    if (state.status === 'ok') return
    if (repos.status === 'error') {
      setState({ status: 'error' })
      return
    }
    if (repos.status !== 'ok') return
    let alive = true
    loadLangs(repos.repos).then((s) => alive && setState(s))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos.status])

  return state
}

export type MixRow = { name: string; value: number; share: number; color: string }

const PALETTE = ['var(--signal)', 'var(--g-arch)', 'var(--g-data)', 'var(--g-infra)', '#d8b45a']

/** Top languages as shares of the total, the long tail folded into "Other". */
export function mix(total: LangBytes, top = 5): MixRow[] {
  const entries = Object.entries(total).sort((a, b) => b[1] - a[1])
  const all = entries.reduce((a, [, v]) => a + v, 0)
  if (!all) return []
  const rows = entries.slice(0, top).map(([name, value], i) => ({ name, value, share: value / all, color: PALETTE[i] }))
  const rest = entries.slice(top).reduce((a, [, v]) => a + v, 0)
  if (rest > 0) rows.push({ name: 'Other', value: rest, share: rest / all, color: 'var(--ink-3)' })
  return rows
}

export function pct(share: number) {
  if (share > 0 && share < 0.01) return '<1%'
  return Math.round(share * 100) + '%'
}

export function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

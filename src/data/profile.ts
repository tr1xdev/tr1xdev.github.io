// ─────────────────────────────────────────────────────────────
//  Edit this file to update everything on the site.
// ─────────────────────────────────────────────────────────────
import type { PatternName } from '../dither/patterns'

export const profile = {
  handle: 'tr1xdev',
  /** The hero name in two parts: solid, then outlined. Use ['yourname', ''] for one solid word. */
  wordmark: ['tr1x', 'dev'],
  /** Printed on the chip in the Stack section. */
  partNo: 'TRX-01',
  role: 'Backend & systems developer',
  /** One line under the name, also used as the page description. Keep it under ~140 characters. */
  lede: 'I build backend services in Go and Rust: APIs, message pipelines and the storage underneath them.',
  /** Plain text in About and Contact. Empty string hides it. */
  availability: 'Open to backend roles and projects',
  githubUser: 'tr1xdev',
  site: 'https://tr1xdev.github.io',
  /**
   * Optional. An IANA time zone such as 'Europe/Lisbon' or 'America/Chicago'. When set, the hero
   * shows your local time and About shows the UTC offset; the browser works both out, so they stay
   * right when daylight saving time starts or ends. Leave empty to hide both.
   */
  timezone: 'Europe/Moscow',
  /** Optional city or region. Leave empty to hide it. */
  location: 'Moscow',
  links: {
    github: 'https://github.com/tr1xdev',
    // Optional. Leave empty to hide, e.g. 'hello@example.com'
    email: '',
    // Optional. Leave empty to hide, e.g. 'https://t.me/yourname'
    telegram: '',
  },
  /**
   * Optional photo, e.g. '/portrait.jpg' placed in /public. It is dithered in the browser
   * to match the rest of the site. Leave empty to show a generated orb instead.
   */
  portrait: '',
}

export const about = {
  statement: 'I work mostly on the server side: service APIs, message queues and the databases behind them.',
  body: 'My main languages are Go and Rust. Besides services, I write low-level side projects in C and C++ and run machine learning experiments. I start from the API contract and the failure cases, measure before I optimise, and try to leave code the next person can read.',
  focus: [
    'Backend services & system architecture',
    'Message-driven pipelines on Kafka, gRPC and Protobuf',
    'Low-level code in Rust, C and C++',
    'Machine learning, mostly hands-on experiments',
    'Tests, profiling and observability from day one',
    'Side projects shipped end-to-end',
  ],
}

/**
 * Hand-picked projects shown first in "Work". `repo` must match a public GitHub repository name;
 * stars, last push and the language breakdown are read live from the API.
 * `cover` picks the generative dither artwork (see src/dither/patterns.ts).
 */
export type Featured = { repo: string; title: string; kind: string; summary: string; stack: string[]; cover: PatternName }

export const featured: Featured[] = [
  {
    repo: 'aerogram-messenger',
    title: 'Aerogram',
    kind: 'Messaging platform',
    summary: 'Messaging platform with a Go server and a React and TypeScript client.',
    stack: ['Go', 'React', 'TypeScript'],
    cover: 'ripples',
  },
  {
    repo: 'go-shortener',
    title: 'go-shortener',
    kind: 'Web service',
    summary: 'URL shortener with a Go backend and a React frontend.',
    stack: ['Go', 'React'],
    cover: 'dunes',
  },
  {
    repo: 'Reactive',
    title: 'Reactive',
    kind: 'C++ library',
    summary: 'Reactive programming primitives for C++. Archived and kept public for reference.',
    stack: ['C++', 'CMake'],
    cover: 'orb',
  },
]

export type GroupId = 'lang' | 'arch' | 'data' | 'infra'

export const groups: Record<GroupId, { label: string; short: string }> = {
  lang: { label: 'Languages', short: 'LANG' },
  arch: { label: 'Backend & architecture', short: 'ARCH' },
  data: { label: 'Databases & storage', short: 'DATA' },
  infra: { label: 'Tools & infrastructure', short: 'INFRA' },
}

export type Pin = { signal: string; name: string; group: GroupId; note: string }

// Pins 1–11 run down the left side, 12–22 run up the right side (DIP convention).
export const pins: Pin[] = [
  { signal: 'GO', name: 'Go', group: 'lang', note: 'Services, CLIs and concurrent pipelines.' },
  { signal: 'RUST', name: 'Rust', group: 'lang', note: 'Fast, memory-safe systems code.' },
  { signal: 'TS', name: 'TypeScript', group: 'lang', note: 'Typed tooling and frontends.' },
  { signal: 'JS', name: 'JavaScript', group: 'lang', note: 'Browser code and small scripts.' },
  { signal: 'C', name: 'C', group: 'lang', note: 'Low-level code and small utilities.' },
  { signal: 'CPP', name: 'C++', group: 'lang', note: 'Performance-critical components.' },
  { signal: 'GRPC', name: 'gRPC', group: 'arch', note: 'Service-to-service RPC.' },
  { signal: 'PROTO', name: 'Protobuf', group: 'arch', note: 'Schema-first contracts.' },
  { signal: 'REST', name: 'REST APIs', group: 'arch', note: 'Public-facing HTTP interfaces.' },
  { signal: 'KAFKA', name: 'Kafka', group: 'arch', note: 'Event streams and async pipelines.' },
  { signal: 'GQL', name: 'GraphQL', group: 'arch', note: 'Typed query layer for clients.' },
  { signal: 'PG', name: 'PostgreSQL', group: 'data', note: 'Main relational database.' },
  { signal: 'REDIS', name: 'Redis', group: 'data', note: 'Caching, queues, rate limits.' },
  { signal: 'SQLITE', name: 'SQLite', group: 'data', note: 'Embedded storage for small tools.' },
  { signal: 'SQLC', name: 'sqlc', group: 'data', note: 'Type-safe Go from plain SQL.' },
  { signal: 'DOCKER', name: 'Docker', group: 'infra', note: 'Reproducible environments.' },
  { signal: 'GIT', name: 'Git', group: 'infra', note: 'Version control.' },
  { signal: 'LINUX', name: 'Linux', group: 'infra', note: 'Main development environment.' },
  { signal: 'CMAKE', name: 'CMake', group: 'infra', note: 'C/C++ builds.' },
  { signal: 'MAKE', name: 'Makefile', group: 'infra', note: 'Shortcuts for builds and tests.' },
  { signal: 'VITE', name: 'Vite', group: 'infra', note: 'Frontend dev server and builds.' },
  { signal: 'REACT', name: 'React', group: 'infra', note: 'Frontends, including this site.' },
]

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
] as const

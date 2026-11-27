// ─────────────────────────────────────────────────────────────
//  Edit this file to update everything on the site.
// ─────────────────────────────────────────────────────────────
import type { PatternName } from '../dither/patterns'

export const profile = {
  handle: 'tr1xdev',
  partNo: 'TRX-01',
  role: 'Backend & systems developer',
  /** One line under the name. Keep it under ~140 characters. */
  lede: 'I build backend services in Go and Rust: APIs, message pipelines and the storage underneath them.',
  /** Plain text in the hero and in About. Empty string hides it. */
  availability: 'Open to backend roles and projects',
  githubUser: 'tr1xdev',
  site: 'https://tr1xdev.github.io',
  timezone: 'Europe/Moscow',
  tzLabel: 'MSK · UTC+3',
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

/** Quick facts under the hero. */
export const specs = [
  { key: 'core', value: 'Go · Rust' },
  { key: 'wire', value: 'gRPC · Kafka' },
  { key: 'storage', value: 'Postgres · Redis' },
  { key: 'based in', value: 'Moscow · UTC+3' },
]

export const about = {
  statement: 'I like the parts of a system nobody sees: protocols, queues, storage and the failure modes between them.',
  body: 'Most of my time goes into services in Go and Rust; the rest goes into low-level side projects and ML experiments. I care about contracts first, measurable performance and code that the next person can read.',
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
    summary: 'High-performance messaging platform. Go on the server, React on the client, one protocol between them.',
    stack: ['Go', 'React', 'TypeScript'],
    cover: 'ripples',
  },
  {
    repo: 'go-shortener',
    title: 'go-shortener',
    kind: 'Web service',
    summary: 'URL shortener with a Go backend and a React frontend. Small surface, done properly.',
    stack: ['Go', 'React'],
    cover: 'dunes',
  },
  {
    repo: 'Reactive',
    title: 'Reactive',
    kind: 'C++ library',
    summary: 'Reactive programming primitives for C++. Archived, kept public as a reference.',
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
  { signal: 'JS', name: 'JavaScript', group: 'lang', note: 'The web runtime, everywhere.' },
  { signal: 'C', name: 'C', group: 'lang', note: 'Close to the metal.' },
  { signal: 'CPP', name: 'C++', group: 'lang', note: 'Performance-critical components.' },
  { signal: 'GRPC', name: 'gRPC', group: 'arch', note: 'Service-to-service RPC.' },
  { signal: 'PROTO', name: 'Protobuf', group: 'arch', note: 'Schema-first contracts.' },
  { signal: 'REST', name: 'REST APIs', group: 'arch', note: 'Public-facing HTTP interfaces.' },
  { signal: 'KAFKA', name: 'Kafka', group: 'arch', note: 'Event streams and async pipelines.' },
  { signal: 'GQL', name: 'GraphQL', group: 'arch', note: 'Typed query layer for clients.' },
  { signal: 'PG', name: 'PostgreSQL', group: 'data', note: 'The default source of truth.' },
  { signal: 'REDIS', name: 'Redis', group: 'data', note: 'Caching, queues, rate limits.' },
  { signal: 'SQLITE', name: 'SQLite', group: 'data', note: 'Embedded storage for small, sharp tools.' },
  { signal: 'SQLC', name: 'sqlc', group: 'data', note: 'Type-safe Go from plain SQL.' },
  { signal: 'DOCKER', name: 'Docker', group: 'infra', note: 'Reproducible environments.' },
  { signal: 'GIT', name: 'Git', group: 'infra', note: 'History you can trust.' },
  { signal: 'LINUX', name: 'Linux', group: 'infra', note: 'Home turf.' },
  { signal: 'CMAKE', name: 'CMake', group: 'infra', note: 'C/C++ builds.' },
  { signal: 'MAKE', name: 'Makefile', group: 'infra', note: 'One-word workflows.' },
  { signal: 'VITE', name: 'Vite', group: 'infra', note: 'Instant frontend tooling.' },
  { signal: 'REACT', name: 'React', group: 'infra', note: 'Interfaces like this one.' },
]

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
] as const

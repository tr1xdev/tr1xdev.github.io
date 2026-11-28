import { useEffect, useState } from 'react'
import { cn, led } from '../ui'
import { useInView, useReducedMotion } from '../hooks'

type Line = { kind: 'note' | 'cmd' | 'out'; text: string }

// Illustrative workflow, one stage per step. No invented metrics.
const STAGES: { step: string; lines: Line[] }[] = [
  {
    step: 'spec',
    lines: [
      { kind: 'note', text: 'contract first: API, schema, failure modes' },
      { kind: 'cmd', text: 'buf lint && buf breaking --against .git#branch=main' },
      { kind: 'out', text: 'contract ok, no breaking changes' },
    ],
  },
  {
    step: 'build',
    lines: [
      { kind: 'note', text: 'small packages, explicit dependencies' },
      { kind: 'cmd', text: 'go build ./... && cargo build --release' },
      { kind: 'out', text: 'build ok' },
    ],
  },
  {
    step: 'test',
    lines: [
      { kind: 'note', text: 'race detector on, edge cases first' },
      { kind: 'cmd', text: 'go test -race ./...' },
      { kind: 'out', text: 'PASS' },
      { kind: 'cmd', text: 'cargo test' },
      { kind: 'out', text: 'test result: ok' },
    ],
  },
  {
    step: 'harden',
    lines: [
      { kind: 'note', text: 'timeouts, retries, backpressure, graceful shutdown' },
      { kind: 'cmd', text: 'go test -bench=. -cpuprofile cpu.out' },
      { kind: 'cmd', text: 'go tool pprof -top cpu.out' },
      { kind: 'note', text: 'find the hot path, fix it, measure again' },
    ],
  },
  {
    step: 'ship',
    lines: [
      { kind: 'cmd', text: 'docker build -t svc:latest .' },
      { kind: 'cmd', text: 'docker compose up -d' },
      { kind: 'out', text: 'healthy, logs and metrics wired' },
    ],
  },
]

const PREFIX: Record<Line['kind'], string> = { note: '#', cmd: '$', out: '›' }

const terminalLine = 'mb-2 grid grid-cols-[16px_1fr] gap-2.5 wrap-anywhere'
const lineStyle = {
  cmd: { text: 'text-ink', prefix: 'text-accent-ink' },
  note: { text: 'italic text-ink-3', prefix: 'text-ink-3' },
  out: { text: 'text-[#6fd3a5]', prefix: 'text-[rgba(111,211,165,0.6)]' },
}
const caret = 'ml-0.5 inline-block h-[1.05em] w-2 animate-[blink_1s_steps(1)_infinite] bg-accent align-text-bottom'

export function Process() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [line, setLine] = useState(0)
  const [chars, setChars] = useState(0)

  const { step, lines } = STAGES[stage]
  const animate = inView && !reduced
  const done = reduced || line >= lines.length

  useEffect(() => {
    if (!animate) return
    let t: number
    if (line >= lines.length) {
      t = window.setTimeout(() => {
        setStage((s) => (s + 1) % STAGES.length)
        setLine(0)
        setChars(0)
      }, 2600)
    } else {
      const cur = lines[line]
      if (chars < cur.text.length) {
        const typed = cur.kind === 'cmd'
        const stepSize = typed ? 1 : cur.kind === 'note' ? 3 : 10
        t = window.setTimeout(() => setChars((c) => c + stepSize), typed ? 26 + Math.random() * 30 : 12)
      } else {
        t = window.setTimeout(() => {
          setLine((l) => l + 1)
          setChars(0)
        }, cur.kind === 'cmd' ? 420 : 240)
      }
    }
    return () => window.clearTimeout(t)
  }, [animate, line, chars, lines])

  const pick = (i: number) => {
    setStage(i)
    setLine(0)
    setChars(0)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-[clamp(32px,5vw,64px)] md-down:grid-cols-1">
      <div>
        <h3 className="mb-6 text-[clamp(34px,4.2vw,58px)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
          Built to spec<span className="text-accent">.</span> Tested to fail safely<span className="text-accent">.</span>
        </h3>
        <p className="max-w-120 text-[17px] text-ink-2">
          I start from the contract: schemas, failure modes, edge cases. Then I build, measure and harden until the service holds up
          under real load.
        </p>
        <p className="mt-4 max-w-120 border-l-2 border-accent pl-3.5 text-[15px] text-ink-3">
          AI assistants sit in the toolbox next to the debugger and the profiler. Design decisions stay with me.
        </p>
        <ol className="mt-8 flex flex-wrap gap-1.5 font-mono" aria-label="Workflow stages">
          {STAGES.map((s, i) => (
            <li key={s.step}>
              <button
                type="button"
                className={cn(
                  'flex min-h-10 cursor-pointer items-center gap-2 rounded-pill border px-4 py-0 font-mono text-[13px] [transition:background_0.2s,color_0.2s,border-color_0.2s]',
                  i === stage
                    ? 'border-accent bg-accent font-semibold text-on-accent'
                    : 'border-line-2 bg-[rgba(10,10,11,0.6)] text-ink-2 hover:border-line-3 hover:text-ink',
                )}
                aria-pressed={i === stage}
                onClick={() => pick(i)}
              >
                <span className={cn('text-[11px]', i === stage ? 'text-on-accent' : 'text-accent-ink')}>{String(i + 1).padStart(2, '0')}</span>
                {s.step}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="overflow-hidden rounded-card border border-line-2 bg-[rgba(8,8,10,0.94)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] print:break-inside-avoid print:bg-[#fff]! print:shadow-none!" ref={ref} role="img" aria-label={`Example workflow, stage: ${step}`}>
        <div className="flex items-center gap-3.5 border-b border-line px-4 py-3 font-mono text-[12px] text-ink-3" aria-hidden="true">
          <span className="flex gap-1.5 *:size-2.5 *:rounded-[50%] *:bg-[rgba(242,240,235,0.14)]">
            <i />
            <i />
            <i />
          </span>
          <span className="truncate text-ink-2">
            workflow <span className="text-ink-3">/</span> {step}
          </span>
          <span className="ml-auto inline-flex items-center gap-2 whitespace-nowrap text-live-ink">
            <span className={led} /> {String(stage + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="min-h-49 px-5 pt-5 pb-4 font-mono text-[14px] leading-[1.6]" aria-hidden="true">
          {lines.map((l, i) => {
            if (!done && i > line) return null
            const partial = !done && i === line
            const text = partial ? l.text.slice(0, chars) : l.text
            return (
              <p key={`${stage}-${i}`} className={cn(terminalLine, lineStyle[l.kind].text)}>
                <span className={lineStyle[l.kind].prefix}>{PREFIX[l.kind]}</span>
                <span>
                  {text}
                  {partial && <span className={caret} />}
                </span>
              </p>
            )
          })}
          {done && !reduced && (
            <p className={cn(terminalLine, lineStyle.cmd.text)}>
              <span className={lineStyle.cmd.prefix}>$</span>
              <span>
                <span className={caret} />
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-1.5 px-5 pb-4.5" aria-hidden="true">
          {STAGES.map((s, i) => (
            <span
              key={s.step}
              className={cn(
                'h-[3px] [transition:background_0.3s,width_0.3s]',
                i === stage ? 'w-8 bg-accent' : cn('w-4.5', i < stage ? 'bg-[rgba(255,90,31,0.4)]' : 'bg-[rgba(242,240,235,0.14)]'),
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
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
    <div className="process">
      <div className="process-copy">
        <h3 className="process-title">
          Built to spec<span className="amp">.</span> Tested to fail safely<span className="amp">.</span>
        </h3>
        <p>
          I start from the contract: schemas, failure modes, edge cases. Then I build, measure and harden until the service holds up
          under real load.
        </p>
        <p className="process-aside">
          AI assistants sit in the toolbox next to the debugger and the profiler. Design decisions stay with me.
        </p>
        <ol className="duty mono" aria-label="Workflow stages">
          {STAGES.map((s, i) => (
            <li key={s.step}>
              <button type="button" className={i === stage ? 'is-on' : ''} aria-pressed={i === stage} onClick={() => pick(i)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.step}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="term" ref={ref} role="img" aria-label={`Example workflow, stage: ${step}`}>
        <div className="term-bar mono" aria-hidden="true">
          <span className="term-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="term-title">
            workflow <span className="term-sep">/</span> {step}
          </span>
          <span className="term-rec">
            <span className="led" /> {String(stage + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="term-body mono" aria-hidden="true">
          {lines.map((l, i) => {
            if (!done && i > line) return null
            const partial = !done && i === line
            const text = partial ? l.text.slice(0, chars) : l.text
            return (
              <p key={`${stage}-${i}`} className={`tl tl-${l.kind}`}>
                <span className="tl-p">{PREFIX[l.kind]}</span>
                <span>
                  {text}
                  {partial && <span className="caret" />}
                </span>
              </p>
            )
          })}
          {done && !reduced && (
            <p className="tl tl-cmd">
              <span className="tl-p">$</span>
              <span>
                <span className="caret" />
              </span>
            </p>
          )}
        </div>
        <div className="term-foot" aria-hidden="true">
          {STAGES.map((s, i) => (
            <span key={s.step} className={i === stage ? 'is-on' : i < stage ? 'is-done' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}

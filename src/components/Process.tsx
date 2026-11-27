type Stage = { step: string; what: string; run: string[] }

// How a service gets from idea to production. Real commands, no invented numbers.
const STAGES: Stage[] = [
  { step: 'Spec', what: 'Contract first: API, schema and failure modes.', run: ['buf lint', 'buf breaking --against .git#branch=main'] },
  { step: 'Build', what: 'Small packages with explicit dependencies.', run: ['go build ./...', 'cargo build --release'] },
  { step: 'Test', what: 'Race detector on, edge cases first.', run: ['go test -race ./...', 'cargo test'] },
  {
    step: 'Harden',
    what: 'Timeouts, retries, backpressure and graceful shutdown. Profile the hot path, fix it, measure again.',
    run: ['go test -bench=. -cpuprofile cpu.out', 'go tool pprof -top cpu.out'],
  },
  { step: 'Ship', what: 'Containers with health checks, logs and metrics wired in.', run: ['docker build -t svc .', 'docker compose up -d'] },
]

export function Process() {
  return (
    <div className="process">
      <div className="process-copy">
        <p className="process-lede">
          I start from the contract: schemas, failure modes, edge cases. Then I build, test and profile until the service holds up
          under real load.
        </p>
        <p>AI assistants sit in the toolbox next to the debugger and the profiler. Design decisions stay with me.</p>
      </div>

      <ol className="steps">
        {STAGES.map((s, i) => (
          <li key={s.step}>
            <span className="step-no mono">{String(i + 1).padStart(2, '0')}</span>
            <div className="step-body">
              <h3 className="step-name">{s.step}</h3>
              <p className="step-what">{s.what}</p>
              <pre className="step-run mono">
                <code>{s.run.map((c) => `$ ${c}`).join('\n')}</code>
              </pre>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

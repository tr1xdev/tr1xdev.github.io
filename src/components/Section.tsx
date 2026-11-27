import type { ReactNode } from 'react'

type Props = { id: string; no: string; title: string; kicker?: string; className?: string; children: ReactNode }

export function Section({ id, no, title, kicker, className, children }: Props) {
  return (
    <section id={id} className={['sec', className].filter(Boolean).join(' ')} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-no mono" aria-hidden="true">
            {no}
          </span>
          <h2 id={`${id}-title`} className="sec-title">
            {title}
          </h2>
          {kicker && <p className="sec-kicker mono">{kicker}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}

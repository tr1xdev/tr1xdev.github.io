import type { ReactNode } from 'react'

type Props = { id: string; title: string; className?: string; children: ReactNode }

export function Section({ id, title, className, children }: Props) {
  return (
    <section id={id} className={['sec', className].filter(Boolean).join(' ')} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <h2 id={`${id}-title`} className="sec-title">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}

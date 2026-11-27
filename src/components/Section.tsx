import type { ReactNode } from 'react'
import { useInView } from '../hooks'
import { Scramble } from './Scramble'

type Props = { id: string; no: string; title: string; kicker?: string; className?: string; children: ReactNode }

export function Section({ id, no, title, kicker, className, children }: Props) {
  const [ref, seen] = useInView<HTMLElement>({ once: true, rootMargin: '0px 0px -20% 0px' })
  return (
    <section id={id} className={['sec', className].filter(Boolean).join(' ')} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <header className="sec-head" ref={ref}>
          <span className="sec-no mono" aria-hidden="true">
            {no}
          </span>
          <h2 id={`${id}-title`} className="sec-title">
            <Scramble text={title} play={seen} />
          </h2>
          {kicker && <p className="sec-kicker mono">{kicker}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}

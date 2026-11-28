import type { ReactNode } from 'react'
import { useInView } from '../hooks'
import { cn, wrap } from '../ui'
import { Scramble } from './Scramble'

type Props = { id: string; no: string; title: string; kicker?: string; className?: string; children: ReactNode }

export function Section({ id, no, title, kicker, className, children }: Props) {
  const [ref, seen] = useInView<HTMLElement>({ once: true, rootMargin: '0px 0px -20% 0px' })
  return (
    <section id={id} className={cn('pt-[clamp(96px,13vw,168px)] print:pt-10', className)} aria-labelledby={`${id}-title`}>
      <div className={wrap}>
        <header
          className="mb-[clamp(32px,4vw,52px)] flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-t-line-2 pt-4.5"
          ref={ref}
        >
          <span className="font-mono text-[13px] text-accent-ink" aria-hidden="true">
            {no}
          </span>
          <h2 id={`${id}-title`} className="text-[clamp(44px,7.4vw,104px)] leading-[0.92] font-semibold tracking-[-0.055em]">
            <Scramble text={title} play={seen} />
          </h2>
          {kicker && (
            <p className="ml-auto font-mono text-[12px] tracking-[0.08em] text-ink-3 uppercase sm-down:ml-0 sm-down:w-full">{kicker}</p>
          )}
        </header>
        {children}
      </div>
    </section>
  )
}

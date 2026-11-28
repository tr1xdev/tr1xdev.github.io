import { useEffect, useState } from 'react'
import { about, profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { imageField, orb } from '../dither/patterns'
import type { Field } from '../dither/paint'
import { useInView } from '../hooks'
import { card, cardLabel, cn, surface } from '../ui'

const W = 120
const H = 120

const factRow = 'flex justify-between gap-4 border-t border-line py-3.5'
const factTerm = 'font-mono text-[12px] text-ink-3'
const factValue = 'text-right font-medium'

/** The optional portrait from profile.ts, dithered; the generated orb until it loads (or if it fails). */
function usePortraitField(): Field {
  const [field, setField] = useState<Field>(() => orb)
  useEffect(() => {
    if (!profile.portrait) return
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => setField(() => imageField(img, W, H))
    img.src = profile.portrait
  }, [])
  return field
}

export function About() {
  const field = usePortraitField()
  const [ref, inView] = useInView<HTMLElement>()

  return (
    <div className="grid grid-cols-12 gap-4 md-down:grid-cols-1 md-down:*:col-auto">
      <article className={cn(card, surface, 'col-span-8 flex flex-col justify-between gap-8 p-[clamp(24px,3vw,40px)] lg-down:md-up:col-span-7')} data-reveal>
        <p className="text-[clamp(26px,3.1vw,42px)] leading-[1.1] font-medium tracking-[-0.035em] text-balance">{about.statement}</p>
        <p className="max-w-[620px] text-ink-2">{about.body}</p>
      </article>

      <figure className={cn(card, 'col-span-4 overflow-hidden bg-[#0d0d10] lg-down:md-up:col-span-5')} ref={ref} data-reveal>
        <DitherCanvas
          className="aspect-square md-down:aspect-auto"
          field={field}
          width={W}
          height={H}
          play={inView && !profile.portrait}
          startAt={2}
          label={profile.portrait ? `Portrait of ${profile.handle}` : undefined}
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex justify-between px-4 py-3 font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">
          <span>{profile.partNo}</span>
          <span>systems core</span>
        </figcaption>
      </figure>

      <article className={cn(card, surface, 'col-span-7 px-[clamp(24px,3vw,32px)] pt-6 pb-3 lg-down:md-up:col-span-6')} data-reveal>
        <h3 className={cardLabel}>Focus</h3>
        <ol className="mt-3">
          {about.focus.map((f, i) => (
            <li key={f} className="flex gap-4.5 border-t border-line py-3.5 text-[17px]">
              <span className="pt-[3px] font-mono text-[12px] text-accent-ink">{String(i + 1).padStart(2, '0')}</span>
              {f}
            </li>
          ))}
        </ol>
      </article>

      <article className={cn(card, surface, 'col-span-5 px-[clamp(24px,3vw,32px)] py-6 lg-down:md-up:col-span-6')} data-reveal>
        <h3 className={cardLabel}>Quick facts</h3>
        <dl className="mt-3">
          {profile.location && (
            <div className={factRow}>
              <dt className={factTerm}>based in</dt>
              <dd className={factValue}>{profile.location}</dd>
            </div>
          )}
          {profile.tzLabel && (
            <div className={factRow}>
              <dt className={factTerm}>time zone</dt>
              <dd className={factValue}>{profile.tzLabel}</dd>
            </div>
          )}
          <div className={factRow}>
            <dt className={factTerm}>role</dt>
            <dd className={factValue}>{profile.role}</dd>
          </div>
          {profile.availability && (
            <div className={factRow}>
              <dt className={factTerm}>status</dt>
              <dd className={cn(factValue, 'inline-flex items-center gap-2 text-live-ink')}>{profile.availability}</dd>
            </div>
          )}
        </dl>
      </article>
    </div>
  )
}

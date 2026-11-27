import { useEffect, useState } from 'react'
import { about, profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { imageField, orb } from '../dither/patterns'
import type { Field } from '../dither/paint'
import { useInView } from '../hooks'

const W = 120
const H = 120

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
    <div className="bento about">
      <article className="card about-statement" data-reveal>
        <p className="about-big">{about.statement}</p>
        <p className="about-body">{about.body}</p>
      </article>

      <figure className="card about-visual" ref={ref} data-reveal>
        <DitherCanvas
          field={field}
          width={W}
          height={H}
          play={inView && !profile.portrait}
          startAt={2}
          label={profile.portrait ? `Portrait of ${profile.handle}` : undefined}
        />
        <figcaption className="mono">
          <span>{profile.partNo}</span>
          <span>systems core</span>
        </figcaption>
      </figure>

      <article className="card about-focus" data-reveal>
        <h3 className="card-label mono">Focus</h3>
        <ol>
          {about.focus.map((f, i) => (
            <li key={f}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {f}
            </li>
          ))}
        </ol>
      </article>

      <article className="card about-facts" data-reveal>
        <h3 className="card-label mono">Quick facts</h3>
        <dl>
          <div>
            <dt className="mono">based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt className="mono">time zone</dt>
            <dd>{profile.tzLabel}</dd>
          </div>
          <div>
            <dt className="mono">role</dt>
            <dd>{profile.role}</dd>
          </div>
          {profile.availability && (
            <div>
              <dt className="mono">status</dt>
              <dd>{profile.availability}</dd>
            </div>
          )}
        </dl>
      </article>
    </div>
  )
}

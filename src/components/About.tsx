import { useEffect, useState } from 'react'
import { about, profile } from '../data/profile'
import { DitherCanvas } from '../dither/DitherCanvas'
import { imageField, orb } from '../dither/patterns'
import type { Field } from '../dither/paint'
import { useInView } from '../hooks'

/** Resolution the portrait is sampled at before dithering. */
const SAMPLE = 200

/** The optional portrait from profile.ts, dithered; the generated orb until it loads (or if it fails). */
function usePortraitField(): Field {
  const [field, setField] = useState<Field>(() => orb)
  useEffect(() => {
    if (!profile.portrait) return
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => setField(() => imageField(img, SAMPLE, SAMPLE))
    img.src = profile.portrait
  }, [])
  return field
}

export function About() {
  const field = usePortraitField()
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div className="about">
      <div className="about-text">
        <p className="about-big">{about.statement}</p>
        <p className="about-body">{about.body}</p>
      </div>

      <div className="about-visual" ref={ref}>
        <DitherCanvas
          field={field}
          aspect={1}
          play={inView && !profile.portrait}
          startAt={2}
          label={profile.portrait ? `Portrait of ${profile.handle}` : undefined}
        />
      </div>

      <div className="about-col">
        <h3 className="label mono">Focus</h3>
        <ul className="rule-list">
          {about.focus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="about-col">
        <h3 className="label mono">Details</h3>
        <dl className="rule-list facts">
          {profile.location && (
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          )}
          <div>
            <dt>Time zone</dt>
            <dd>{profile.tzLabel}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{profile.role}</dd>
          </div>
          {profile.availability && (
            <div>
              <dt>Status</dt>
              <dd>{profile.availability}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

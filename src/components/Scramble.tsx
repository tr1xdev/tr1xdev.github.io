import { useScramble } from '../hooks'

/**
 * Text that decodes from random glyphs. An invisible copy of the final text reserves
 * the space, so the animation never shifts the layout; screen readers get the plain text.
 */
export function Scramble({ text, play = true, className }: { text: string; play?: boolean; className?: string }) {
  const out = useScramble(text, play)
  return (
    <span className={['scramble', className].filter(Boolean).join(' ')}>
      <span className="scramble-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="scramble-live" aria-hidden="true">
        {out}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}

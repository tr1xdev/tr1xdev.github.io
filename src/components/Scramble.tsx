import { useScramble } from '../hooks'

/**
 * Text that decodes from random glyphs.
 *
 * The real text stays in the DOM the whole time, so layout never shifts and screen readers,
 * search engines and copy-paste all see it exactly once. While the animation runs, the glyphs
 * are painted on top from `data-live` by CSS (see `.scramble` in styles/base.css).
 */
export function Scramble({ text, play = true, className }: { text: string; play?: boolean; className?: string }) {
  const out = useScramble(text, play)
  return (
    <span className={['scramble', className].filter(Boolean).join(' ')} data-live={out === text ? undefined : out}>
      {text}
    </span>
  )
}

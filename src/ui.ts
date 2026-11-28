/**
 * Class names shared by several components. Everything else is written as Tailwind utilities
 * where it is used.
 */

type ClassValue = string | false | null | undefined

/** Joins class names and skips the falsy ones, for conditional classes. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Centred page column with the fluid gutter. */
export const wrap = 'mx-auto w-full max-w-[calc(var(--wrap)+2*var(--gutter))] px-(--gutter)'

/** Bordered panel. The background is separate so a card can swap it without a class conflict. */
export const card = 'relative rounded-card border border-line print:break-inside-avoid print:bg-[#fff]! print:shadow-none!'
export const surface = 'bg-surface'

/** Small uppercase heading inside a card. */
export const cardLabel = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3'

const buttonBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-transparent font-medium ' +
  '[transition:background_0.2s,border-color_0.2s,color_0.2s,box-shadow_0.2s,translate_0.2s_var(--ease-smooth)] active:translate-y-px'

const buttonVariant = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover hover:shadow-[0_0_0_4px_rgba(255,90,31,0.18)]',
  ghost: 'border-line-2 bg-[rgba(10,10,11,0.55)] text-ink hover:border-ink',
}

const buttonSize = {
  md: 'h-11.5 px-5 py-0 text-[15px]',
  sm: 'h-9 px-4 py-0 text-[14px]',
}

/** Pill button or button-styled link. */
export function button(variant: keyof typeof buttonVariant = 'primary', size: keyof typeof buttonSize = 'md'): string {
  return cn(buttonBase, buttonVariant[variant], buttonSize[size])
}

/** Still status dot. Deliberately no pulse and no glow. */
export const led = 'inline-block size-[7px] flex-none rounded-[50%] bg-live'

/** Group colour square; reads --g, or an inline background. */
export const swatch = 'inline-block size-2.5 flex-none rounded-[2px] bg-(--g)'

export const chip = 'rounded-pill border border-line-2 px-2.5 py-[3px] text-[12px] text-ink-2'

export const note = 'font-mono text-[12px] leading-[1.6] text-ink-3'

/**
 * Arrow glyph that nudges up and right while the nearest `group` ancestor (a link) is hovered or
 * focused.
 */
export const arrow =
  'inline-block transition-transform duration-250 ease-smooth ' +
  'group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-focus-visible:translate-x-[3px] group-focus-visible:-translate-y-[3px]'

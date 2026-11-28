import { useState } from 'react'
import { cn, surface, swatch } from '../ui'
import { groups, pins, profile } from '../data/profile'
import type { GroupId } from '../data/profile'

const W = 760
const BODY = { x: 250, y: 30, w: 260, h: 500 }
const SIDE = 11
const STEP = BODY.h / (SIDE + 1)

function pinPos(index: number) {
  // index 0..21 → pin number index+1
  if (index < SIDE) {
    return { side: 'L' as const, y: BODY.y + STEP * (index + 1) }
  }
  const fromBottom = index - SIDE
  return { side: 'R' as const, y: BODY.y + BODY.h - STEP * (fromBottom + 1) }
}

const groupIds = Object.keys(groups) as GroupId[]

/** Sets --g to the group colour. Spelled out in full so Tailwind can find the class names. */
const groupColor: Record<GroupId, string> = { lang: 'g-lang', arch: 'g-arch', data: 'g-data', infra: 'g-infra' }

export function Pinout() {
  const [selected, setSelected] = useState(0)
  const [filter, setFilter] = useState<GroupId | null>(null)
  const pin = pins[selected]

  const dim = (g: GroupId) => filter !== null && filter !== g

  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)] [align-items:start] gap-[clamp(24px,4vw,48px)] md-down:grid-cols-1">
      <div className={cn(surface, 'rounded-card border border-line p-[clamp(12px,2vw,28px)] md-down:hidden')}>
        <svg className="block h-auto w-full overflow-visible" viewBox={`0 0 ${W} 560`} role="img" aria-label={`${profile.partNo} pin configuration diagram`}>
          <defs>
            {/* A 2-level ordered-dither tile for the package body, styled from CSS. */}
            <pattern id="ic-dither" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" className="fill-[#121215]" />
              <rect width="1.5" height="1.5" className="fill-[#26262c]" />
              <rect x="2" y="2" width="1.5" height="1.5" className="fill-[#26262c]" />
            </pattern>
          </defs>
          {/* body */}
          <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="6" className="fill-[url(#ic-dither)] stroke-line-3 stroke-[1.5]" />
          <path
            d={`M${BODY.x + BODY.w / 2 - 20} ${BODY.y} a20 20 0 0 0 40 0`}
            className="fill-bg stroke-line-3 stroke-[1.5]"
          />
          <circle cx={BODY.x + 22} cy={BODY.y + 22} r="5" className="fill-accent" />
          <text x={W / 2} y={262} className="fill-ink font-sans text-[44px] font-[650] tracking-[-0.04em]" textAnchor="middle">
            {profile.partNo}
          </text>
          <text x={W / 2} y={292} className="fill-accent-ink font-(family-name:--font-mono) text-[13px] tracking-[0.22em]" textAnchor="middle">
            SYSTEMS CORE
          </text>
          <text x={W / 2} y={318} className="fill-ink-3 font-(family-name:--font-mono) text-[13px] tracking-[0.08em] text-ink-3" textAnchor="middle">
            {profile.handle} · 2026
          </text>

          {pins.map((p, i) => {
            const pos = pinPos(i)
            const isL = pos.side === 'L'
            const active = i === selected
            const legX = isL ? BODY.x - 34 : BODY.x + BODY.w
            return (
              <g
                key={p.signal}
                className={cn('group cursor-pointer [outline:none] transition-opacity duration-200', groupColor[p.group], dim(p.group) && 'opacity-16')}
                tabIndex={0}
                role="button"
                aria-label={`Pin ${i + 1}: ${p.name}, ${groups[p.group].label}`}
                aria-pressed={active}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
              >
                <rect x={isL ? 0 : BODY.x + BODY.w} y={pos.y - 17} width={BODY.x} height={34} className="fill-transparent" />
                <rect x={legX} y={pos.y - 7} width={34} height={14} rx="2" className="fill-[#4a4a52] transition-[fill] duration-150 group-aria-pressed:fill-(--g) group-focus-visible:fill-(--g)" />
                <text
                  x={isL ? BODY.x + 14 : BODY.x + BODY.w - 14}
                  y={pos.y + 4.5}
                  textAnchor={isL ? 'start' : 'end'}
                  className="fill-ink-3 font-(family-name:--font-mono) text-[12px] group-aria-pressed:fill-ink"
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text
                  x={isL ? BODY.x - 48 : BODY.x + BODY.w + 48}
                  y={pos.y + 5}
                  textAnchor={isL ? 'end' : 'start'}
                  className="fill-ink font-(family-name:--font-mono) text-[18px] font-semibold tracking-[0.02em] group-aria-pressed:fill-(--g) group-focus-visible:underline"
                >
                  {p.signal}
                </text>
                <circle
                  cx={isL ? BODY.x - 48 - p.signal.length * 11.2 - 14 : BODY.x + BODY.w + 48 + p.signal.length * 11.2 + 14}
                  cy={pos.y}
                  r="3.5"
                  className="fill-(--g)"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <aside className="sticky top-[calc(var(--topbar)+24px)] grid gap-4 md-down:hidden">
        <div className="min-h-50 rounded-card border border-line-2 bg-surface-solid px-5.5 pt-5 pb-5.5" aria-live="polite">
          <div className="flex justify-between font-mono text-[12px] tracking-[0.12em] text-ink-3">
            <span>PIN {String(selected + 1).padStart(2, '0')}</span>
            <span className={cn(groupColor[pin.group], 'inline-flex items-center gap-2 text-ink before:size-2.5 before:rounded-[2px] before:bg-(--g)')}>{groups[pin.group].short}</span>
          </div>
          <p className="mt-4.5 mb-1.5 text-[44px] leading-none font-semibold tracking-[-0.045em]">{pin.name}</p>
          <p className="text-ink-2">{pin.note}</p>
          <p className="mt-3.5 font-mono text-[12px] tracking-[0.08em] text-ink-3 uppercase">{groups[pin.group].label}</p>
        </div>

        <div className="grid gap-1.5" role="group" aria-label="Filter pins by group">
          {groupIds.map((g) => {
            const count = pins.filter((p) => p.group === g).length
            const on = filter === g
            return (
              <button
                key={g}
                type="button"
                className={cn(
                  groupColor[g],
                  'grid min-h-11 cursor-pointer grid-cols-[14px_1fr_auto] items-center gap-3 rounded-control border px-3.5 py-0 text-left',
                  '[transition:border-color_0.15s,background_0.15s]',
                  on ? 'border-(--g) bg-surface-2 [box-shadow:inset_3px_0_0_var(--g)]' : 'border-line bg-[rgba(10,10,11,0.6)] hover:border-line-3',
                )}
                aria-pressed={on}
                onClick={() => setFilter(on ? null : g)}
              >
                <span className={swatch} aria-hidden="true" />
                <span>{groups[g].label}</span>
                <span className="font-mono text-[13px] text-ink-3">{count}</span>
              </button>
            )
          })}
        </div>
        <p className="font-mono text-[12px] text-ink-3">hover or tab through pins · click a group to isolate it</p>
      </aside>

      <div className="hidden md-down:grid md-down:gap-3">
        {groupIds.map((g) => (
          <div key={g} className={cn(groupColor[g], surface, 'rounded-card border border-line px-5 py-4.5')}>
            <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] text-ink-2 uppercase">
              <span className={swatch} aria-hidden="true" /> {groups[g].label}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {pins
                .filter((p) => p.group === g)
                .map((p) => (
                  <li key={p.signal} className="rounded-pill border border-line-2 px-3 py-1.5 font-medium">
                    <span>{p.name}</span>
                    <span className="hidden">{p.note}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

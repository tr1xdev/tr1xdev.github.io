import { useState } from 'react'
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

export function Pinout() {
  const [selected, setSelected] = useState(0)
  const [filter, setFilter] = useState<GroupId | null>(null)
  const pin = pins[selected]

  const dim = (g: GroupId) => filter !== null && filter !== g

  return (
    <div className="pinout">
      <div className="pinout-figure">
        <svg viewBox={`0 0 ${W} 560`} role="img" aria-label={`${profile.partNo} pin configuration diagram`}>
          <defs>
            {/* A 2-level ordered-dither tile for the package body, styled from CSS. */}
            <pattern id="ic-dither" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" className="ic-dither-bg" />
              <rect width="1.5" height="1.5" className="ic-dither-dot" />
              <rect x="2" y="2" width="1.5" height="1.5" className="ic-dither-dot" />
            </pattern>
          </defs>
          {/* body */}
          <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="6" className="ic-body" />
          <path
            d={`M${BODY.x + BODY.w / 2 - 20} ${BODY.y} a20 20 0 0 0 40 0`}
            className="ic-notch"
          />
          <circle cx={BODY.x + 22} cy={BODY.y + 22} r="5" className="ic-dot" />
          <text x={W / 2} y={262} className="ic-title" textAnchor="middle">
            {profile.partNo}
          </text>
          <text x={W / 2} y={292} className="ic-sub" textAnchor="middle">
            SYSTEMS CORE
          </text>
          <text x={W / 2} y={318} className="ic-sub muted" textAnchor="middle">
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
                className={`pin g-${p.group}${active ? ' is-active' : ''}${dim(p.group) ? ' is-dim' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`Pin ${i + 1}: ${p.name}, ${groups[p.group].label}`}
                aria-pressed={active}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
              >
                <rect x={isL ? 0 : BODY.x + BODY.w} y={pos.y - 17} width={BODY.x} height={34} className="pin-hit" />
                <rect x={legX} y={pos.y - 7} width={34} height={14} rx="2" className="pin-leg" />
                <text
                  x={isL ? BODY.x + 14 : BODY.x + BODY.w - 14}
                  y={pos.y + 4.5}
                  textAnchor={isL ? 'start' : 'end'}
                  className="pin-no"
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text
                  x={isL ? BODY.x - 48 : BODY.x + BODY.w + 48}
                  y={pos.y + 5}
                  textAnchor={isL ? 'end' : 'start'}
                  className="pin-label"
                >
                  {p.signal}
                </text>
                <circle
                  cx={isL ? BODY.x - 48 - p.signal.length * 11.2 - 14 : BODY.x + BODY.w + 48 + p.signal.length * 11.2 + 14}
                  cy={pos.y}
                  r="3.5"
                  className="pin-tag"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <aside className="pinout-panel">
        <div className="pin-detail" aria-live="polite">
          <div className="pd-row mono">
            <span>PIN {String(selected + 1).padStart(2, '0')}</span>
            <span className={`pd-group g-${pin.group}`}>{groups[pin.group].short}</span>
          </div>
          <p className="pd-name">{pin.name}</p>
          <p className="pd-note">{pin.note}</p>
          <p className="pd-meta mono">{groups[pin.group].label}</p>
        </div>

        <div className="legend" role="group" aria-label="Filter pins by group">
          {groupIds.map((g) => {
            const count = pins.filter((p) => p.group === g).length
            const on = filter === g
            return (
              <button
                key={g}
                type="button"
                className={`legend-item g-${g}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => setFilter(on ? null : g)}
              >
                <span className="swatch" aria-hidden="true" />
                <span className="legend-label">{groups[g].label}</span>
                <span className="legend-count mono">{count}</span>
              </button>
            )
          })}
        </div>
        <p className="panel-hint mono">hover or tab through pins · click a group to isolate it</p>
      </aside>

      <div className="pin-groups">
        {groupIds.map((g) => (
          <div key={g} className={`pg g-${g}`}>
            <h3 className="pg-title mono">
              <span className="swatch" aria-hidden="true" /> {groups[g].label}
            </h3>
            <ul className="pg-list">
              {pins
                .filter((p) => p.group === g)
                .map((p) => (
                  <li key={p.signal}>
                    <span className="pg-name">{p.name}</span>
                    <span className="pg-note">{p.note}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

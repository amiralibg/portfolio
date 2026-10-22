// Dock app icons, drawn after the macOS ones: a superellipse tile with a
// gradient fill, a hairline highlight along its inner edge and a soft baked-in
// shadow, with the glyph inset inside. Pure SVG, so they stay sharp at every
// magnification step and need no image requests.
import { useId } from 'react'
import type { ReactNode } from 'react'
import { GitHubIcon, LinkedInIcon, XIcon } from './icons'

/** Apple's icon tile is a continuous-curvature rounded square; a superellipse
 *  with n = 5 is the closest simple fit (a border-radius corner reads as a
 *  web button next to it). 100-unit grid, tile spanning 6..94 so the shadow
 *  has room. Sampled in angle, which packs the points into the corners. */
const TILE = (() => {
  const n = 5
  const r = 44
  const steps = 200
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = (2 * Math.PI * i) / steps
    const c = Math.cos(t)
    const s = Math.sin(t)
    const x = 50 + r * Math.sign(c) * Math.abs(c) ** (2 / n)
    const y = 50 + r * Math.sign(s) * Math.abs(s) ** (2 / n)
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
})()

interface TileProps {
  /** Top and bottom stops of the tile's vertical gradient. */
  from: string
  to: string
  /** Strength of the inner-edge highlight; dark tiles want more. */
  rim?: number
  children: ReactNode
}

function Tile({ from, to, rim = 0.35, children }: TileProps) {
  // Gradient and clip ids must be unique per document: the phone overlay can
  // mount a second dock while the 3D one is still in the DOM.
  const id = `ai${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg viewBox="0 0 100 100" className="app-icon" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={rim} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={rim * 0.25} />
          <stop offset="1" stopColor="#fff" stopOpacity={rim * 0.5} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={TILE} />
        </clipPath>
        <filter id={`${id}s`} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.3" floodColor="#000" floodOpacity="0.32" />
        </filter>
      </defs>
      <path d={TILE} fill={`url(#${id}f)`} filter={`url(#${id}s)`} />
      <g clipPath={`url(#${id}c)`}>
        {children}
        {/* Stroke centred on the edge and clipped to the tile: only its inner
            half shows, a ~1px rim at dock size. */}
        <path d={TILE} fill="none" stroke={`url(#${id}r)`} strokeWidth="2.4" />
      </g>
    </svg>
  )
}

/** The résumé, Preview-style: a document on a light tile with the loupe. */
export function ResumeAppIcon() {
  return (
    <Tile from="#fbfbfd" to="#d9dce4" rim={0.9}>
      <rect x="24.6" y="18.4" width="44" height="58" rx="3" fill="#000" opacity="0.12" />
      <rect x="24" y="17" width="44" height="58" rx="3" fill="#fff" />
      <circle cx="33" cy="27.5" r="5" fill="#3d8bfd" />
      <rect x="41" y="24" width="20" height="3.2" rx="1.6" fill="#2b2f3a" />
      <rect x="41" y="29.5" width="13" height="2.4" rx="1.2" fill="#9aa1b0" />
      <rect x="29" y="38" width="33" height="2.2" rx="1.1" fill="#c3c8d2" />
      <rect x="29" y="43" width="29" height="2.2" rx="1.1" fill="#c3c8d2" />
      <rect x="29" y="48" width="31" height="2.2" rx="1.1" fill="#c3c8d2" />
      <rect x="29" y="56" width="24" height="2.2" rx="1.1" fill="#c3c8d2" />
      <rect x="29" y="61" width="27" height="2.2" rx="1.1" fill="#c3c8d2" />
      {/* loupe */}
      <path d="M71.5 71.5l9 9" stroke="#3a3d45" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="62" cy="62" r="13.5" fill="#cfe6ff" fillOpacity="0.55" stroke="#4a4e58" strokeWidth="3.6" />
      <path d="M54 57.5a9.5 9.5 0 0 1 6-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
    </Tile>
  )
}

/** Terminal.app: a near-black tile with the prompt in its top-left corner. */
export function TerminalAppIcon() {
  return (
    <Tile from="#3a3a3e" to="#0f0f11" rim={0.5}>
      {/* the inset "screen" every Terminal icon since Big Sur carries */}
      <rect x="13" y="13" width="74" height="74" rx="12" fill="#000" opacity="0.35" />
      <path
        d="M22.5 25.5l10.5 8-10.5 8"
        stroke="#f2f2f4"
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M38 43h13" stroke="#f2f2f4" strokeWidth="5.4" strokeLinecap="round" />
    </Tile>
  )
}

/** Mail: the white envelope on a sky-blue tile. */
export function MailAppIcon() {
  return (
    <Tile from="#4fc0ff" to="#1667e3" rim={0.45}>
      <rect x="18" y="30.6" width="64" height="44" rx="5" fill="#000" opacity="0.18" />
      <rect x="18" y="29" width="64" height="44" rx="5" fill="#fff" />
      <path d="M18.5 71.5L42 51.5M81.5 71.5L58 51.5" stroke="#c9d5e6" strokeWidth="1.8" fill="none" />
      <path d="M19 31l28.2 22.6a4.4 4.4 0 0 0 5.6 0L81 31" stroke="#b7c5da" strokeWidth="2.2" fill="#f1f5fb" strokeLinejoin="round" />
    </Tile>
  )
}

export function GitHubAppIcon() {
  return (
    <Tile from="#3b4048" to="#15181d" rim={0.45}>
      <GitHubIcon x={24} y={23} size={52} color="#fff" />
    </Tile>
  )
}

export function LinkedInAppIcon() {
  return (
    <Tile from="#1d84e0" to="#0a58b0" rim={0.45}>
      <LinkedInIcon x={23} y={25} size={52} color="#fff" />
    </Tile>
  )
}

export function XAppIcon() {
  return (
    <Tile from="#2a2a2c" to="#000" rim={0.45}>
      <XIcon x={28} y={28} size={44} color="#fff" />
    </Tile>
  )
}

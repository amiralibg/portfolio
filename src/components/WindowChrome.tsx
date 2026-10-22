// The bits of window chrome every fake macOS window shares: the traffic
// lights and the invisible resize handles along its edges.
import type { PointerEvent as ReactPointerEvent } from 'react'
import { RESIZE_EDGES } from '../hooks/useDraggable'
import type { ResizeEdge } from '../hooks/useDraggable'

interface TrafficLightsProps {
  onClose?: () => void
  onMinimize?: () => void
  onZoom?: () => void
  /** Accessible noun for the labels: "Close <label>". */
  label: string
}

/**
 * macOS shows all three glyphs as soon as the pointer enters the group, not
 * just on the hovered button — so the glyphs reveal on `.traffic-group:hover`.
 * A missing handler renders that light disabled (greyed, like a non-resizable
 * panel's zoom button) rather than dropping it: the trio is always three.
 */
export function TrafficLights({ onClose, onMinimize, onZoom, label }: TrafficLightsProps) {
  return (
    <span className="traffic-group">
      <button
        className="traffic red"
        onClick={onClose}
        disabled={!onClose}
        aria-label={`Close ${label}`}
      >
        <svg viewBox="0 0 8 8" aria-hidden>
          <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
        </svg>
      </button>
      <button
        className="traffic yellow"
        onClick={onMinimize}
        disabled={!onMinimize}
        aria-label={`Minimize ${label}`}
      >
        <svg viewBox="0 0 8 8" aria-hidden>
          <path d="M1.2 4h5.6" />
        </svg>
      </button>
      <button
        className="traffic green"
        onClick={onZoom}
        disabled={!onZoom}
        aria-label={`Zoom ${label}`}
      >
        {/* Two corner wedges — the full-screen glyph since Big Sur. */}
        <svg viewBox="0 0 8 8" aria-hidden>
          <path className="fill" d="M2 1.6h3.2L2 4.8z M6 6.4H2.8L6 3.2z" />
        </svg>
      </button>
    </span>
  )
}

/** Eight transparent strips/corners that start a resize. Rendered only where
 *  a mouse can use them (the 3D screen), never in the phone overlay. */
export function ResizeHandles({
  onResize,
}: {
  onResize: (edge: ResizeEdge) => (e: ReactPointerEvent<HTMLElement>) => void
}) {
  return (
    <>
      {RESIZE_EDGES.map((edge) => (
        <span
          key={edge}
          className={`win-resize ${edge}`}
          onPointerDown={onResize(edge)}
          aria-hidden
        />
      ))}
    </>
  )
}

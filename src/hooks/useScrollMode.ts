import { useEffect } from 'react'
import type { RefObject } from 'react'

interface ScrollModeOptions {
  enabled: boolean
  /** 0 = idle framing, 1 = fully zoomed into the screen. Driven by scroll. */
  zoomProgressRef: RefObject<number>
  /** True once the camera has fully zoomed and tabs are being walked. */
  engagedRef: RefObject<boolean>
  setEngaged: (v: boolean) => void
  /** The active tab's scrollable body. */
  bodyRef: RefObject<HTMLDivElement | null>
  sectionCount: number
  sectionIndexRef: RefObject<number>
  /** Move to a tab, settling at its top or bottom edge. */
  navigate: (index: number, edge: 'top' | 'bottom') => void
  /** Release the zoom and return to idle framing. */
  exit: () => void
  /** prefers-reduced-motion: snap the zoom in/out instead of scrubbing it. */
  snap?: boolean
  /** Fires on every intro-progress change (0→1). Desktop maps it to the camera;
   *  mobile maps it to a partial camera nudge + the modal scale-open scrub. */
  onIntroProgress?: (p: number) => void
}

// Pixels of scroll to travel the full camera zoom, and the cooldown that keeps
// inertial trackpad flings from skipping past several tabs at once.
const ZOOM_PER_PX = 1 / 750
const SWITCH_COOLDOWN = 420
// Exponential smoothing rate (per second) easing current values toward their
// scroll-driven targets — this is what turns stepped wheel notches into glide.
const EASE = 12
// Touch inertia: decay rate for fling velocity and the floor where it stops.
const FLING_DECAY = 2.8
const FLING_MIN = 25 // px/s
// A single wheel event can't contribute more than this many pixels (tames
// free-spinning mouse wheels without dulling trackpads).
const MAX_EVENT_DELTA = 260
// Edge resistance: extra scroll intent (px) that must accumulate at a tab's
// edge before switching tabs, so reaching the end of a section doesn't
// immediately fling the reader into the next one. Decays while idle.
const EDGE_RESIST = 340
const EDGE_DECAY = 2.5 // per second

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// Normalize wheel deltas to pixels across deltaMode variants (lines / pages).
const wheelDeltaPx = (e: WheelEvent) => {
  const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
  return clamp(dy, -MAX_EVENT_DELTA, MAX_EVENT_DELTA)
}

/**
 * Guided "scrollytelling" controller. Hijacks wheel/touch/keys so a single
 * scroll gesture first zooms the camera into the screen, then walks the resume
 * tabs — scrolling within a tab until it bottoms out, then advancing to the
 * next (and the reverse on the way back up).
 *
 * Input events only move *targets*; a persistent rAF loop eases the actual
 * zoom progress and tab scrollTop toward them, so discrete wheel notches and
 * key presses render as continuous, frame-rate-independent glide.
 */
export function useScrollMode({
  enabled,
  zoomProgressRef,
  engagedRef,
  setEngaged,
  bodyRef,
  sectionCount,
  sectionIndexRef,
  navigate,
  exit,
  snap,
  onIntroProgress,
}: ScrollModeOptions) {
  useEffect(() => {
    if (!enabled) return
    let raf = 0
    let lockUntil = 0
    let lastTime = performance.now()

    // Animated values: current glides toward target each frame.
    let zoomCurrent = clamp(zoomProgressRef.current, 0, 1)
    let zoomTarget = zoomCurrent
    let lastWrittenZoom = zoomProgressRef.current
    let scrollCurrent = 0
    let scrollTarget = 0
    // Re-read body.scrollTop before animating (after tab changes / re-engage).
    let syncScroll = true
    // Signed scroll intent accumulated while pressing against a tab edge.
    let edgeIntent = 0

    // Touch state: live velocity while dragging, decaying fling after release.
    let touchY: number | null = null
    let touchVel = 0
    let lastTouchTime = 0
    let flingVel = 0

    const setIntro = (value: number) => {
      const v = clamp(value, 0, 1)
      zoomProgressRef.current = v
      lastWrittenZoom = v
      onIntroProgress?.(v)
      return v
    }

    const engage = () => {
      setEngaged(true)
      syncScroll = true
      lockUntil = performance.now() + SWITCH_COOLDOWN
    }

    // Consume a scroll delta by moving the appropriate target.
    const advance = (dy: number) => {
      if (performance.now() < lockUntil) return

      // Phase 1 — scrub the intro (camera / modal) until fully engaged.
      if (!engagedRef.current) {
        if (snap) {
          // Reduced motion: a single gesture opens or closes instantly.
          if (dy > 0) {
            zoomCurrent = zoomTarget = 1
            setIntro(1)
            engage()
          } else if (dy < 0) {
            zoomCurrent = zoomTarget = 0
            setIntro(0)
          }
          return
        }
        zoomTarget = clamp(zoomTarget + dy * ZOOM_PER_PX, 0, 1)
        return
      }

      // Phase 2 — scroll within the active tab, stepping between tabs at edges.
      const body = bodyRef.current
      if (!body) return
      const max = body.scrollHeight - body.clientHeight
      const i = sectionIndexRef.current

      if (dy > 0) {
        if (scrollTarget < max - 1) {
          scrollTarget = Math.min(max, scrollTarget + dy)
          edgeIntent = 0
        } else if (scrollCurrent >= max - 1 && i < sectionCount - 1) {
          // At the bottom edge: demand a deliberate extra push (EDGE_RESIST)
          // before advancing, so the section's end stays readable.
          edgeIntent = edgeIntent < 0 ? dy : edgeIntent + dy
          if (edgeIntent >= EDGE_RESIST) {
            edgeIntent = 0
            flingVel = 0
            navigate(i + 1, 'top')
            syncScroll = true
            lockUntil = performance.now() + SWITCH_COOLDOWN
          }
        }
      } else if (dy < 0) {
        if (scrollTarget > 1) {
          scrollTarget = Math.max(0, scrollTarget + dy)
          edgeIntent = 0
        } else if (scrollCurrent <= 1) {
          edgeIntent = edgeIntent > 0 ? dy : edgeIntent + dy
          if (-edgeIntent >= EDGE_RESIST) {
            edgeIntent = 0
            if (i > 0) {
              flingVel = 0
              navigate(i - 1, 'bottom')
              syncScroll = true
              lockUntil = performance.now() + SWITCH_COOLDOWN
            } else {
              // Past the first tab's top → unlock and scrub the intro back out.
              setEngaged(false)
              flingVel = 0
              zoomCurrent = 1
              zoomTarget = snap ? 0 : clamp(1 + dy * ZOOM_PER_PX, 0, 1)
              if (snap) {
                zoomCurrent = 0
                setIntro(0)
              }
              lockUntil = performance.now() + 140
            }
          }
        }
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const k = snap ? 1 : 1 - Math.exp(-EASE * dt)

      // External writes (rail jumpTo / exitScroll / mode change) win: resync.
      if (zoomProgressRef.current !== lastWrittenZoom) {
        zoomCurrent = zoomTarget = clamp(zoomProgressRef.current, 0, 1)
        lastWrittenZoom = zoomProgressRef.current
        syncScroll = true
      }

      // Touch inertia: feed the decaying fling velocity back through advance.
      if (touchY == null && Math.abs(flingVel) > FLING_MIN) {
        advance(flingVel * dt)
        flingVel *= Math.exp(-FLING_DECAY * dt)
      }

      // Let edge intent leak away while idle, so a stray nudge minutes later
      // doesn't inherit an old, nearly-complete switch.
      if (edgeIntent !== 0) {
        edgeIntent *= Math.exp(-EDGE_DECAY * dt)
        if (Math.abs(edgeIntent) < 1) edgeIntent = 0
      }

      // Glide the intro zoom.
      if (zoomCurrent !== zoomTarget) {
        zoomCurrent += (zoomTarget - zoomCurrent) * k
        if (Math.abs(zoomTarget - zoomCurrent) < 0.0004) zoomCurrent = zoomTarget
        setIntro(zoomCurrent)
        if (!engagedRef.current && zoomTarget >= 1 && zoomCurrent > 0.995) {
          zoomCurrent = 1
          setIntro(1)
          engage()
        }
      }

      // Glide the active tab's scroll.
      const body = bodyRef.current
      if (engagedRef.current && body) {
        if (syncScroll) {
          scrollCurrent = scrollTarget = body.scrollTop
          syncScroll = false
        }
        const max = body.scrollHeight - body.clientHeight
        scrollTarget = clamp(scrollTarget, 0, max)
        if (scrollCurrent !== scrollTarget) {
          scrollCurrent += (scrollTarget - scrollCurrent) * k
          if (Math.abs(scrollTarget - scrollCurrent) < 0.4) scrollCurrent = scrollTarget
          body.scrollTop = scrollCurrent
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      flingVel = 0
      advance(wheelDeltaPx(e))
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
      lastTouchTime = performance.now()
      touchVel = 0
      flingVel = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return
      const y = e.touches[0]?.clientY ?? touchY
      const dy = touchY - y
      touchY = y
      e.preventDefault()
      const now = performance.now()
      const dtMove = Math.max((now - lastTouchTime) / 1000, 1 / 120)
      lastTouchTime = now
      // Low-passed instantaneous velocity, used for the release fling.
      touchVel = touchVel * 0.7 + (dy / dtMove) * 0.3
      advance(dy)
    }
    const onTouchEnd = () => {
      if (touchY == null) return
      touchY = null
      // Ignore stale velocity if the finger rested before lifting.
      if (performance.now() - lastTouchTime < 90) flingVel = touchVel
      touchVel = 0
    }

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return
      }
      const body = bodyRef.current
      const step = engagedRef.current ? (body ? body.clientHeight * 0.8 : 500) : 360
      switch (e.key) {
        case 'Escape':
          if (engagedRef.current || zoomProgressRef.current > 0) {
            e.preventDefault()
            exit()
          }
          break
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          advance(step)
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          advance(-step)
          break
        case ' ':
          // Leave Space alone when it would activate a focused control.
          if (el instanceof HTMLElement && (el.tagName === 'BUTTON' || el.tagName === 'A')) return
          e.preventDefault()
          advance(e.shiftKey ? -step : step)
          break
      }
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled, zoomProgressRef, engagedRef, setEngaged, bodyRef, sectionCount, sectionIndexRef, navigate, exit, snap, onIntroProgress])
}

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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * Guided "scrollytelling" controller. Hijacks wheel/touch/keys so a single
 * scroll gesture first zooms the camera into the screen, then walks the resume
 * tabs — scrolling within a tab until it bottoms out, then advancing to the
 * next (and the reverse on the way back up).
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
    let lockUntil = 0

    // Set the intro progress (camera zoom / modal scrub) and report it.
    const setIntro = (value: number) => {
      const v = clamp(value, 0, 1)
      zoomProgressRef.current = v
      onIntroProgress?.(v)
      return v
    }

    const advance = (dy: number) => {
      if (performance.now() < lockUntil) return

      // Phase 1 — scrub the intro (camera / modal) until fully engaged.
      if (!engagedRef.current) {
        if (snap) {
          // Reduced motion: a single gesture opens or closes instantly.
          if (dy > 0) {
            setIntro(1)
            setEngaged(true)
            lockUntil = performance.now() + SWITCH_COOLDOWN
          } else if (dy < 0) {
            setIntro(0)
          }
          return
        }
        const z = setIntro(zoomProgressRef.current + dy * ZOOM_PER_PX)
        if (z >= 1) {
          setEngaged(true)
          // Hold a beat on the first tab so a fast flick can't blow past it.
          lockUntil = performance.now() + SWITCH_COOLDOWN
        }
        return
      }

      // Phase 2 — scroll within the active tab, stepping between tabs at edges.
      const body = bodyRef.current
      if (!body) return
      const max = body.scrollHeight - body.clientHeight
      const i = sectionIndexRef.current

      if (dy > 0) {
        if (body.scrollTop < max - 1) {
          body.scrollTop = Math.min(max, body.scrollTop + dy)
        } else if (i < sectionCount - 1) {
          navigate(i + 1, 'top')
          lockUntil = performance.now() + SWITCH_COOLDOWN
        }
      } else if (dy < 0) {
        if (body.scrollTop > 1) {
          body.scrollTop = Math.max(0, body.scrollTop + dy)
        } else if (i > 0) {
          navigate(i - 1, 'bottom')
          lockUntil = performance.now() + SWITCH_COOLDOWN
        } else {
          // Past the first tab's top → unlock and scrub the intro back out.
          setEngaged(false)
          setIntro(snap ? 0 : 1 + dy * ZOOM_PER_PX)
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      advance(e.deltaY)
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return
      const y = e.touches[0]?.clientY ?? touchY
      const dy = touchY - y
      touchY = y
      e.preventDefault()
      advance(dy)
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

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled, zoomProgressRef, engagedRef, setEngaged, bodyRef, sectionCount, sectionIndexRef, navigate, exit, snap, onIntroProgress])
}

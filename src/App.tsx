import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { ResumeScreen, SunIcon, MoonIcon } from './components/ResumeScreen'
import { SECTIONS } from './components/sections'
import type { SectionId } from './components/sections'
import { useScrollMode } from './hooks/useScrollMode'
import { resume } from './data/resume'

// The 3D scene (three.js / R3F / drei) loads as its own chunk behind the loader.
const Scene = lazy(() => import('./components/Scene'))

type Theme = 'dark' | 'light'
type Mode = 'interactive' | 'scroll'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [zoomed, setZoomed] = useState(false)
  const [ready, setReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion)
  const [overlayClosing, setOverlayClosing] = useState(false)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark',
  )
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem('mode') as Mode) || 'scroll',
  )
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const screenRef = useRef<Group | null>(null)
  const zoomedRef = useRef(false)
  const closingRef = useRef(false)
  zoomedRef.current = zoomed

  // ----- scroll mode: guided scroll through the resume -----
  // Desktop drives the 3D camera zoom; mobile walks tabs inside the modal.
  const scrollActive = mode === 'scroll' && !isMobile
  const mobileScrollActive = mode === 'scroll' && isMobile
  const [section, setSection] = useState<SectionId>('about')
  const [engaged, setEngaged] = useState(false)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const zoomProgressRef = useRef(0)
  const engagedRef = useRef(false)
  const sectionIndexRef = useRef(0)
  const pendingEdgeRef = useRef<'top' | 'bottom' | null>(null)

  const setEngagedBoth = useCallback((v: boolean) => {
    engagedRef.current = v
    setEngaged(v)
  }, [])

  const navigate = useCallback((index: number, edge: 'top' | 'bottom') => {
    pendingEdgeRef.current = edge
    // Keep the index ref current synchronously so a fast fling can't act on a
    // stale value before the [section] effect below catches up.
    sectionIndexRef.current = index
    setSection(SECTIONS[index].id)
  }, [])

  const modalRef = useRef<HTMLDivElement | null>(null)

  // Mobile scroll: map the intro progress to the modal's scale-open scrub. The
  // camera nudges toward the laptop first (CameraRig, capped), then from
  // MODAL_START on the modal scales + fades in until fully open. No-op on desktop.
  const applyIntro = useCallback((p: number) => {
    const el = modalRef.current
    if (!el) return
    const MODAL_START = 0.9
    const mp = Math.min(1, Math.max(0, (p - MODAL_START) / (1 - MODAL_START)))
    const e = mp * mp * (3 - 2 * mp) // smoothstep
    el.style.opacity = String(e)
    el.style.transform = `scale(${0.82 + 0.18 * e})`
    el.style.borderRadius = `${(1 - e) * 34}px`
    el.style.pointerEvents = e > 0.98 ? 'auto' : 'none'
  }, [])

  const exitScroll = useCallback(() => {
    zoomProgressRef.current = 0
    applyIntro(0)
    setEngagedBoth(false)
  }, [applyIntro, setEngagedBoth])

  const reveal = useCallback(() => setReady(true), [])
  const onSceneReady = useCallback(() => setSceneReady(true), [])

  const closeResume = useCallback(() => {
    if (!zoomedRef.current) return
    if (!isMobile) {
      setZoomed(false)
      return
    }
    if (closingRef.current) return
    closingRef.current = true
    setOverlayClosing(true)
    setTimeout(() => {
      closingRef.current = false
      setOverlayClosing(false)
      setZoomed(false)
    }, 420)
  }, [isMobile])

  // Jump straight to the screen (desktop click / rail) at a specific tab.
  const jumpTo = (index: number) => {
    zoomProgressRef.current = 1
    setEngagedBoth(true)
    navigate(index, 'top')
  }

  // Mobile scroll: tapping the laptop opens the modal fully (skips the scrub).
  const engageMobile = () => {
    setSection('about')
    zoomProgressRef.current = 1
    applyIntro(1)
    setEngagedBoth(true)
  }

  // Keep the index ref in sync so the controller can read it synchronously.
  useEffect(() => {
    sectionIndexRef.current = SECTIONS.findIndex((s) => s.id === section)
  }, [section])

  // After a scroll-driven tab change, settle the new body at the right edge.
  useLayoutEffect(() => {
    const edge = pendingEdgeRef.current
    const body = bodyRef.current
    if (!edge || !body) return
    body.scrollTop = edge === 'bottom' ? body.scrollHeight : 0
    pendingEdgeRef.current = null
  }, [section])

  // Switch mode, resetting the guided state and remembering the choice.
  const changeMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
    localStorage.setItem('mode', next)
    zoomProgressRef.current = 0
    applyIntro(0)
    setEngagedBoth(false)
    setSection('about')
    setZoomed(false)
  }

  useScrollMode({
    enabled: ready && (scrollActive || mobileScrollActive),
    zoomProgressRef,
    engagedRef,
    setEngaged: setEngagedBoth,
    bodyRef,
    sectionCount: SECTIONS.length,
    sectionIndexRef,
    navigate,
    exit: exitScroll,
    snap: reducedMotion,
    // Mobile maps intro progress to the modal scrub; desktop uses the camera.
    onIntroProgress: mobileScrollActive ? applyIntro : undefined,
  })

  // Interactive mobile opens the resume as a fullscreen modal (tap to open).
  const zoomed3D = zoomed && !isMobile
  // Whether the on-screen resume is "live": engaged in scroll mode, zoomed otherwise
  const screenActive = scrollActive || mobileScrollActive ? engaged : zoomed3D

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0a0a10' : '#f6f7fa')
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Esc closes the resume
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeResume()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeResume])

  // While the resume is open: double-click outside it (desktop) or double-tap
  // non-interactive space (mobile) dismisses it. Works for the interactive
  // modal and the engaged mobile-scroll modal alike.
  useEffect(() => {
    const guidedMobile = mobileScrollActive && engaged
    if (!zoomed && !guidedMobile) return
    const close = guidedMobile ? exitScroll : closeResume
    const onDblClick = (e: MouseEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('.screen-content, .mobile-overlay, button')) return
      close()
    }
    let lastTap = 0
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('a, button, .tab')) return
      const now = Date.now()
      if (now - lastTap < 320) close()
      lastTap = now
    }
    document.addEventListener('dblclick', onDblClick)
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('dblclick', onDblClick)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [zoomed, mobileScrollActive, engaged, closeResume, exitScroll])

  return (
    <div className={`page${zoomed3D ? ' is-zoomed' : ''}${ready ? ' is-ready' : ''}`}>
      <Suspense fallback={null}>
        <Scene
          ready={ready}
          zoomed={zoomed3D}
          active={screenActive}
          theme={theme}
          onToggleTheme={toggleTheme}
          screenRef={screenRef}
          onScreenClick={
            scrollActive
              ? () => jumpTo(sectionIndexRef.current)
              : mobileScrollActive
                ? engageMobile
                : () => setZoomed(true)
          }
          scrollMode={scrollActive || mobileScrollActive}
          cameraMaxZoom={mobileScrollActive ? 0.5 : 1}
          zoomProgressRef={zoomProgressRef}
          section={section}
          onSectionChange={setSection}
          bodyRef={isMobile ? undefined : bodyRef}
          reducedMotion={reducedMotion}
          onReady={onSceneReady}
        />
      </Suspense>

      <div className="vignette" />
      <div className="grain" />
      <LoadingScreen sceneReady={sceneReady} onReveal={reveal} />

      <header className="ui top ui-fade">
        <span className="wordmark">
          {resume.name.split(' ')[0].toLowerCase()}
          <i>.</i>
        </span>
        <div className="top-actions">
          <div className="mode-switch" role="radiogroup" aria-label="Viewing mode">
            <button
              role="radio"
              aria-checked={mode === 'interactive'}
              className={mode === 'interactive' ? 'active' : ''}
              onClick={() => changeMode('interactive')}
            >
              interactive
            </button>
            <button
              role="radio"
              aria-checked={mode === 'scroll'}
              className={mode === 'scroll' ? 'active' : ''}
              onClick={() => changeMode('scroll')}
            >
              scroll
            </button>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <span className="corner bl ui ui-fade">{resume.title}</span>
      <span className="corner br ui ui-fade">© {new Date().getFullYear()}</span>

      {(scrollActive || mobileScrollActive ? !engaged : !zoomed) && (
        <div className={`hint${scrollActive || mobileScrollActive ? ' scroll-cue' : ''}`}>
          {scrollActive || mobileScrollActive ? (
            <>
              scroll to explore
              <span className="cue-chevrons" aria-hidden>
                <span />
                <span />
              </span>
            </>
          ) : isMobile ? (
            'tap the screen to read the resume'
          ) : (
            'click the screen to read the resume'
          )}
        </div>
      )}

      {zoomed3D && (
        <button className="back-button" onClick={closeResume}>
          ← back <kbd>esc</kbd>
        </button>
      )}

      {scrollActive && ready && (
        <nav className="scroll-rail" aria-label="Resume sections">
          <button
            className={`rail-item${engaged ? '' : ' active'}`}
            onClick={exitScroll}
            aria-current={engaged ? undefined : 'true'}
          >
            <span>intro</span>
            <i />
          </button>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className={`rail-item${engaged && s.id === section ? ' active' : ''}`}
              onClick={() => jumpTo(i)}
              aria-current={engaged && s.id === section ? 'true' : undefined}
            >
              <span>{s.label}</span>
              <i />
            </button>
          ))}
        </nav>
      )}

      {zoomed && isMobile && (
        <div className={`mobile-overlay${overlayClosing ? ' closing' : ''}`}>
          <ResumeScreen zoomed theme={theme} onToggleTheme={toggleTheme} variant="overlay" />
        </div>
      )}

      {/* Mobile scroll mode: always mounted, scaled open by the scroll scrub. */}
      {mobileScrollActive && ready && (
        <div className="mobile-overlay scroll-scrub" ref={modalRef}>
          <ResumeScreen
            zoomed={engaged}
            theme={theme}
            onToggleTheme={toggleTheme}
            variant="overlay"
            section={section}
            onSectionChange={setSection}
            bodyRef={bodyRef}
          />
        </div>
      )}
    </div>
  )
}

/* Awwwards-style loader: staggered letter reveal, progress line, big counter,
   then the two background panels split apart to reveal the scene. The progress
   is synthetic — it eases toward 100% and lands there once the lazy 3D scene
   (chunk + model) has loaded, so this stays free of any three.js imports. */
function LoadingScreen({ sceneReady, onReveal }: { sceneReady: boolean; onReveal: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'exit' | 'gone'>('loading')
  const [mountedAt] = useState(() => Date.now())

  // Ease toward the target: ~92% while loading, snapping to 100% when ready.
  useEffect(() => {
    if (phase !== 'loading') return
    let raf = 0
    const tick = () => {
      setProgress((p) => {
        const target = sceneReady ? 100 : 92
        const next = p + (target - p) * 0.05
        return sceneReady && next > 99.5 ? 100 : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, sceneReady])

  useEffect(() => {
    if (new URLSearchParams(location.search).has('loader')) return // debug: freeze loader
    if (phase !== 'loading' || !sceneReady || progress < 99.9) return
    const wait = Math.max(0, 1400 - (Date.now() - mountedAt))
    const t = setTimeout(() => setPhase('exit'), wait)
    return () => clearTimeout(t)
  }, [sceneReady, progress, phase, mountedAt])

  useEffect(() => {
    if (phase !== 'exit') return
    onReveal()
    const t = setTimeout(() => setPhase('gone'), 1600)
    return () => clearTimeout(t)
  }, [phase, onReveal])

  if (phase === 'gone') return null

  return (
    <div className={`loading ${phase}`}>
      <div className="loading-panel top" />
      <div className="loading-panel bottom" />
      <div className="loading-center">
        <h1 className="loading-title" aria-label={resume.name}>
          {resume.name.split('').map((ch, i) => (
            <span className="loading-letter-mask" key={i} aria-hidden>
              <span className="loading-letter" style={{ '--i': i } as React.CSSProperties}>
                {ch === ' ' ? ' ' : ch}
              </span>
            </span>
          ))}
        </h1>
        <div className="loading-line">
          <div style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <span className="loading-sub">portfolio — {new Date().getFullYear()}</span>
      </div>
      <span className="loading-counter">{Math.round(progress)}</span>
    </div>
  )
}

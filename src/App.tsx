import * as THREE from 'three'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, useProgress } from '@react-three/drei'
import { MacBook } from './components/MacBook'
import { CameraRig } from './components/CameraRig'
import { ResumeScreen, SunIcon, MoonIcon } from './components/ResumeScreen'
import { resume } from './data/resume'

type Theme = 'dark' | 'light'

export default function App() {
  const [zoomed, setZoomed] = useState(false)
  const [ready, setReady] = useState(false)
  const [overlayClosing, setOverlayClosing] = useState(false)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark',
  )
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const screenRef = useRef<THREE.Group | null>(null)
  const zoomedRef = useRef(false)
  const closingRef = useRef(false)
  zoomedRef.current = zoomed

  // On mobile the resume opens as a fullscreen modal — the camera stays put
  const zoomed3D = zoomed && !isMobile

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

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

  // Esc closes the resume
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeResume()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeResume])

  // While zoomed: double-click outside the resume (desktop) or double-tap
  // anything non-interactive (mobile) closes it.
  useEffect(() => {
    if (!zoomed) return
    const onDblClick = (e: MouseEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('.screen-content, .mobile-overlay, button')) return
      closeResume()
    }
    let lastTap = 0
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('a, button, .tab')) return
      const now = Date.now()
      if (now - lastTap < 320) closeResume()
      lastTap = now
    }
    document.addEventListener('dblclick', onDblClick)
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('dblclick', onDblClick)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [zoomed, closeResume])

  return (
    <div className={`page${zoomed3D ? ' is-zoomed' : ''}${ready ? ' is-ready' : ''}`}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 30, 150], fov: 35 }}>
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <MacBook
            ready={ready}
            zoomed={zoomed3D}
            theme={theme}
            onToggleTheme={toggleTheme}
            screenRef={screenRef}
            onScreenClick={() => setZoomed(true)}
          />
          <Environment preset="city" />
        </Suspense>
        <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={90} blur={1.75} far={20} />
        <CameraRig ready={ready} zoomed={zoomed3D} screenRef={screenRef} />
      </Canvas>

      <div className="vignette" />
      <div className="grain" />
      <LoadingScreen onReveal={() => setReady(true)} />

      <header className="ui top ui-fade">
        <span className="wordmark">
          {resume.name.split(' ')[0].toLowerCase()}
          <i>.</i>
        </span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <span className="corner bl ui ui-fade">{resume.title}</span>
      <span className="corner br ui ui-fade">© {new Date().getFullYear()}</span>

      {!zoomed && (
        <div className="hint">
          {isMobile ? 'tap the screen to read the resume' : 'click the screen to read the resume'}
        </div>
      )}

      {zoomed3D && (
        <button className="back-button" onClick={closeResume}>
          ← back <kbd>esc</kbd>
        </button>
      )}

      {zoomed && isMobile && (
        <div className={`mobile-overlay${overlayClosing ? ' closing' : ''}`}>
          <ResumeScreen zoomed theme={theme} onToggleTheme={toggleTheme} variant="overlay" />
        </div>
      )}
    </div>
  )
}

/* Awwwards-style loader: staggered letter reveal, progress line, big counter,
   then the two background panels split apart to reveal the scene. */
function LoadingScreen({ onReveal }: { onReveal: () => void }) {
  const { progress, active } = useProgress()
  const [phase, setPhase] = useState<'loading' | 'exit' | 'gone'>('loading')
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    if (new URLSearchParams(location.search).has('loader')) return // debug: freeze loader
    if (phase !== 'loading' || progress < 100 || active) return
    const wait = Math.max(0, 1600 - (Date.now() - mountedAt.current))
    const t = setTimeout(() => setPhase('exit'), wait)
    return () => clearTimeout(t)
  }, [progress, active, phase])

  useEffect(() => {
    if (phase !== 'exit') return
    onReveal()
    const t = setTimeout(() => setPhase('gone'), 1600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

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

import { Suspense, useEffect } from 'react'
import type { RefObject } from 'react'
import type { Group } from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { MacBook } from './MacBook'
import { CameraRig } from './CameraRig'
import { PerfOverlay } from './PerfOverlay'
import type { SectionId } from './sections'

interface SceneProps {
  ready: boolean
  /** Interactive-mode zoom (drives the binary camera framing). */
  zoomed: boolean
  /** Screen is live: engaged in scroll mode, zoomed in interactive mode. */
  active: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  screenRef: RefObject<Group | null>
  onScreenClick?: () => void
  scrollMode: boolean
  /** Caps how far the scroll zoom travels (mobile nudges in only partway). */
  cameraMaxZoom?: number
  zoomProgressRef: RefObject<number>
  section: SectionId
  onSectionChange: (id: SectionId) => void
  detailSlug?: string | null
  onDetailSlugChange?: (slug: string | null) => void
  onOpenSpotlight?: () => void
  notifState?: 'hidden' | 'in' | 'out'
  onNotifClick?: () => void
  onNotifDismiss?: () => void
  bodyRef?: RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  /** Fires once the model + environment have finished loading. */
  onReady: () => void
}

// Sits inside the asset Suspense boundary, so it only mounts once the GLB and
// the environment map have resolved — our signal that the scene is ready.
function LoadProbe({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady])
  return null
}

/**
 * The whole 3D scene, kept in its own lazy chunk so three.js / R3F / drei stay
 * out of the initial bundle. The loader paints from the main bundle while this
 * downloads behind it.
 */
export default function Scene({
  ready,
  zoomed,
  active,
  theme,
  onToggleTheme,
  screenRef,
  onScreenClick,
  scrollMode,
  cameraMaxZoom,
  zoomProgressRef,
  section,
  onSectionChange,
  detailSlug,
  onDetailSlugChange,
  onOpenSpotlight,
  notifState,
  onNotifClick,
  onNotifDismiss,
  bodyRef,
  reducedMotion,
  onReady,
}: SceneProps) {
  return (
    /* dpr is capped at 1.5 rather than 2: on a retina display, 2 means four
       times the pixels of 1, and for a single soft-lit product shot the extra
       resolution is not worth roughly doubling the fragment work. */
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 30, 150], fov: 35 }}>
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <MacBook
          ready={ready}
          active={active}
          theme={theme}
          onToggleTheme={onToggleTheme}
          screenRef={screenRef}
          onScreenClick={onScreenClick}
          scrollMode={scrollMode}
          zoomProgressRef={zoomProgressRef}
          section={section}
          onSectionChange={onSectionChange}
          detailSlug={detailSlug}
          onDetailSlugChange={onDetailSlugChange}
          onOpenSpotlight={onOpenSpotlight}
          notifState={notifState}
          onNotifClick={onNotifClick}
          onNotifDismiss={onNotifDismiss}
          bodyRef={bodyRef}
          reducedMotion={reducedMotion}
        />
        {/* Self-hosted, NOT `preset="city"`. The preset fetches this same file
            from raw.githack.com, which now 403s — and because the loader waits
            on this Suspense boundary, a failed fetch left the site stuck on the
            loading screen forever. Same reason public/draco/ is vendored. */}
        <Environment files="/hdri/potsdamer_platz_1k.hdr" />
        <LoadProbe onReady={onReady} />
      </Suspense>
      {/* `frames` is the important prop here. drei defaults it to Infinity,
          which re-renders the scene into a depth target AND runs two
          full-screen blur passes on EVERY frame — forever — for a shadow under
          a laptop that only drifts a fraction of a unit.

          Keying on `ready` remounts this when the intro starts, resetting the
          internal counter; 120 frames (~2s) covers the rise-in animation, then
          it freezes. Before that it renders normally, which is free anyway
          because the loading screen is still covering everything. */}
      <ContactShadows
        key={ready ? 'settled' : 'intro'}
        frames={ready ? 120 : Infinity}
        position={[0, -0.5, 0]}
        opacity={0.4}
        scale={90}
        blur={1.75}
        far={20}
      />
      {/* Frame stats on demand — see PerfOverlay for why this ships. */}
      {new URLSearchParams(location.search).has('perf') && <PerfOverlay />}
      <CameraRig
        ready={ready}
        zoomed={zoomed}
        screenRef={screenRef}
        scrollMode={scrollMode}
        maxZoom={cameraMaxZoom}
        zoomProgressRef={zoomProgressRef}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  )
}

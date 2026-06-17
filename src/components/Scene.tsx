import { Suspense, useEffect } from 'react'
import type { RefObject } from 'react'
import type { Group } from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { MacBook } from './MacBook'
import { CameraRig } from './CameraRig'
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
  bodyRef,
  reducedMotion,
  onReady,
}: SceneProps) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 30, 150], fov: 35 }}>
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
          bodyRef={bodyRef}
          reducedMotion={reducedMotion}
        />
        <Environment preset="city" />
        <LoadProbe onReady={onReady} />
      </Suspense>
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={90} blur={1.75} far={20} />
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

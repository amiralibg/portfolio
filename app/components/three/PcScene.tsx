import { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import PortfolioScreen from "./PortfolioScreen";

/**
 * Camera animation component with eased zoom-in reveal and spin
 */
function CameraAnimation({
  onComplete,
}: {
  onComplete: (complete: boolean) => void;
}) {
  const { camera } = useThree();
  const [startTime] = useState(Date.now());
  const animationDuration = 3000; // 3 seconds
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Set initial camera position (very far out for dramatic reveal)
    camera.position.set(-300, 60, 0);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    if (progress >= 1) {
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete(true);
      }
      return; // Animation complete
    }

    // Eased interpolation (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3);

    // Initial and target positions
    const startPos = new THREE.Vector3(-300, 60, 0);
    const endPos = new THREE.Vector3(-100, 20, 0);

    // Calculate position with spin
    const currentRadius = THREE.MathUtils.lerp(300, 100, easeOut);
    const currentHeight = THREE.MathUtils.lerp(60, 20, easeOut);

    // Add spinning motion (1 full rotations during zoom)
    const spinAngle = progress * Math.PI * 2; // 1 full rotation
    const x = -Math.cos(spinAngle) * currentRadius;
    const z = Math.sin(spinAngle) * currentRadius;

    camera.position.set(x, currentHeight, z);

    // Always look at the computer
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * Hook to get responsive scale and position based on viewport size
 */
function useResponsiveModelSettings() {
  const [settings, setSettings] = useState({
    scale: 0.95,
    position: [0, -2.5, 0] as [number, number, number],
  });

  useEffect(() => {
    const updateSettings = () => {
      const width = window.innerWidth;

      // Mobile: smaller scale, higher position
      if (width < 768) {
        setSettings({
          scale: 0.7,
          position: [0, -1.5, 0],
        });
      }
      // Tablet: medium scale
      else if (width < 1024) {
        setSettings({
          scale: 0.7,
          position: [0, -2, 0],
        });
      }
      // Desktop: original scale
      else {
        setSettings({
          scale: 0.95,
          position: [0, -2.5, 0],
        });
      }
    };

    updateSettings();
    window.addEventListener("resize", updateSettings);
    return () => window.removeEventListener("resize", updateSettings);
  }, []);

  return settings;
}

/**
 * 3D Model component with Portofolio screen overlay
 */
function PcModel({ showScreen }: { showScreen: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scale, position } = useResponsiveModelSettings();
  const [contentReady, setContentReady] = useState(false);

  // Load GLB model
  const { nodes, materials } = useGLTF("/models/zombie_computer.glb");

  // Ensure content renders after showScreen becomes true
  useEffect(() => {
    if (showScreen) {
      const timer = setTimeout(() => {
        setContentReady(true);
        console.log("Screen content is now ready to display, contentReady:", true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setContentReady(false);
    }
  }, [showScreen]);

  console.log("PcModel render - showScreen:", showScreen, "contentReady:", contentReady);

  return (
    <group ref={groupRef} dispose={null} scale={scale} position={position}>
      {Object.entries(nodes).map(([nodeName, node]: [string, any]) => {
        if (node.isMesh) {
          const isScreen = node.material?.name === "computer_screen";

          return (
            <mesh
              key={nodeName}
              geometry={node.geometry}
              material={materials[node.material?.name] || node.material}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            >
              {isScreen && showScreen && (
                <Html
                  transform
                  occlude={false}
                  sprite={false}
                  position={[0.03, 0, 0]}
                  rotation={[0, -1.57, 0]}
                  scale={0.133}
                  style={{
                    width: 530,
                    height: 450,
                  }}
                  zIndexRange={[100, 0]}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      visibility: contentReady ? "visible" : "hidden",
                      opacity: contentReady ? 1 : 0,
                      transition: "opacity 0.5s ease-in-out",
                    }}
                    className="crt-screen scanlines"
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <PortfolioScreen />
                    </div>
                  </div>
                </Html>
              )}
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

/**
 * Main PcScene component - simplified to show default model
 */
export default function PcScene() {
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Fade in the scene slightly after mount
    const timer = setTimeout(() => {
      setSceneOpacity(1);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = (complete: boolean) => {
    setAnimationComplete(complete);
    console.log("Camera animation complete, showing screen content.");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        opacity: sceneOpacity,
        transition: "opacity 1s ease-in-out",
      }}
    >
      <Canvas
        camera={{ position: [-300, 60, 0], fov: 20, zoom: 5 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Camera animation */}
          <CameraAnimation onComplete={handleAnimationComplete} />

          {/* Basic lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.0} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />

          {/* Default MacBook Model */}
          <PcModel showScreen={animationComplete} />

          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the GLTF model
useGLTF.preload("/models/zombie_computer.glb");

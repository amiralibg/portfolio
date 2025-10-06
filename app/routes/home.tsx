import { lazy, Suspense } from "react";

export function meta() {
  return [
    { title: "Amirali Beigi" },
    { name: "description", content: "Amirali Beigi's personal website." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#0b0b0d" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/site.webmanifest" },
  ];
}

// Lazy load the heavy 3D scene component
const PcScene = lazy(() => import("../components/three/PcScene"));

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-white overflow-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0b0b0d] via-purple-950/10 to-[#0b0b0d]">
            <div className="text-center relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-purple-500/20 blur-2xl animate-pulse"></div>
              </div>

              {/* Main spinner container */}
              <div className="relative">
                {/* Outer ring */}
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-purple-500 border-r-pink-500 mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]"></div>

                {/* Middle ring - reverse spin */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-spin-reverse rounded-full h-20 w-20 border-4 border-transparent border-b-cyan-400 border-l-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>

                {/* Inner pulse dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              </div>

              {/* Loading text with gradient */}
              <div className="mt-8 space-y-2">
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 font-semibold text-lg animate-pulse">
                  Loading Experience
                </p>
                <div className="flex justify-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <PcScene />
      </Suspense>
    </div>
  );
}

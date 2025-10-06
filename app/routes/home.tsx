import PcScene from "~/components/three/PcScene";

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
  ];
}

export function links() {
  return [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "192x192", href: "/android-chrome-192x192.png" },
    { rel: "icon", type: "image/png", sizes: "512x512", href: "/android-chrome-512x512.png" },
    { rel: "manifest", href: "/site.webmanifest" },
  ];
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-white overflow-hidden">
      <PcScene />
    </div>
  );
}

export function meta() {
  return [
    { title: "Amirali BG" },
    { name: "description", content: "Amirali BG's personal website." },
  ];
}

import PcScene from "../components/three/PcScene";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-white overflow-hidden">
      <PcScene />
    </div>
  );
}

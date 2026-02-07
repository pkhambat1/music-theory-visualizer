import VisualizerPanel from "./components/VisualizerPanel";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050510] px-4 py-8 sm:px-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(34,211,238,0.04)_0%,transparent_50%)]" />
      <div className="relative">
        <VisualizerPanel />
      </div>
    </div>
  );
}

import VisualizerPanel from "./components/VisualizerPanel";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050510] px-4 py-8 sm:px-8">
      {/* Layered ambient background glows */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(34,211,238,0.07)_0%,transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_80%_85%,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
      {/* Subtle dot pattern overlay */}
      <div className="pointer-events-none fixed inset-0 dot-pattern" />
      <div className="relative">
        <VisualizerPanel />
      </div>
    </div>
  );
}

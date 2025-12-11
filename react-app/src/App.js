import React from "react";
import "keen-slider/keen-slider.min.css";
import VisualizerPanel from "./components/VisualizerPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 px-8 py-6">
      <VisualizerPanel />
    </div>
  );
}

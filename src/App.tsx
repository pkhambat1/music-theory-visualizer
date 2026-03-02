import { ThemeProvider } from "./hooks"
import VisualizerPanel from "./components/VisualizerPanel"

export default function App() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[var(--app-pageBg)] px-4 py-8 sm:px-8 transition-colors duration-0">
        <div className="relative">
          <VisualizerPanel />
        </div>
      </div>
    </ThemeProvider>
  )
}

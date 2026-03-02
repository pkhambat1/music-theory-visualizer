import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import type { ThemeMode } from "./lib/theme"
import { registerCssColors } from "./lib/theme"

// Detect initial theme before first render to prevent flash
function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem("theme-mode")
  if (stored === "light" || stored === "dark") return stored
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "light"
}

const initialMode = getInitialMode()
registerCssColors(initialMode)
document.documentElement.classList.toggle("dark", initialMode === "dark")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

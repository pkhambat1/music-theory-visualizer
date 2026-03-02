import { Plus } from "lucide-react"
import Button from "./Button"

export default function PopoverTrigger() {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild={false}
      className="h-5 w-5 rounded-full border border-[var(--app-border)] bg-[var(--app-surfaceSubtle)] p-0 text-[var(--app-textMuted)] hover:bg-[var(--app-surfaceHover)] hover:text-[var(--app-textSecondary)]"
      aria-label="Open menu"
    >
      <Plus size={10} strokeWidth={2.5} />
    </Button>
  )
}

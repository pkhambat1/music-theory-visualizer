import { Plus } from "lucide-react"
import Button from "./Button"

export default function PopoverTrigger() {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild={false}
      className="h-5 w-5 rounded-full border border-[var(--app-border)] bg-gray-50 p-0 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
      aria-label="Open menu"
    >
      <Plus size={10} strokeWidth={2.5} />
    </Button>
  )
}

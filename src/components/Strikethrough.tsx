/** Diagonal slash overlay — place inside a `relative` container. */
export default function Strikethrough() {
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <span className="block h-px w-5 bg-gray-500 rotate-[-45deg]" />
    </span>
  )
}

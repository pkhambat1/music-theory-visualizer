import { useEffect, useLayoutEffect, useRef } from "react"

/**
 * Calls `measure` on layout changes, window resize, and container resize.
 * The measure callback is always read from a ref so the ResizeObserver
 * stays alive across dependency changes.
 */
export function useContainerMeasure(
  containerRef: React.RefObject<HTMLDivElement | null>,
  measure: () => void,
) {
  const measureRef = useRef(measure)
  measureRef.current = measure

  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const ro = new ResizeObserver(() => measureRef.current?.())
    ro.observe(container)

    const onResize = () => measureRef.current?.()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      ro.disconnect()
    }
  }, [containerRef])
}

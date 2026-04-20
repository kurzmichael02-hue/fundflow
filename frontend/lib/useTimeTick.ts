"use client"
import { useEffect, useState } from "react"

// Force a re-render every N seconds so components that read Date.now()
// inline (overdue pills, "X hours late" labels, the dashboard greeting
// that counts overdue follow-ups) actually refresh without needing the
// user to click around.
//
// Why not just re-run the useMemo on an interval? Because the useMemo
// depends on state arrays, not on time — if time passes, deps don't
// change, memo doesn't recompute. A tick state adds a dep that moves.
//
// Default interval is 60s. That's the right granularity for minute-
// resolution copy ("3h late", "due today") without churning the app.
// The hook returns the tick count in case a consumer wants to use it
// as a dep directly; most callers can ignore the return value and just
// rely on the re-render it triggers.
export function useTimeTick(intervalMs: number = 60_000): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}

"use client"
import { useEffect, useState } from "react"

// Press `?` (Shift+/) anywhere outside an input to open this. Lists every
// keyboard shortcut the app supports — command palette, the g+letter
// navigation, plus a few page-specific ones. Cheatsheet only, doesn't bind
// the actual shortcuts (those live in AppNav, CommandPalette, and the
// individual pages).

type Group = {
  label: string
  rows: Array<{ keys: string[]; desc: string }>
}

const GROUPS: Group[] = [
  {
    label: "Global",
    rows: [
      { keys: ["⌘", "K"], desc: "Open command palette" },
      { keys: ["Ctrl", "K"], desc: "Open command palette (Windows / Linux)" },
      { keys: ["?"], desc: "Open this cheatsheet" },
      { keys: ["Esc"], desc: "Close any overlay" },
    ],
  },
  {
    label: "Navigate",
    rows: [
      { keys: ["g", "d"], desc: "Dashboard" },
      { keys: ["g", "i"], desc: "Investors" },
      { keys: ["g", "p"], desc: "Pipeline" },
      { keys: ["g", "a"], desc: "Analytics" },
      { keys: ["g", "r"], desc: "Investor directory" },
      { keys: ["g", "f"], desc: "Profile" },
    ],
  },
  {
    label: "Investors page",
    rows: [
      { keys: ["click"], desc: "Open detail drawer" },
      { keys: ["Shift", "click"], desc: "Range-select rows" },
      { keys: ["click checkbox"], desc: "Toggle selection" },
    ],
  },
]

export default function ShortcutsCheatsheet() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when the user is typing in a field or modifier-combos —
      // we don't want `?` to pop a modal in the middle of an email.
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const editable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
      if (editable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,10,0.72)" }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          borderRadius: 2,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-baseline gap-3">
            <span className="serif text-white" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>
              Keyboard shortcuts
            </span>
            <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Press <Kbd>?</Kbd> to toggle
            </span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close"
            className="mono"
            style={{
              fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase",
              background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
              padding: "4px 8px", borderRadius: 2, cursor: "pointer",
            }}>
            Esc
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {GROUPS.map((g, gi) => (
            <div key={g.label} style={{ marginTop: gi === 0 ? 0 : 28 }}>
              <div className="mono mb-3" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {g.label}
              </div>
              <div>
                {g.rows.map(r => (
                  <div key={r.desc}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: "#cbd5e1" }}>{r.desc}</span>
                    <div className="flex items-center gap-1">
                      {r.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="mono" style={{ fontSize: 10, color: "#475569" }}>then</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mono"
      style={{
        fontSize: 11, color: "#e5e7eb",
        padding: "3px 7px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 2,
        letterSpacing: "0.04em",
        minWidth: 22,
        textAlign: "center",
      }}>
      {children}
    </kbd>
  )
}

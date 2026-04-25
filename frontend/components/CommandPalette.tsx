"use client"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  RiDashboardLine, RiUserLine, RiKanbanView, RiBarChartLine,
  RiAccountCircleLine, RiDatabase2Line, RiListCheck2,
  RiAddLine, RiDownloadLine, RiLogoutBoxLine, RiSearchLine,
  RiCornerDownLeftLine, RiArrowUpLine, RiArrowDownLine,
  RiAlarmLine, RiCalculatorLine,
} from "react-icons/ri"

// ⌘K command palette. The goal is a Linear/Raycast-style pane that lets
// a power user jump between pages, search their own investor list, or
// fire a single action — all without touching the mouse.
//
// How it works:
//   · Globally listens for Meta+K and Ctrl+K to toggle.
//   · Loads the caller's investor list when the palette opens so investor
//     rows are searchable by name/company/email.
//   · Splits results into three groups (Navigate, Investors, Actions)
//     and handles ↑/↓/Enter/Esc across the whole flat list.

type Section = "navigate" | "investor" | "action"
type Item = {
  id: string
  section: Section
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void | Promise<void>
  keywords?: string
}

type Investor = {
  id: string
  name: string
  company?: string | null
  email?: string | null
  status?: string | null
}

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loadingInvestors, setLoadingInvestors] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Toggle with Cmd/Ctrl+K. The second handler closes on Esc.
  // Bound once at the window level so it's available from every page.
  // We also listen for a custom "open-command-palette" event so other
  // components (like the nav button) can trigger the palette without
  // having to reach into this component's state.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isModK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")
      if (isModK) {
        e.preventDefault()
        setOpen(o => !o)
        return
      }
      if (e.key === "Escape" && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    function onCustom() { setOpen(true) }
    window.addEventListener("keydown", onKey)
    window.addEventListener("open-command-palette", onCustom)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("open-command-palette", onCustom)
    }
  }, [open])

  // Reset query + fetch investors when the palette opens.
  useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(0)
    // Focus the input after the DOM paints — otherwise React re-renders can
    // steal the caret on the first keystroke.
    requestAnimationFrame(() => inputRef.current?.focus())

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    setLoadingInvestors(true)
    fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        // 401 = session expired. Don't silently render "no investors" —
        // that's been the wrong answer for years in other CRMs. Bounce
        // to the right login page and close the palette.
        if (r.status === 401) {
          setOpen(false)
          localStorage.removeItem("token")
          localStorage.removeItem("user_type")
          router.push("/login")
          return null
        }
        return r.ok ? r.json() : []
      })
      .then(data => {
        if (data === null) return
        setInvestors(Array.isArray(data) ? data : [])
      })
      .catch(() => setInvestors([]))
      .finally(() => setLoadingInvestors(false))
  }, [open, router])

  // Body scroll lock while the palette is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  const close = useCallback(() => setOpen(false), [])

  // Static items — navigation + global actions. The dynamic investor items
  // get built below from the fetched list.
  const staticItems: Item[] = useMemo(() => [
    { id: "nav:dashboard", section: "navigate", label: "Dashboard", hint: "Go to overview",
      icon: <RiDashboardLine size={14} />,
      run: () => router.push("/dashboard"), keywords: "home start" },
    { id: "nav:investors", section: "navigate", label: "Investors", hint: "Your CRM list",
      icon: <RiListCheck2 size={14} />,
      run: () => router.push("/investors"), keywords: "crm list" },
    { id: "nav:pipeline", section: "navigate", label: "Pipeline", hint: "Kanban by stage",
      icon: <RiKanbanView size={14} />,
      run: () => router.push("/pipeline"), keywords: "kanban board" },
    { id: "nav:analytics", section: "navigate", label: "Analytics", hint: "Funnel + numbers",
      icon: <RiBarChartLine size={14} />,
      run: () => router.push("/analytics"), keywords: "stats funnel conversion" },
    { id: "nav:directory", section: "navigate", label: "Investor directory", hint: "Curated funds",
      icon: <RiDatabase2Line size={14} />,
      run: () => router.push("/investors/database"), keywords: "directory database" },
    { id: "nav:profile", section: "navigate", label: "Profile", hint: "Identity + project",
      icon: <RiAccountCircleLine size={14} />,
      run: () => router.push("/profile"), keywords: "settings account project" },
    { id: "nav:tokenomics", section: "navigate", label: "Tokenomics modeler", hint: "Round + SAFT math",
      icon: <RiCalculatorLine size={14} />,
      run: () => router.push("/tokenomics"), keywords: "saft cap discount price token vest schedule fdv allocation" },

    { id: "action:add-investor", section: "action", label: "Add investor",
      hint: "Opens /investors", icon: <RiAddLine size={14} />,
      run: () => router.push("/investors?new=1"), keywords: "new create" },
    { id: "action:jump-overdue", section: "action", label: "Jump to overdue follow-ups",
      hint: "Filtered investors view", icon: <RiAlarmLine size={14} />,
      run: () => router.push("/investors?overdue=1"),
      keywords: "reminder overdue late chase follow up" },
    { id: "action:jump-today", section: "action", label: "Jump to follow-ups due today",
      hint: "Filtered investors view", icon: <RiAlarmLine size={14} />,
      run: () => router.push("/investors?today=1"),
      keywords: "reminder today due follow up" },
    { id: "action:export-csv", section: "action", label: "Export investors CSV",
      hint: "Opens /investors", icon: <RiDownloadLine size={14} />,
      run: () => router.push("/investors?export=1"), keywords: "csv download export" },
    { id: "action:signout", section: "action", label: "Sign out",
      hint: "Clears local session", icon: <RiLogoutBoxLine size={14} />,
      run: () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user_type")
        router.push("/login")
      }, keywords: "logout log out" },
  ], [router])

  const investorItems: Item[] = useMemo(() => {
    return investors.map(inv => ({
      id: `inv:${inv.id}`,
      section: "investor" as const,
      label: inv.name,
      hint: [inv.company, inv.email, inv.status].filter(Boolean).join(" · "),
      icon: <RiUserLine size={14} />,
      run: () => router.push("/investors"),
      keywords: [inv.name, inv.company, inv.email].filter(Boolean).join(" ").toLowerCase(),
    }))
  }, [investors, router])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Without a query, show nav + actions + first 5 investors so the
      // empty state is useful (and doesn't flood the page with 100+ rows).
      return [
        ...staticItems.filter(i => i.section === "navigate"),
        ...investorItems.slice(0, 5),
        ...staticItems.filter(i => i.section === "action"),
      ]
    }
    const tokens = q.split(/\s+/).filter(Boolean)
    const match = (item: Item) => {
      const hay = `${item.label} ${item.hint || ""} ${item.keywords || ""}`.toLowerCase()
      return tokens.every(t => hay.includes(t))
    }
    return [...staticItems, ...investorItems].filter(match)
  }, [query, staticItems, investorItems])

  // Reset the highlight when the filtered list changes.
  useEffect(() => { setActiveIndex(0) }, [query])

  // Group items for section headers in the list. Keeping the order stable
  // (navigate → investor → action) so the eye learns where things sit.
  const grouped = useMemo(() => {
    const order: Section[] = ["navigate", "investor", "action"]
    return order
      .map(sec => ({ section: sec, items: filtered.filter(i => i.section === sec) }))
      .filter(g => g.items.length > 0)
  }, [filtered])

  const flat = useMemo(() => grouped.flatMap(g => g.items), [grouped])

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flat[activeIndex]
      if (item) {
        close()
        Promise.resolve(item.run()).catch(() => {})
      }
    }
  }

  // Keep the active row scrolled into view as the user keys through.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-idx="${activeIndex}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh] md:pt-[16vh]"
      style={{ background: "rgba(2,4,10,0.6)" }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          borderRadius: 2,
        }}
      >
        {/* Query input row */}
        <div className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <RiSearchLine size={14} style={{ color: "#64748b" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search or type a command..."
            className="mono"
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              color: "#e5e7eb",
              fontSize: 14,
              outline: "none",
              letterSpacing: "0.01em",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          />
          <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ESC
          </span>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
          role="listbox">
          {flat.length === 0 ? (
            <div className="mono text-center" style={{ padding: "40px 0", fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {loadingInvestors ? "Loading..." : "No matches"}
            </div>
          ) : grouped.map(group => (
            <div key={group.section}>
              <div className="mono px-5 pt-4 pb-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {group.section === "navigate" ? "Navigate"
                  : group.section === "investor" ? "Investors"
                  : "Actions"}
              </div>
              {group.items.map(item => {
                const idx = flat.indexOf(item)
                const active = idx === activeIndex
                return (
                  <button
                    key={item.id}
                    data-cmd-idx={idx}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      close()
                      Promise.resolve(item.run()).catch(() => {})
                    }}
                    className="w-full grid grid-cols-[18px_1fr_auto] gap-3 items-center text-left cursor-pointer"
                    style={{
                      padding: "10px 20px",
                      background: active ? "rgba(16,185,129,0.06)" : "transparent",
                      borderLeft: active ? "2px solid #10b981" : "2px solid transparent",
                      paddingLeft: active ? 18 : 20,
                      color: active ? "#fff" : "#cbd5e1",
                      border: 0,
                      borderTop: "1px solid rgba(255,255,255,0.02)",
                    }}>
                    <span style={{ color: active ? "#10b981" : "#64748b" }}>{item.icon}</span>
                    <span className="min-w-0">
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      {item.hint && (
                        <span className="mono truncate block" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.02em", marginTop: 2 }}>
                          {item.hint}
                        </span>
                      )}
                    </span>
                    {active && (
                      <span className="mono" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                        <RiCornerDownLeftLine size={10} /> Open
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer hint strip */}
        <div className="mono flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <RiArrowUpLine size={10} /><RiArrowDownLine size={10} /> Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <RiCornerDownLeftLine size={10} /> Open
            </span>
          </div>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  )
}

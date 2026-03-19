"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { createClient } from "@supabase/supabase-js"
import { RiUserLine, RiFireLine, RiGroupLine, RiCheckboxCircleLine, RiBellLine, RiRadioButtonLine, RiArrowRightLine, RiAccountCircleLine, RiRocketLine } from "react-icons/ri"

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  outreach:   { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "Outreach" },
  interested: { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa", border: "rgba(139,92,246,0.25)", label: "Interested" },
  meeting:    { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "Meeting" },
  term_sheet: { bg: "rgba(14,165,233,0.12)",  color: "#38bdf8", border: "rgba(14,165,233,0.25)", label: "Term Sheet" },
  closed:     { bg: "rgba(16,185,129,0.12)",  color: "#34d399", border: "rgba(16,185,129,0.25)", label: "Closed" },
}

export default function DashboardPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [plan, setPlan] = useState("free")
  const [upgrading, setUpgrading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const channelsRef = useRef<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
    setupRealtime(token)
    return () => { channelsRef.current.forEach(c => c.unsubscribe()) }
  }, [])

  async function fetchAll(token: string) {
    try {
      const [invRes, intRes, profileRes] = await Promise.all([
        fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/interests", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const invData = await invRes.json()
      const intData = await intRes.json()
      const profileData = await profileRes.json()
      setInvestors(Array.isArray(invData) ? invData : [])
      setInterests(Array.isArray(intData) ? intData : [])
      setPlan(profileData.plan || profileData.subscription_status || "free")
      setUserEmail(profileData.email || "")
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: userEmail }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { setUpgrading(false) }
  }

  async function handleManageBilling() {
    setUpgrading(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { setUpgrading(false) }
  }

  function setupRealtime(token: string) {
    let userId: string | null = null
    try {
      const payload = token.split(".")[1]
      const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
      userId = decoded.sub
    } catch { return }
    if (!userId) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const invChannel = supabase
      .channel("investors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "investors", filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === "INSERT") setInvestors(prev => [payload.new as any, ...prev])
        else if (payload.eventType === "UPDATE") setInvestors(prev => prev.map(i => i.id === (payload.new as any).id ? payload.new as any : i))
        else if (payload.eventType === "DELETE") setInvestors(prev => prev.filter(i => i.id !== (payload.old as any).id))
      })
      .subscribe((status) => { if (status === "SUBSCRIBED") setLive(true) })

    const intChannel = supabase
      .channel("interests-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "interests" }, async () => {
        const token = localStorage.getItem("token")!
        const res = await fetch("/api/interests", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (Array.isArray(data)) setInterests(data)
      })
      .subscribe()

    channelsRef.current = [invChannel, intChannel]
  }

  const stats = {
    total: investors.length,
    active: investors.filter(i => ["interested", "meeting", "term_sheet"].includes(i.status)).length,
    meetings: investors.filter(i => i.status === "meeting").length,
    closed: investors.filter(i => i.status === "closed").length,
  }

  const recent = investors.slice(0, 5)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#10b981", borderTopColor: "transparent" }} />
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-slate-200" style={{ background: "#050508" }}>
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">

        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Your fundraising overview</p>
          </div>
          {live && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <RiRadioButtonLine size={11} className="text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium" style={{ color: "#10b981" }}>Live</span>
            </div>
          )}
        </div>

        {/* Onboarding */}
        {investors.length === 0 && (
          <div className="rounded-2xl border p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-[13px] font-semibold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Get started with FundFlow</p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Add your first investor", sub: "Start building your pipeline", path: "/investors", icon: <RiUserLine size={14} /> },
                { label: "Set up your profile", sub: "Add your company info and connect your wallet", path: "/profile", icon: <RiAccountCircleLine size={14} /> },
                { label: "Publish a project", sub: "Let investors find you on the deal flow", path: "/profile", icon: <RiRocketLine size={14} /> },
              ].map(item => (
                <button key={item.label} onClick={() => router.push(item.path)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl border cursor-pointer bg-transparent text-left w-full transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-600">{item.sub}</p>
                  </div>
                  <RiArrowRightLine size={14} className="text-slate-700 ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Investors", value: stats.total, sub: "in pipeline", icon: <RiUserLine size={16} />, color: "#10b981" },
            { label: "Active Leads", value: stats.active, sub: "interested+", icon: <RiFireLine size={16} />, color: "#a78bfa" },
            { label: "Meetings", value: stats.meetings, sub: "scheduled", icon: <RiGroupLine size={16} />, color: "#fbbf24" },
            { label: "Deals Closed", value: stats.closed, sub: "this round", icon: <RiCheckboxCircleLine size={16} />, color: "#34d399" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-600 uppercase tracking-wider font-medium">{s.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Plan Banner */}
        {plan === "free" ? (
          <div className="rounded-2xl border p-4 mb-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.15)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <RiFireLine size={16} style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">You&apos;re on the Free plan</p>
                <p className="text-[11px] text-slate-500">Limited to 25 investors. Upgrade to Pro for unlimited access.</p>
              </div>
            </div>
            <button onClick={handleUpgrade} disabled={upgrading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-0 flex-shrink-0 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              {upgrading ? "Redirecting..." : "Upgrade to Pro — $99/mo"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border p-4 mb-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.15)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.12)" }}>
                <RiCheckboxCircleLine size={16} style={{ color: "#34d399" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">You&apos;re on Pro ✓</p>
                <p className="text-[11px] text-slate-500">Unlimited investors, full analytics, priority support.</p>
              </div>
            </div>
            <button onClick={handleManageBilling} disabled={upgrading}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-0 flex-shrink-0 disabled:opacity-60"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              {upgrading ? "Redirecting..." : "Manage Billing"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent Investors */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <h2 className="text-[13px] font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Investors</h2>
              <button onClick={() => router.push("/investors")}
                className="text-[11px] cursor-pointer bg-transparent border-0 transition-colors" style={{ color: "#10b981" }}>
                View all →
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <RiUserLine size={20} className="text-slate-700" />
                  <p className="text-xs text-slate-700">No investors yet</p>
                </div>
              ) : recent.map(inv => {
                const s = STATUS_STYLES[inv.status] || STATUS_STYLES.outreach
                return (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${s.color}20`, color: s.color }}>
                        {inv.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{inv.company || inv.email || "—"}</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-3"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deal Flow Interests */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Deal Flow Interests</h2>
                {interests.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                    {interests.length} new
                  </span>
                )}
              </div>
              <RiBellLine size={14} className="text-slate-600" />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {interests.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <RiBellLine size={20} className="text-slate-700" />
                  <p className="text-xs text-slate-700">No interests yet</p>
                  <p className="text-[11px] text-slate-800 text-center px-6">Publish your project on /profile to start receiving interest</p>
                </div>
              ) : interests.map(int => (
                <div key={int.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                      {(int.investor_name || int.investor_email || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">
                        {int.investor_name !== "Investor" ? int.investor_name : int.investor_email}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate">Interested in {int.projects?.name || "your project"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0 ml-3">
                    {new Date(int.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

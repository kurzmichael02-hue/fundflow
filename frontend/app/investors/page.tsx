"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function InvestorLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_type: "investor" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      localStorage.setItem("token", data.token)
      localStorage.setItem("user_type", "investor")
      router.push("/investor/discover")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)", boxShadow: "0 0 24px rgba(16,185,129,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 6L12 8V12L9 14L6 12V8L9 6Z" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">FundFlow</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
            style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium tracking-wide">Investor Portal</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 leading-[1.1]" style={{ letterSpacing: "-0.03em" }}>
            Discover the next<br />
            <span style={{ background: "linear-gradient(90deg, #10b981, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Web3 unicorn.
            </span>
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Access curated Web3 founders, live deal flow, and express interest directly — all in one place.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[
              { value: "240+", label: "Founders" },
              { value: "$18M", label: "Tracked Raise" },
              { value: "94%", label: "Response Rate" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>{s.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative rounded-2xl border p-5"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-slate-400 text-sm leading-relaxed italic">
            "FundFlow gave us direct access to founders before they hit the mainstream raise — we closed two deals in the first week."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>A</div>
            <div>
              <p className="text-white text-xs font-medium">Alex Chen</p>
              <p className="text-slate-600 text-[11px]">Partner, Meridian Ventures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute top-[-40px] right-[-40px] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />
        </div>

        <div className="w-full max-w-sm relative">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 6L12 8V12L9 14L6 12V8L9 6Z" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">FundFlow</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
              style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Investor Access</span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your investor dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@fund.com" required
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 border outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 border outline-none pr-11 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 cursor-pointer bg-transparent border-0">
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-red-400 border"
                style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1 cursor-pointer border-0 transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)", boxShadow: "0 0 24px rgba(16,185,129,0.2)" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs text-slate-700">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-xs text-slate-600">
            Not an investor?{" "}
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Founder login</Link>
            {" · "}
            <Link href="/register" className="text-slate-400 hover:text-white transition-colors">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
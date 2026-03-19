"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function InvestorRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_type: "investor" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#050508" }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}>FF</div>
          <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>FundFlow</span>
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
            style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium tracking-wide">Investor Portal</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 leading-[1.1]" style={{ letterSpacing: "-0.03em", fontFamily: "'Syne', sans-serif" }}>
            Join the network.<br />
            <span style={{ background: "linear-gradient(90deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Find your next deal.
            </span>
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm">
            Get access to curated Web3 founders actively raising, filter by stage and sector, and express interest directly.
          </p>
        </div>

        <div className="rounded-2xl border p-5"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-slate-500 text-sm leading-relaxed italic">
            "FundFlow gave us direct access to founders before they hit the mainstream raise — we closed two deals in the first week."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>A</div>
            <div>
              <p className="text-white text-xs font-medium">Alex Chen</p>
              <p className="text-slate-600 text-[11px]">Partner, Meridian Ventures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
            <span className="text-white font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>FundFlow</span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>Check your email</h2>
              <p className="text-slate-500 text-sm mb-6">We sent a confirmation link to <span className="text-white">{form.email}</span>. Click it to activate your account.</p>
              <Link href="/investor" className="text-sm transition-colors" style={{ color: "#10b981" }}>
                Back to login →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
                  style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">Investor Access</span>
                </div>
                <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>Create your account</h2>
                <p className="text-slate-500 text-sm mt-1">Join FundFlow as an investor</p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name" required
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 border outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                    onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@fund.com" required
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 border outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                    onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" required minLength={6}
                      className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-slate-200 border outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                      onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
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
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1 cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}>
                  {loading ? "Creating account..." : "Create account →"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-xs text-slate-700">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <p className="text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/investor" className="text-slate-400 hover:text-white transition-colors">Sign in</Link>
                {" · "}
                <Link href="/register" className="text-slate-400 hover:text-white transition-colors">Founder? Register here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
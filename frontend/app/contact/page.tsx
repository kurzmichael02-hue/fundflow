"use client"
import { useState } from "react"
import Link from "next/link"
import { RiMenuLine, RiCloseLine, RiArrowRightLine, RiCheckLine, RiSendPlaneLine } from "react-icons/ri"

const CATEGORIES = ["General Inquiry", "Business / Partnership", "Support", "Investor Relations", "Other"]

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    category: "", custom_category: "", message: ""
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: form.category === "Other" ? form.custom_category || "Other" : form.category,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen text-slate-200 overflow-x-hidden" style={{ background: "#050508" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Ambient */}
      <div className="fixed top-[5%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-5 md:px-16"
        style={{ background: "rgba(5,5,8,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
            <span className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>FundFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[{ label: "Pricing", href: "/#pricing" }, { label: "FAQ", href: "/#faq" }, { label: "About", href: "/about" }].map(l => (
              <Link key={l.label} href={l.href} className="text-sm font-medium transition-colors no-underline" style={{ color: "#64748b" }}>{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.07] hover:text-slate-200 hover:bg-white/5 transition-all no-underline">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>Get started <RiArrowRightLine /></Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.08] text-slate-400 bg-transparent cursor-pointer">
            {menuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/[0.06] md:hidden"
          style={{ background: "rgba(5,5,8,0.98)", backdropFilter: "blur(24px)" }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            {[{ label: "Pricing", href: "/#pricing" }, { label: "FAQ", href: "/#faq" }, { label: "About", href: "/about" }].map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-slate-400 text-base font-medium py-3 border-b border-white/[0.04] no-underline">{l.label}</Link>
            ))}
            <div className="flex gap-2.5 mt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.08] no-underline">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>Get started</Link>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-16 pt-28 md:pt-36 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border mb-6"
              style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)", color: "#34d399" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Get in touch
            </div>
            <h1 className="font-black text-white mb-5 leading-[1.05]"
              style={{ fontSize: "clamp(32px,5vw,56px)", letterSpacing: "-0.04em", fontFamily: "'Syne', sans-serif" }}>
              Let's talk.<br />
              <span style={{ background: "linear-gradient(135deg, #fff 0%, #10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                We're listening.
              </span>
            </h1>
            <p className="text-slate-500 leading-relaxed mb-10" style={{ fontSize: "15px" }}>
              Whether you have a question about the product, want to partner with us, or just want to say hi — we'll get back to you as soon as possible.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { label: "General Inquiry", desc: "Questions about FundFlow" },
                { label: "Business / Partnership", desc: "Work with us" },
                { label: "Support", desc: "Technical help" },
                { label: "Investor Relations", desc: "Investment inquiries" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10b981" }}>
                    <RiCheckLine size={14} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.05]">
              <p className="text-[12px] text-slate-600 mb-1">Or email us directly</p>
              <a href="mailto:hello@fundflow.io" className="text-[14px] font-medium no-underline transition-colors"
                style={{ color: "#10b981" }}>hello@fundflow.io</a>
            </div>
          </div>

          {/* Right — Form */}
          <div className="rounded-2xl border p-7 md:p-8" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
            {success ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <RiCheckLine size={24} style={{ color: "#34d399" }} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Message sent!</h2>
                <p className="text-slate-500 text-sm mb-6">We'll get back to you as soon as possible.</p>
                <Link href="/" className="text-sm no-underline transition-colors" style={{ color: "#10b981" }}>
                  Back to home →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">First Name</label>
                    <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                      placeholder="John" required
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.03)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Last Name</label>
                    <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Doe" required
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.03)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" required
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                    style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, custom_category: "" })}
                    required
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-white/[0.08] outline-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.03)", color: form.category ? "#e2e8f0" : "#64748b" }}>
                    <option value="" disabled style={{ background: "#0a0d14" }}>Select a category</option>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "#0a0d14" }}>{c}</option>)}
                  </select>
                </div>

                {form.category === "Other" && (
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Please specify</label>
                    <input value={form.custom_category} onChange={e => setForm({ ...form, custom_category: e.target.value })}
                      placeholder="Tell us what it's about..."
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.03)" }} />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?" required rows={5}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm text-red-400 border"
                    style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer border-0 disabled:opacity-60 mt-1"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  {loading ? "Sending..." : <><RiSendPlaneLine size={15} /> Send message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-5 md:px-16 py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
            <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Syne', sans-serif" }}>FundFlow</span>
          </div>
          <span className="text-xs text-slate-700">© 2026 FundFlow. Built for Web3 founders.</span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#10b981" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </footer>
    </main>
  )
}
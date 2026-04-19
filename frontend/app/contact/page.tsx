"use client"
import { useState } from "react"
import Link from "next/link"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"
import { RiArrowRightLine, RiCheckLine } from "react-icons/ri"

const CATEGORIES = [
  "General Inquiry",
  "Business / Partnership",
  "Support",
  "Investor Relations",
  "Other",
]

// Contact page, editorial rewrite.
// Old version had a gradient hero, a bullet-list of "things we care about",
// and a form wrapped in a rounded-2xl card. This one drops all of that:
// masthead, left column is a letter-style intro + direct email, right column
// is the form on a hairline-border panel.

export default function ContactPage() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    category: "", custom_category: "", message: "",
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    color: "#e5e7eb",
    fontSize: 15,
    outline: "none",
    padding: "10px 0",
    boxSizing: "border-box",
    fontFamily: "inherit",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase",
    display: "block", marginBottom: 10,
  }

  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNav />

      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Contact · Hello, good morning
            </span>
            <span className="mono flex items-center gap-1.5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              Usually reply within a day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pt-16 md:pt-24 pb-20 md:pb-28">
            {/* ─── Left column — editorial letter ─── */}
            <div className="md:col-span-5">
              <p className="mono mb-6" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Get in touch
              </p>
              <h1 className="serif text-white" style={{
                fontSize: "clamp(44px, 6.5vw, 88px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                Say hello.<br />
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>We're listening.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginTop: 28, maxWidth: 420, fontWeight: 300 }}>
                Whether you have a question about the product, want to partner, are writing about us,
                or just want to say hi — drop a note. One of us reads every message.
              </p>

              <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="mono mb-3" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Or email us directly
                </p>
                <a href="mailto:hello@fundflow.io" className="no-underline"
                  style={{ fontSize: 22, color: "#10b981", fontWeight: 500, letterSpacing: "-0.01em" }}>
                  hello@fundflow.io
                </a>
              </div>

              <div className="mt-10 pt-8 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="mono mb-2" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  What you can write about
                </p>
                {[
                  "Partnership or integration ideas",
                  "Feature requests and bug reports",
                  "Press, podcast, or interview requests",
                  "Anything else that doesn't fit the inbox",
                ].map(t => (
                  <div key={t} className="flex items-start gap-3" style={{ fontSize: 14, color: "#cbd5e1", padding: "4px 0" }}>
                    <span className="mono" style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Right column — form ─── */}
            <div className="md:col-span-7">
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "40px 0" }}>
                {success ? (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <div style={{
                      width: 56, height: 56,
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "#34d399",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 2, margin: "0 auto 20px",
                    }}>
                      <RiCheckLine size={26} />
                    </div>
                    <h2 className="serif text-white" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 12 }}>
                      Message sent.
                    </h2>
                    <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 24 }}>
                      Thanks — one of us will read this and reply as soon as we can.
                    </p>
                    <Link href="/" className="no-underline mono"
                      style={{ fontSize: 12, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      ← Back to home
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label style={labelStyle}>First name</label>
                        <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                          required placeholder="Ada" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Last name</label>
                        <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                          required placeholder="Lovelace" style={inputStyle} />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        required placeholder="you@example.com" style={inputStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value, custom_category: "" })}
                        required
                        style={{
                          ...inputStyle,
                          background: "#060608",
                          color: form.category ? "#e5e7eb" : "#475569",
                          cursor: "pointer",
                          appearance: "none",
                          WebkitAppearance: "none",
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0px center",
                          paddingRight: 24,
                        }}>
                        <option value="" disabled style={{ background: "#0a0a0d" }}>Choose one</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c} style={{ background: "#0a0a0d" }}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {form.category === "Other" && (
                      <div>
                        <label style={labelStyle}>Please specify</label>
                        <input value={form.custom_category} onChange={e => setForm({ ...form, custom_category: e.target.value })}
                          placeholder="What's it about?" style={inputStyle} />
                      </div>
                    )}

                    <div>
                      <label style={labelStyle}>Message</label>
                      <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        required rows={5} placeholder="Write whatever you want to write."
                        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                    </div>

                    {error && (
                      <div style={{
                        fontSize: 13, color: "#f87171",
                        padding: "12px 14px",
                        background: "rgba(248,113,113,0.06)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 2,
                      }}>
                        {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading}
                      style={{
                        background: "#10b981", color: "#fff",
                        padding: "14px 24px", borderRadius: 2,
                        fontSize: 14, fontWeight: 600, border: 0,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        alignSelf: "flex-start",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                      {loading ? "Sending..." : <>Send message <RiArrowRightLine size={14} /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

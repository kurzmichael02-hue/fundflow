"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { RiCheckLine, RiMailLine } from "react-icons/ri"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      // Supabase rate-limits reset requests per email, so triggering from
      // the client with the anon key is fine — no custom API route needed.
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      )
      if (authError) throw authError
      // Always show the same success UI whether or not the email exists —
      // otherwise this endpoint leaks which addresses are registered.
      setSent(true)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", margin: "0 auto 16px" }}>FF</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {sent ? "Check your inbox" : "Reset your password"}
          </h1>
          <p style={{ fontSize: 14, color: "#475569" }}>
            {sent
              ? "If that address is registered, we've sent you a reset link."
              : "Enter your email and we'll send you a link to set a new password."}
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <RiCheckLine size={22} style={{ color: "#34d399" }} />
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>
                The link expires in an hour. Didn&apos;t get it? Check spam or try again in a few minutes.
              </p>
              <Link href="/login" style={{ color: "#10b981", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Back to login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <RiMailLine size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px 10px 38px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "#f87171", marginBottom: 16, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                style={{ width: "100%", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 14, cursor: loading || !email ? "not-allowed" : "pointer", opacity: loading || !email ? 0.6 : 1 }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#475569", marginTop: 20 }}>
          Remembered it?{" "}
          <Link href="/login" style={{ color: "#10b981", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}

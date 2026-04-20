"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR } from "@/components/AuthLayout"
import { RiCheckLine, RiArrowRightLine } from "react-icons/ri"

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
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      )
      if (authError) throw authError
      // Always succeed the same way, whether or not the address exists —
      // no registered-email enumeration through this form.
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      kicker="Reset password"
      title={sent
        ? <>Check your<br />inbox.</>
        : <>Forgot your<br />password?</>
      }
      intro={sent
        ? "If that address is registered with us, a reset link is on the way. The link expires in an hour — if nothing shows up, check spam or try again in a few minutes."
        : "Drop your email and we'll send you a link to set a new one. Takes under a minute."
      }
      side="founder">

      {sent ? (
        <div>
          <div style={{
            width: 48, height: 48,
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#34d399",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 2, marginBottom: 24,
          }}>
            <RiCheckLine size={22} />
          </div>
          <p style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 8 }}>
            We sent a reset link to{" "}
            <span className="mono" style={{ color: "#fff" }}>{email}</span>.
          </p>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 380, marginBottom: 32 }}>
            Click the link in the email to set a new password. Didn&apos;t get it?
            Check spam, or wait a minute and request another.
          </p>
          <Link href="/login" className="mono no-underline"
            style={{ fontSize: 12, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <AuthField label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus style={AUTH_INPUT} />
          </AuthField>

          {error && <div style={AUTH_ERROR}>{error}</div>}

          <button type="submit" disabled={loading || !email}
            style={{
              ...AUTH_SUBMIT,
              opacity: loading || !email ? 0.6 : 1,
              cursor: loading || !email ? "not-allowed" : "pointer",
            }}>
            {loading ? "Sending..." : <>Send reset link <RiArrowRightLine size={14} /></>}
          </button>

          <p className="mono mt-4" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
            Remembered it?{" "}
            <Link href="/login" style={{ color: "#10b981", textDecoration: "none" }}>Sign in →</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}

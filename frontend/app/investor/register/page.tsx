"use client"
import { useState } from "react"
import Link from "next/link"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR, PW_TOGGLE } from "@/components/AuthLayout"
import { RiEyeLine, RiEyeOffLine, RiCheckLine, RiArrowRightLine } from "react-icons/ri"

export default function InvestorRegisterPage() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      kicker="§ Investor register"
      title={success
        ? <>Check your<br /><em style={{ fontWeight: 400 }}>inbox.</em></>
        : <>Join the<br /><em style={{ fontWeight: 400 }}>investor side.</em></>
      }
      intro={success
        ? `We sent a confirmation link to ${form.email}. Click it to activate your investor account, then sign in to start browsing deals.`
        : "Get access to curated Web3 founders actively raising, filter by stage and sector, and express interest directly."
      }
      side="investor">

      {success ? (
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
          <p style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 32, maxWidth: 380, lineHeight: 1.7 }}>
            Once confirmed you can sign in and the deal flow opens up.
          </p>
          <Link href="/investor" className="mono no-underline"
            style={{ fontSize: 12, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-7">
          <AuthField label="Full name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your name" required autoFocus style={AUTH_INPUT} />
          </AuthField>

          <AuthField label="Email">
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@fund.com" required style={AUTH_INPUT} />
          </AuthField>

          <AuthField label="Password" aside={
            <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em" }}>
              min. 8 chars
            </span>
          }>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required minLength={8}
                style={{ ...AUTH_INPUT, paddingRight: 36 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={PW_TOGGLE} aria-label={showPass ? "Hide password" : "Show password"}>
                {showPass ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
              </button>
            </div>
          </AuthField>

          {error && <div style={AUTH_ERROR}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ ...AUTH_SUBMIT, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating account..." : <>Create account <RiArrowRightLine size={14} /></>}
          </button>

          <p className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em", lineHeight: 1.7 }}>
            By creating an account you agree to our{" "}
            <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>.
          </p>
        </form>
      )}

      {!success && (
        <p className="mono mt-10" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
          Already registered?{" "}
          <Link href="/investor" style={{ color: "#10b981", textDecoration: "none" }}>Sign in →</Link>
        </p>
      )}
    </AuthShell>
  )
}

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR, PW_TOGGLE } from "@/components/AuthLayout"
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine } from "react-icons/ri"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.register(name, email, password)
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      kicker="§ Create account"
      title={<>Start tracking<br /><em style={{ fontWeight: 400 }}>your round.</em></>}
      intro="Founder sign-up — free forever up to 25 investors. No credit card needed, no onboarding calls, just a form and a dashboard."
      side="founder">
      <form onSubmit={handleRegister} className="flex flex-col gap-7">
        <AuthField label="Full name">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Ada Lovelace" required autoFocus style={AUTH_INPUT} />
        </AuthField>

        <AuthField label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required style={AUTH_INPUT} />
        </AuthField>

        <AuthField label="Password" aside={
          <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
            min. 8 chars
          </span>
        }>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={8}
              style={{ ...AUTH_INPUT, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={PW_TOGGLE} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
            </button>
          </div>
        </AuthField>

        {error && <div style={AUTH_ERROR}>{error}</div>}

        <button type="submit" disabled={loading}
          style={{ ...AUTH_SUBMIT, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Creating account..." : <>Create account <RiArrowRightLine size={14} /></>}
        </button>

        <p className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em", lineHeight: 1.7 }}>
          By creating an account you agree to our{" "}
          <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link> and{" "}
          <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>
      </form>

      <p className="mono mt-10" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
        Already have one?{" "}
        <Link href="/login" style={{ color: "#10b981", textDecoration: "none" }}>Sign in →</Link>
      </p>
    </AuthShell>
  )
}

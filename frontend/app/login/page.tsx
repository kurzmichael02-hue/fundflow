"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR, PW_TOGGLE } from "@/components/AuthLayout"
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine } from "react-icons/ri"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = await api.login(email, password)
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const looksLikeWrongCredentials = error && (
    error.toLowerCase().includes("invalid") ||
    error.toLowerCase().includes("credentials") ||
    error.toLowerCase().includes("not found")
  )

  return (
    <AuthShell
      kicker="§ Sign in"
      title={<>Welcome<br /><em style={{ fontWeight: 400 }}>back.</em></>}
      intro="Sign in to pick up where you left off — your pipeline, your deals, and your public project page."
      side="founder">
      <form onSubmit={handleLogin} className="flex flex-col gap-7">
        <AuthField label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required autoFocus style={AUTH_INPUT} />
        </AuthField>

        <AuthField
          label="Password"
          aside={
            <Link href="/forgot-password" className="mono no-underline"
              style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Forgot?
            </Link>
          }>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ ...AUTH_INPUT, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={PW_TOGGLE} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
            </button>
          </div>
        </AuthField>

        {error && (
          <div style={AUTH_ERROR}>
            {error}
            {looksLikeWrongCredentials && (
              <div className="mono" style={{ marginTop: 8, color: "#94a3b8", fontSize: 11, letterSpacing: "0.04em" }}>
                No account?{" "}
                <Link href="/register" style={{ color: "#10b981", textDecoration: "none", textTransform: "uppercase" }}>Create one →</Link>
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ ...AUTH_SUBMIT, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Signing in..." : <>Sign in <RiArrowRightLine size={14} /></>}
        </button>
      </form>

      <p className="mono mt-10" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "#10b981", textDecoration: "none" }}>Create one →</Link>
      </p>
    </AuthShell>
  )
}

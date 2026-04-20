"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR, PW_TOGGLE } from "@/components/AuthLayout"
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine } from "react-icons/ri"

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
        body: JSON.stringify({ ...form, portal: "investor" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      if (!data?.token) {
        throw new Error("No session returned. If you just registered, confirm your email first.")
      }
      localStorage.setItem("token", data.token)
      localStorage.setItem("user_type", data.user_type || "investor")
      router.push("/investor/discover")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      kicker="§ Investor sign in"
      title={<>Back to<br /><em style={{ fontWeight: 400 }}>the deal flow.</em></>}
      intro="Sign in to browse curated Web3 founders actively raising. Filter by stage, chain, sector — express interest with one tap."
      side="investor">
      <form onSubmit={handleLogin} className="flex flex-col gap-7">
        <AuthField label="Email">
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@fund.com" required autoFocus style={AUTH_INPUT} />
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
            <input type={showPass ? "text" : "password"} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required
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
          {loading ? "Signing in..." : <>Sign in <RiArrowRightLine size={14} /></>}
        </button>
      </form>

      <p className="mono mt-10" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
        New here?{" "}
        <Link href="/investor/register" style={{ color: "#10b981", textDecoration: "none" }}>Create an investor account →</Link>
      </p>
    </AuthShell>
  )
}

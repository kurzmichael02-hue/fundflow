"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError("")
    try {
      await api.register(name, email, password)
      router.push("/login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", margin: "0 auto 16px" }}>FF</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "#475569" }}>Start managing your investor pipeline</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 42px 10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 16, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px" }}>{error}</div>}

          <button onClick={handleRegister} disabled={loading}
            style={{ width: "100%", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#475569", marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#0ea5e9", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
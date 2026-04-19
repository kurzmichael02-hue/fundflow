"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { RiEyeLine, RiEyeOffLine, RiCheckLine } from "react-icons/ri"

// Supabase drops the user into this route after they click the recovery link.
// Depending on the project's auth flow it lands either as a PKCE `code` in the
// query string or as tokens in the URL hash — we handle both.
type Phase = "waiting" | "ready" | "invalid" | "done"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("waiting")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function establishSession() {
      // PKCE flow — the code is in the query string.
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      if (code) {
        const { error: ex } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (ex) { setPhase("invalid"); setError(ex.message); return }
        // Clean the code out of the URL so a refresh won't re-exchange it.
        window.history.replaceState({}, "", url.pathname)
        setPhase("ready")
        return
      }
      // Implicit/hash flow — Supabase stores access+refresh tokens in the hash.
      // The client library parses it automatically; we just need to wait for
      // the PASSWORD_RECOVERY event.
      const hash = window.location.hash
      if (hash.includes("access_token") || hash.includes("error")) {
        // onAuthStateChange below will flip phase to "ready" on success.
        return
      }
      // No code and no hash — user reached the page without a link.
      setPhase("invalid")
      setError("This reset link is invalid or has expired.")
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return
      if (event === "PASSWORD_RECOVERY") {
        setPhase("ready")
        // Strip the tokens out of the hash.
        window.history.replaceState({}, "", window.location.pathname)
      }
    })

    establishSession()

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirm) { setError("Passwords don't match"); return }

    setLoading(true)
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password })
      if (upErr) throw upErr
      setPhase("done")
      // Give the user a moment to read the success state, then bounce to login.
      setTimeout(() => router.push("/login"), 2500)
    } catch (err: any) {
      setError(err?.message || "Failed to update password")
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
            {phase === "done" ? "Password updated" : "Set a new password"}
          </h1>
          <p style={{ fontSize: 14, color: "#475569" }}>
            {phase === "done"
              ? "Redirecting you to sign in..."
              : phase === "invalid"
                ? "We couldn't verify your reset link."
                : "Pick something you haven't used before. Minimum 8 characters."}
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}>
          {phase === "waiting" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 16 }}>Verifying link...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {phase === "invalid" && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#f87171", marginBottom: 20, lineHeight: 1.6 }}>
                {error || "This reset link is invalid or has already been used."}
              </p>
              <Link href="/forgot-password" style={{ color: "#10b981", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Request a new link →
              </Link>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <RiCheckLine size={22} style={{ color: "#34d399" }} />
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>You can sign in with your new password now.</p>
            </div>
          )}

          {phase === "ready" && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoFocus
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 42px 10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Confirm password</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "#f87171", marginBottom: 16, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{ width: "100%", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 14, cursor: loading || !password || !confirm ? "not-allowed" : "pointer", opacity: loading || !password || !confirm ? 0.6 : 1 }}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

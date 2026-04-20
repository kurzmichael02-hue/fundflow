"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { AuthShell, AuthField, AUTH_INPUT, AUTH_SUBMIT, AUTH_ERROR, PW_TOGGLE } from "@/components/AuthLayout"
import { RiEyeLine, RiEyeOffLine, RiCheckLine, RiArrowRightLine } from "react-icons/ri"

// Supabase drops the user into this route after they click the recovery link.
// Depending on the project's auth flow it lands either as a PKCE `code` in
// the query string or as tokens in the URL hash — both paths handled below.
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

    async function establish() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      if (code) {
        const { error: ex } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (ex) { setPhase("invalid"); setError(ex.message); return }
        window.history.replaceState({}, "", url.pathname)
        setPhase("ready")
        return
      }
      const hash = window.location.hash
      if (hash.includes("access_token") || hash.includes("error")) {
        // PASSWORD_RECOVERY event fires via onAuthStateChange below
        return
      }
      setPhase("invalid")
      setError("This reset link is invalid or has expired.")
    }

    const { data: sub } = supabase.auth.onAuthStateChange(event => {
      if (cancelled) return
      if (event === "PASSWORD_RECOVERY") {
        setPhase("ready")
        window.history.replaceState({}, "", window.location.pathname)
      }
    })

    establish()
    return () => { cancelled = true; sub.subscription.unsubscribe() }
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
      setTimeout(() => router.push("/login"), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const title = phase === "done"
    ? <>Password<br />updated.</>
    : phase === "invalid"
      ? <>Link<br />invalid.</>
      : <>Set a<br />new password.</>

  const intro = phase === "done"
    ? "Redirecting you to sign in..."
    : phase === "invalid"
      ? "We couldn't verify the link. It may have already been used, or expired — request a new one and try again."
      : "Pick something you haven't used before. Minimum 8 characters, anything longer is better."

  return (
    <AuthShell kicker="New password" title={title} intro={intro} side="founder">
      {phase === "waiting" && (
        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <span className="mono" style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.06em" }}>
            Verifying link...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {phase === "invalid" && (
        <div>
          {error && <div style={{ ...AUTH_ERROR, marginBottom: 20 }}>{error}</div>}
          <Link href="/forgot-password" className="mono no-underline"
            style={{ fontSize: 12, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Request a new link →
          </Link>
        </div>
      )}

      {phase === "done" && (
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
          <p style={{ fontSize: 15, color: "#cbd5e1" }}>
            You can sign in with your new password now.
          </p>
        </div>
      )}

      {phase === "ready" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <AuthField label="New password">
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={8} autoFocus
                style={{ ...AUTH_INPUT, paddingRight: 36 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={PW_TOGGLE} aria-label={showPass ? "Hide password" : "Show password"}>
                {showPass ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
              </button>
            </div>
          </AuthField>

          <AuthField label="Confirm password">
            <input type={showPass ? "text" : "password"} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" required minLength={8}
              style={AUTH_INPUT} />
          </AuthField>

          {error && <div style={AUTH_ERROR}>{error}</div>}

          <button type="submit" disabled={loading || !password || !confirm}
            style={{
              ...AUTH_SUBMIT,
              opacity: loading || !password || !confirm ? 0.6 : 1,
              cursor: loading || !password || !confirm ? "not-allowed" : "pointer",
            }}>
            {loading ? "Updating..." : <>Update password <RiArrowRightLine size={14} /></>}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

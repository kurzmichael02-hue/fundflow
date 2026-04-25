"use client"
import { useState } from "react"
import { RiCheckLine, RiArrowRightLine } from "react-icons/ri"

// Anon-friendly Express-Interest form. Posts to the existing
// /api/interests endpoint which is rate-limited per IP and dedupes
// on (project_id, email). The "Anonymous" toggle sends the literal
// "anonymous" sentinel that the API recognises and skips dedup for —
// many investors signal interest without committing their name yet.

export default function InterestForm({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const body = anonymous
        ? { project_id: projectId, investor_email: "anonymous", investor_name: name.trim() || "Anonymous" }
        : { project_id: projectId, investor_email: email.trim(), investor_name: name.trim() }
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || `Couldn't submit (${res.status})`)
        return
      }
      setDone(true)
    } catch {
      setError("Network blip. Try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div style={{ padding: "20px 0" }}>
        <div className="flex items-center gap-3 mb-3">
          <span style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#34d399",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 2,
          }}>
            <RiCheckLine size={15} />
          </span>
          <span className="serif text-white" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em" }}>
            Got it.
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
          The founder behind <span style={{ color: "#cbd5e1" }}>{projectName}</span> got an email + a realtime ping.
          They usually reply within 48h.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    color: "#e5e7eb",
    fontSize: 14,
    outline: "none",
    padding: "10px 0",
    fontFamily: "inherit",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase",
    display: "block", marginBottom: 8,
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>Your name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Jane Lovelace" maxLength={120}
            style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{anonymous ? "Email (skipped)" : "Email *"}</label>
          <input type={anonymous ? "text" : "email"}
            value={anonymous ? "" : email}
            onChange={e => setEmail(e.target.value)}
            placeholder={anonymous ? "anonymous signal" : "you@fund.xyz"}
            disabled={anonymous}
            required={!anonymous}
            maxLength={160}
            style={{ ...inputStyle, opacity: anonymous ? 0.4 : 1 }} />
        </div>
      </div>

      <label className="mono flex items-center gap-2 cursor-pointer self-start"
        style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
          style={{ accentColor: "#10b981" }} />
        Send anonymously
      </label>

      <div className="flex flex-col sm:flex-row gap-3 mt-3 items-center">
        <button type="submit" disabled={busy}
          className="mono flex items-center justify-center gap-2"
          style={{
            padding: "12px 22px", fontSize: 11,
            color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
            background: "#10b981", border: 0, borderRadius: 2,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}>
          {busy ? "Sending..." : <>Express interest <RiArrowRightLine size={12} /></>}
        </button>
        <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
          No account required.
        </span>
      </div>

      {error && (
        <div className="mono" style={{
          fontSize: 11, color: "#f87171", letterSpacing: "0.04em",
          padding: "8px 12px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 2,
        }}>
          {error}
        </div>
      )}
    </form>
  )
}

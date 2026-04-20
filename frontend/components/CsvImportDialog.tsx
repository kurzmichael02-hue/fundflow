"use client"
import { useEffect, useRef, useState } from "react"
import { RiCloseLine, RiUploadCloud2Line, RiFileLine, RiCheckLine, RiAlertLine } from "react-icons/ri"

// CSV import for the investors page.
// - Drag-and-drop or file picker.
// - Naive RFC 4180 parser (handles quoted cells with embedded commas / quotes).
// - Header auto-detection: any column whose name contains "name", "email",
//   "company", "status", "deal", or "note" gets mapped automatically.
//   The user can re-map before importing.
// - Preview the first 5 rows before committing.
// - POSTs each row in parallel to /api/investors and reports successes /
//   failures in a single summary.

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"
type FieldKey = "name" | "company" | "email" | "status" | "deal_size" | "notes" | null

const STATUS_NORMALISE: Record<string, Status> = {
  "outreach":   "outreach",
  "interested": "interested",
  "meeting":    "meeting",
  "term sheet": "term_sheet",
  "term_sheet": "term_sheet",
  "termsheet":  "term_sheet",
  "closed":     "closed",
  "won":        "closed",
}

interface Props {
  open: boolean
  onClose: () => void
  onImported: (count: number) => void
}

export default function CsvImportDialog({ open, onClose, onImported }: Props) {
  const [stage, setStage] = useState<"drop" | "map" | "running" | "done">("drop")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<FieldKey[]>([])
  const [error, setError] = useState("")
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setStage("drop")
    setHeaders([])
    setRows([])
    setMapping([])
    setError("")
    setProgress({ done: 0, total: 0, failed: 0 })
  }, [open])

  // Body scroll lock + Esc to close.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && stage !== "running") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose, stage])

  function autoMap(hdrs: string[]): FieldKey[] {
    return hdrs.map(h => {
      const x = h.trim().toLowerCase()
      if (/(^|\b)(name|investor|contact)\b/.test(x)) return "name"
      if (/email|mail/.test(x))                       return "email"
      if (/company|firm|fund/.test(x))                return "company"
      if (/status|stage/.test(x))                     return "status"
      if (/deal|amount|cheque|check|size/.test(x))    return "deal_size"
      if (/note|comment|memo/.test(x))                return "notes"
      return null
    })
  }

  async function handleFile(file: File) {
    setError("")
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError("That doesn't look like a CSV file.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("CSV is bigger than 2MB — split it into smaller files.")
      return
    }
    const text = await file.text()
    let parsed: string[][]
    try {
      parsed = parseCsv(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't parse the CSV file.")
      return
    }
    if (parsed.length < 2) {
      setError("No rows found. Make sure the first line is the header.")
      return
    }
    const [hdrs, ...body] = parsed
    setHeaders(hdrs)
    setRows(body.filter(r => r.some(c => c.trim()))) // drop blank rows
    setMapping(autoMap(hdrs))
    setStage("map")
  }

  function getValue(row: string[], field: FieldKey): string {
    if (!field) return ""
    const idx = mapping.indexOf(field)
    if (idx === -1) return ""
    return (row[idx] || "").trim()
  }

  async function runImport() {
    setStage("running")
    setProgress({ done: 0, total: rows.length, failed: 0 })

    const token = localStorage.getItem("token")
    if (!token) {
      setError("You're signed out. Reload and sign in again.")
      setStage("done")
      return
    }

    let done = 0
    let failed = 0
    // Shared abort signal — any worker that sees a 401 or plan-cap flips
    // this and the others drain their queues without firing more requests.
    // Before, workers kept pounding the API after auth expired and the
    // user saw a bogus "10 imported" when really the session had died.
    let aborted: null | "auth" | "limit" = null

    // Throttle to 4-at-a-time so we don't blast the API. Free plan caps at
    // 25 rows total anyway, but a Pro user importing 500 at once would
    // otherwise open 500 sockets and probably 429.
    const queue = [...rows]
    async function worker() {
      while (queue.length && !aborted) {
        const row = queue.shift()
        if (!row) break

        const name = getValue(row, "name")
        if (!name) { failed++; done++; setProgress(p => ({ ...p, done, failed })); continue }

        const statusRaw = getValue(row, "status").toLowerCase()
        const status: Status = STATUS_NORMALISE[statusRaw] || "outreach"

        const body = {
          name,
          company: getValue(row, "company"),
          email: getValue(row, "email"),
          status,
          deal_size: getValue(row, "deal_size"),
          notes: getValue(row, "notes"),
        }

        try {
          const res = await fetch("/api/investors", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
          if (!res.ok) {
            failed++
            if (res.status === 401) { aborted = "auth"; break }
            // Plan cap — the server already returns { limit: true }. Bail
            // so the user isn't staring at "Importing 40/500" that never
            // actually imports anything.
            const data = await res.json().catch(() => null)
            if (data?.limit) { aborted = "limit"; break }
          }
        } catch {
          failed++
        }
        done++
        setProgress(p => ({ ...p, done, failed }))
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()])
    // Surface the reason the batch stopped early so the user knows why
    // numbers might not match the file they picked.
    if (aborted === "auth") {
      setError("Session expired mid-import. Sign in again and re-run the import.")
    } else if (aborted === "limit") {
      setError(`Hit the free-plan cap after ${done - failed} rows. Upgrade to Pro for unlimited imports.`)
    }
    setStage("done")
    onImported(done - failed)
  }

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="Import investors from CSV"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(2,4,10,0.78)" }}
      onClick={() => stage !== "running" && onClose()}
    >
      <div onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640,
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          borderRadius: 2,
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-baseline gap-3">
            <span className="serif text-white" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>
              Import investors
            </span>
            <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {stage === "drop"   && "1 of 3"}
              {stage === "map"    && "2 of 3"}
              {stage === "running" && "3 of 3 · running"}
              {stage === "done"   && "Done"}
            </span>
          </div>
          {stage !== "running" && (
            <button onClick={onClose} aria-label="Close"
              style={{ background: "transparent", border: 0, color: "#64748b", cursor: "pointer", padding: 0 }}>
              <RiCloseLine size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {stage === "drop" && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) handleFile(f)
                }}
                onClick={() => fileRef.current?.click()}
                style={{
                  cursor: "pointer",
                  padding: "44px 20px",
                  textAlign: "center",
                  background: isDragging ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px dashed ${isDragging ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.18)"}`,
                  borderRadius: 2,
                  transition: "background 120ms, border-color 120ms",
                }}>
                <RiUploadCloud2Line size={32} style={{ color: "#64748b", margin: "0 auto 14px" }} />
                <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500, marginBottom: 4 }}>
                  Drop a CSV here or click to pick one
                </div>
                <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
                  Up to 2 MB · UTF-8 · first row = headers
                </div>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>

              <div className="mono mt-5" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em", lineHeight: 1.7 }}>
                Common headers we&apos;ll auto-detect:{" "}
                <span style={{ color: "#94a3b8" }}>Name, Email, Company, Status, Deal Size, Notes</span>
                . You can remap them in the next step.
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2"
                  style={{ fontSize: 13, color: "#f87171",
                    padding: "10px 14px", background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.2)", borderRadius: 2 }}>
                  <RiAlertLine size={14} style={{ marginTop: 1 }} /> {error}
                </div>
              )}
            </div>
          )}

          {stage === "map" && (
            <div>
              <div className="mono mb-4 flex items-center gap-2" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <RiFileLine size={11} /> {rows.length} row{rows.length === 1 ? "" : "s"} · map columns
              </div>
              <div className="grid gap-2 mb-6"
                style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-3"
                    style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="mono truncate" style={{ fontSize: 11, color: "#cbd5e1", flex: 1, letterSpacing: "0.02em" }}>
                      {h || `Column ${i + 1}`}
                    </span>
                    <select
                      value={mapping[i] ?? ""}
                      onChange={e => {
                        const v = (e.target.value || null) as FieldKey
                        setMapping(prev => prev.map((m, idx) => idx === i ? v : m))
                      }}
                      className="mono"
                      style={{
                        fontSize: 11, color: mapping[i] ? "#e5e7eb" : "#64748b",
                        background: "#060608",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "4px 8px",
                        borderRadius: 2,
                        letterSpacing: "0.02em",
                        outline: "none",
                      }}>
                      <option value="">— ignore —</option>
                      <option value="name">Name *</option>
                      <option value="company">Company</option>
                      <option value="email">Email</option>
                      <option value="status">Status</option>
                      <option value="deal_size">Deal size</option>
                      <option value="notes">Notes</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview — first 3 rows so the user knows what'll be created. */}
              <div className="mono mb-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Preview (first 3 rows)
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div className="grid mono" style={{
                  gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,0.8fr)",
                  fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "8px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <span>Name</span><span>Company / Email</span><span>Status</span>
                </div>
                {rows.slice(0, 3).map((r, ri) => (
                  <div key={ri} className="grid"
                    style={{
                      gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,0.8fr)",
                      padding: "10px 12px",
                      borderBottom: ri < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      fontSize: 12, color: "#e5e7eb",
                    }}>
                    <span className="truncate">{getValue(r, "name") || <em style={{ color: "#f87171" }}>missing</em>}</span>
                    <span className="truncate" style={{ color: "#94a3b8" }}>
                      {getValue(r, "company") || getValue(r, "email") || "—"}
                    </span>
                    <span className="mono" style={{ fontSize: 10, color: "#94a3b8" }}>
                      {(STATUS_NORMALISE[getValue(r, "status").toLowerCase()] || "outreach").replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>

              {!mapping.includes("name") && (
                <div className="mt-4 flex items-start gap-2"
                  style={{ fontSize: 12, color: "#fbbf24",
                    padding: "10px 14px", background: "rgba(251,191,36,0.06)",
                    border: "1px solid rgba(251,191,36,0.2)", borderRadius: 2 }}>
                  <RiAlertLine size={14} style={{ marginTop: 1 }} />
                  Pick a column for <strong>Name</strong>. It&apos;s the only required field.
                </div>
              )}
            </div>
          )}

          {stage === "running" && (
            <div className="py-4">
              <div className="mono mb-3" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Importing
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", marginBottom: 14 }}>
                <div style={{
                  height: "100%",
                  width: `${(progress.done / Math.max(progress.total, 1)) * 100}%`,
                  background: "#10b981",
                  transition: "width 200ms",
                }} />
              </div>
              <div className="mono" style={{ fontSize: 12, color: "#cbd5e1", letterSpacing: "0.04em" }}>
                {progress.done} / {progress.total}{progress.failed > 0 ? <span style={{ color: "#f87171" }}> · {progress.failed} failed</span> : null}
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="py-4">
              <div style={{
                width: 44, height: 44, marginBottom: 18,
                border: "1px solid rgba(16,185,129,0.3)", color: "#34d399",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 2,
              }}>
                <RiCheckLine size={20} />
              </div>
              <div className="serif text-white" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
                Imported {progress.done - progress.failed} of {progress.total}.
              </div>
              {progress.failed > 0 && (
                <p style={{ fontSize: 13, color: "#f87171", marginBottom: 12 }}>
                  {progress.failed} row{progress.failed === 1 ? "" : "s"} failed — usually missing name or hit the free plan cap.
                </p>
              )}
              {error && <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {stage !== "running" && (
          <div className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={onClose}
              className="mono cursor-pointer"
              style={{
                padding: "9px 16px", fontSize: 11,
                color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
              }}>
              {stage === "done" ? "Close" : "Cancel"}
            </button>
            {stage === "map" && (
              <button onClick={runImport}
                disabled={!mapping.includes("name") || rows.length === 0}
                className="mono cursor-pointer"
                style={{
                  padding: "9px 16px", fontSize: 11,
                  color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                  background: "#10b981", border: 0, borderRadius: 2,
                  opacity: mapping.includes("name") && rows.length > 0 ? 1 : 0.5,
                  cursor: mapping.includes("name") ? "pointer" : "not-allowed",
                }}>
                Import {rows.length} row{rows.length === 1 ? "" : "s"} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Naive RFC 4180-aware CSV parser. Handles:
//   · quoted cells with embedded commas, newlines, and `""` escapes
//   · CRLF or LF row separators
//   · trailing comma cells
//   · BOM stripping
//   · unbalanced quotes — throws instead of silently eating the rest of
//     the file as one giant cell. The caller catches and surfaces the
//     error so the user knows their CSV is malformed.
function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "")
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ }
        else inQuotes = false
      } else {
        cell += c
      }
    } else {
      if (c === '"' && cell === "") {
        inQuotes = true
      } else if (c === ",") {
        row.push(cell); cell = ""
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++
        row.push(cell); cell = ""
        rows.push(row); row = []
      } else {
        cell += c
      }
    }
  }
  // If we reached EOF still inside a quoted cell, the file's quotes are
  // unbalanced — don't pretend the trailing garbage is real data.
  if (inQuotes) {
    throw new Error("CSV has an unclosed quote — check for a missing \" in your file.")
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

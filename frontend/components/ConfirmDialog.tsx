"use client"
import { useEffect } from "react"
import { RiAlertLine, RiCloseLine } from "react-icons/ri"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Keep the page scroll locked and let ESC dismiss — cheap UX wins.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [open, loading, onCancel])

  if (!open) return null

  const danger = variant === "danger"
  const accent = danger ? "#f87171" : "#10b981"
  const confirmBg = danger ? "#ef4444" : "#10b981"

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,10,0.78)" }}
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-[440px]"
        style={{
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: `2px solid ${accent}`,
          borderRadius: 2,
          padding: "24px 28px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span style={{ color: accent, display: "flex", alignItems: "center" }}>
              <RiAlertLine size={16} />
            </span>
            <span className="mono" style={{ fontSize: 11, color: accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {danger ? "Destructive action" : "Confirm"}
            </span>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              background: "transparent", border: 0,
              color: "#64748b", cursor: "pointer", padding: 0,
            }}
            aria-label="Close"
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        <h3 id="confirm-dialog-title" className="serif text-white"
          style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="mono cursor-pointer"
            style={{
              padding: "10px 16px", fontSize: 11,
              color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="mono cursor-pointer"
            style={{
              padding: "10px 16px", fontSize: 11,
              color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
              background: confirmBg,
              border: 0, borderRadius: 2,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

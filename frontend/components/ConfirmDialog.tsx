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
  const accent = danger ? "#f87171" : "#34d399"
  const accentBg = danger ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)"
  const accentBorder = danger ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"
  const confirmBg = danger
    ? "linear-gradient(135deg, #ef4444, #dc2626)"
    : "linear-gradient(135deg, #10b981, #059669)"

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,10,0.72)", backdropFilter: "blur(6px)" }}
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl border p-6"
        style={{ background: "#0a0d14", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accent }}
            >
              <RiAlertLine size={18} />
            </div>
            <h3 id="confirm-dialog-title" className="text-[15px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer border-0 bg-transparent flex-shrink-0 disabled:opacity-50"
            aria-label="Close"
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        <p className="text-[13px] text-slate-400 leading-relaxed mb-6">{message}</p>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] cursor-pointer bg-transparent transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer disabled:opacity-60"
            style={{ background: confirmBg }}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { RiCheckLine, RiCloseLine, RiInformationLine, RiErrorWarningLine } from "react-icons/ri"
import React from "react"
export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  success: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    color: "#34d399",
    icon: <RiCheckLine size={15} />,
  },
  error: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    color: "#f87171",
    icon: <RiErrorWarningLine size={15} />,
  },
  info: {
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
    color: "#38bdf8",
    icon: <RiInformationLine size={15} />,
  },
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-[360px] w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const style = TOAST_STYLES[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 240)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 transition-all duration-200"
      style={{
        background: "#060608",
        border: "1px solid rgba(255,255,255,0.1)",
        borderLeft: `2px solid ${style.color}`,
        padding: "12px 14px",
        borderRadius: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
      }}>
      <span style={{ color: style.color, marginTop: 2 }} className="shrink-0">{style.icon}</span>
      <p style={{ fontSize: 13, color: "#e5e7eb", flex: 1, lineHeight: 1.5 }}>{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 240) }}
        aria-label="Dismiss"
        style={{
          color: "#64748b", background: "transparent", border: 0, cursor: "pointer",
          padding: 0, marginTop: 2,
        }}>
        <RiCloseLine size={14} />
      </button>
    </div>
  )
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(message: string, type: ToastType = "success") {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
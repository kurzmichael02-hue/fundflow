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
    <div className="fixed top-5 right-4 z-[9999] flex flex-col gap-2.5 max-w-[320px] w-full pointer-events-none">
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
      setTimeout(() => onRemove(toast.id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-300"
      style={{
        background: style.bg,
        borderColor: style.border,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
      <span style={{ color: style.color }} className="shrink-0">{style.icon}</span>
      <p className="text-[13px] text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-slate-600 hover:text-slate-400 cursor-pointer bg-transparent border-0 shrink-0">
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
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { RiCloseLine } from "react-icons/ri"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          padding: "16px 20px",
        }}>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.55 }}>
            We use minimal cookies for authentication and analytics.{" "}
            <Link href="/privacy" style={{ color: "#10b981", textDecoration: "none" }}>
              Privacy policy →
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={decline}
            className="mono cursor-pointer"
            style={{
              padding: "8px 14px",
              fontSize: 11,
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 2,
              background: "transparent",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
            Decline
          </button>
          <button onClick={accept}
            className="mono cursor-pointer"
            style={{
              padding: "8px 14px",
              fontSize: 11,
              color: "#fff",
              background: "#10b981",
              border: 0,
              borderRadius: 2,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
            Accept
          </button>
          <button onClick={decline} aria-label="Close"
            className="cursor-pointer"
            style={{
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b",
              background: "transparent", border: 0,
            }}>
            <RiCloseLine size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
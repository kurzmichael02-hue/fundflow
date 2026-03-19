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
      <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.08] p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: "rgba(8,12,24,0.97)", backdropFilter: "blur(24px)" }}>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-slate-300 leading-relaxed">
            We use cookies to improve your experience and analyze usage.{" "}
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors underline-offset-2 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={decline}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer border border-white/[0.08] bg-transparent transition-all">
            Decline
          </button>
          <button onClick={accept}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer border-0 transition-all"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            Accept
          </button>
          <button onClick={decline}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 cursor-pointer border-0 bg-transparent transition-colors">
            <RiCloseLine size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-slate-200" style={{ background: "#050508" }}>
      {/* Syne is loaded globally via globals.css. */}
      <div className="fixed top-[10%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
      <div className="text-center relative z-10 px-6">
        <p className="font-black mb-4" style={{ fontSize: "120px", lineHeight: "1", fontFamily: "'Syne', sans-serif", background: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>404</p>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>Page not found</h1>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white no-underline"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            Back to home
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-400 no-underline border"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
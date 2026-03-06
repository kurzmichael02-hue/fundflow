"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("All fields are required")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-[#111118] border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-gray-400 mb-6 text-sm">Login to your FundFlow account</p>

        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-800 px-4 py-3 rounded-lg">{error}</p>}

        <div className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition" />
          <button onClick={handleLogin} disabled={loading} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition">
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          No account?{" "}
          <a href="/register" className="text-cyan-500 hover:underline">Register here</a>
        </p>
      </div>
    </main>
  )
}
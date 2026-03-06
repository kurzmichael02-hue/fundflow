"use client"
import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-[#111118] border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
        <p className="text-gray-400 mb-6 text-sm">Start managing your investor pipeline</p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition"
          />
          <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition">
            Create Account
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-500 hover:underline">Login here</a>
        </p>
      </div>
    </main>
  )
}
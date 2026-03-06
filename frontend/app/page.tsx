export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">FundFlow</h1>
        <p className="text-gray-400 mb-8">The Operating System for Web3 Fundraising</p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg transition">
            Login
          </a>
          <a href="/register" className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black font-semibold px-6 py-3 rounded-lg transition">
            Register
          </a>
        </div>
      </div>
    </main>
  )
}

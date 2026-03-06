"use client"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-500">FundFlow</h1>
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">Dashboard</a>
          <a href="/investors" className="text-gray-400 hover:text-white transition text-sm">Investors</a>
          <a href="/pipeline" className="text-gray-400 hover:text-white transition text-sm">Pipeline</a>
          <button className="bg-red-500 hover:bg-red-400 text-white text-sm px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </nav>

      {/* Stats */}
      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Welcome back 👋</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Investors", value: "0" },
            { label: "Active Leads", value: "0" },
            { label: "Meetings Booked", value: "0" },
            { label: "Deals Closed", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111118] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111118] border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-sm">No activity yet. Start by adding investors to your pipeline.</p>
        </div>
      </div>
    </main>
  )
}
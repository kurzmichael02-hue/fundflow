"use client"
import { useState } from "react"

type Investor = {
  id: number
  name: string
  email: string
  company: string
  status: "Outreach" | "Interested" | "Meeting" | "Term Sheet" | "Closed"
  notes: string
}

const STATUS_COLORS: Record<Investor["status"], string> = {
  Outreach: "bg-gray-700 text-gray-300",
  Interested: "bg-blue-900 text-blue-300",
  Meeting: "bg-yellow-900 text-yellow-300",
  "Term Sheet": "bg-purple-900 text-purple-300",
  Closed: "bg-green-900 text-green-300",
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", company: "", status: "Outreach" as Investor["status"], notes: "" })

  const addInvestor = () => {
    if (!form.name || !form.email) return
    setInvestors([...investors, { ...form, id: Date.now() }])
    setForm({ name: "", email: "", company: "", status: "Outreach", notes: "" })
    setShowModal(false)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-500">FundFlow</h1>
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">Dashboard</a>
          <a href="/investors" className="text-white text-sm font-semibold">Investors</a>
          <a href="/pipeline" className="text-gray-400 hover:text-white transition text-sm">Pipeline</a>
          <button className="bg-red-500 hover:bg-red-400 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Investors</h2>
          <button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition">
            + Add Investor
          </button>
        </div>

        {investors.length === 0 ? (
          <div className="bg-[#111118] border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-500">No investors yet. Add your first one!</p>
          </div>
        ) : (
          <div className="bg-[#111118] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Name</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Company</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-800 hover:bg-[#1a1a25] transition">
                    <td className="px-6 py-4 text-white font-medium">{inv.name}</td>
                    <td className="px-6 py-4 text-gray-300">{inv.company}</td>
                    <td className="px-6 py-4 text-gray-300">{inv.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{inv.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Add Investor</h3>
            <div className="flex flex-col gap-4">
              <input placeholder="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition" />
              <input placeholder="Email *" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition" />
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition" />
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as Investor["status"]})} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition">
                <option>Outreach</option>
                <option>Interested</option>
                <option>Meeting</option>
                <option>Term Sheet</option>
                <option>Closed</option>
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="bg-[#1a1a25] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition resize-none h-24" />
              <div className="flex gap-3">
                <button onClick={addInvestor} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition">Add</button>
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-700 text-gray-300 hover:bg-gray-800 py-3 rounded-lg transition">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
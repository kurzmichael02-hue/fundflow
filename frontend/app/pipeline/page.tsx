"use client"
import { useState } from "react"

type Investor = {
  id: number
  name: string
  company: string
  status: "Outreach" | "Interested" | "Meeting" | "Term Sheet" | "Closed"
}

const COLUMNS: Investor["status"][] = ["Outreach", "Interested", "Meeting", "Term Sheet", "Closed"]

const COLUMN_COLORS: Record<Investor["status"], string> = {
  Outreach: "border-gray-600",
  Interested: "border-blue-600",
  Meeting: "border-yellow-600",
  "Term Sheet": "border-purple-600",
  Closed: "border-green-600",
}

const BADGE_COLORS: Record<Investor["status"], string> = {
  Outreach: "bg-gray-700 text-gray-300",
  Interested: "bg-blue-900 text-blue-300",
  Meeting: "bg-yellow-900 text-yellow-300",
  "Term Sheet": "bg-purple-900 text-purple-300",
  Closed: "bg-green-900 text-green-300",
}

const DEMO: Investor[] = [
  { id: 1, name: "John Smith", company: "a16z", status: "Outreach" },
  { id: 2, name: "Sarah Lee", company: "Sequoia", status: "Interested" },
  { id: 3, name: "Mike Johnson", company: "Paradigm", status: "Meeting" },
]

export default function PipelinePage() {
  const [investors, setInvestors] = useState<Investor[]>(DEMO)

  const moveInvestor = (id: number, newStatus: Investor["status"]) => {
    setInvestors(investors.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv))
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-500">FundFlow</h1>
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">Dashboard</a>
          <a href="/investors" className="text-gray-400 hover:text-white transition text-sm">Investors</a>
          <a href="/pipeline" className="text-white text-sm font-semibold">Pipeline</a>
          <button className="bg-red-500 hover:bg-red-400 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Pipeline</h2>
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map(col => (
            <div key={col} className={`bg-[#111118] border-t-2 ${COLUMN_COLORS[col]} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{col}</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                  {investors.filter(i => i.status === col).length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {investors.filter(i => i.status === col).map(inv => (
                  <div key={inv.id} className="bg-[#1a1a25] border border-gray-700 rounded-lg p-3">
                    <p className="font-medium text-sm text-white">{inv.name}</p>
                    <p className="text-xs text-gray-400 mb-3">{inv.company}</p>
                    <select
                      value={inv.status}
                      onChange={(e) => moveInvestor(inv.id, e.target.value as Investor["status"])}
                      className="w-full bg-[#0a0a0f] border border-gray-700 text-xs text-gray-300 rounded px-2 py-1 outline-none"
                    >
                      {COLUMNS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
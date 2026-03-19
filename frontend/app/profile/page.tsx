"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ToastContainer, useToast } from "@/components/Toast"
import { RiCheckLine, RiEditLine, RiCloseLine, RiRocketLine, RiEyeLine, RiEyeOffLine, RiWallet3Line, RiQrCodeLine, RiPencilLine } from "react-icons/ri"

const STAGE_OPTIONS = ["pre-seed", "seed", "series-a", "series-b", "web3"]
const STAGE_LABELS: Record<string, string> = {
  "pre-seed": "Pre-Seed", "seed": "Seed", "series-a": "Series A",
  "series-b": "Series B", "web3": "Web3 / Token"
}
const CHAIN_OPTIONS = ["ETH", "SOL", "ARB", "BASE", "BNB", "MATIC", "Other"]

declare global {
  interface Window { ethereum?: any }
}

const WC_PROJECT_ID = "1a895e994a423c409a9ce755f220cb71"

export default function ProfilePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [profile, setProfile] = useState({ name: "", email: "", company: "", bio: "", wallet_address: "" })
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(profile)
  const [savingProfile, setSavingProfile] = useState(false)

  const [walletMode, setWalletMode] = useState<"idle" | "manual" | "connecting">("idle")
  const [manualAddress, setManualAddress] = useState("")
  const [connectingWallet, setConnectingWallet] = useState(false)

  const [project, setProject] = useState<any>(null)
  const [editProject, setEditProject] = useState(false)
  const [projectForm, setProjectForm] = useState({
    name: "", description: "", stage: "pre-seed", goal: "",
    raised: "", chain: "ETH", tags: "", published: false
  })
  const [savingProject, setSavingProject] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
  }, [])

  async function fetchAll(token: string) {
    try {
      const [pRes, projRes] = await Promise.all([
        fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/projects", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } })
      ])
      const pData = await pRes.json()
      setProfile(pData)
      setProfileForm(pData)
      const projData = await projRes.json()
      if (projData) {
        setProject(projData)
        setProjectForm({
          name: projData.name || "", description: projData.description || "",
          stage: projData.stage || "pre-seed", goal: projData.goal || "",
          raised: projData.raised || "", chain: projData.chain || "ETH",
          tags: Array.isArray(projData.tags) ? projData.tags.join(", ") : "",
          published: projData.published || false,
        })
      }
    } catch { router.push("/login") }
    finally { setLoading(false) }
  }

  async function saveWalletAddress(address: string) {
    const token = localStorage.getItem("token")!
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...profileForm, wallet_address: address }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setProfile(data)
    setProfileForm(data)
  }

  async function handleConnectMetaMask() {
    if (!window.ethereum) {
      addToast("MetaMask not installed. Use WalletConnect or paste manually.", "info")
      return
    }
    setConnectingWallet(true)
    try {
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (!accounts.length) throw new Error("No accounts found")
      await saveWalletAddress(accounts[0])
      addToast("MetaMask connected!")
      setWalletMode("idle")
    } catch (err: any) {
      if (err.code === 4001) addToast("Connection rejected.", "error")
      else addToast(err.message || "Failed to connect", "error")
    } finally { setConnectingWallet(false) }
  }

  async function handleConnectWalletConnect() {
    setConnectingWallet(true)
    try {
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider")
      const provider = await EthereumProvider.init({
        projectId: WC_PROJECT_ID,
        chains: [1],
        showQrModal: true,
        metadata: {
          name: "FundFlow",
          description: "Web3 Investor CRM",
          url: "https://fundflow-omega.vercel.app",
          icons: ["https://fundflow-omega.vercel.app/favicon.ico"],
        },
      })
      await provider.connect()
      const accounts = provider.accounts
      if (!accounts.length) throw new Error("No accounts")
      await saveWalletAddress(accounts[0])
      addToast("Wallet connected via WalletConnect!")
      setWalletMode("idle")
    } catch (err: any) {
      if (err.message?.includes("User rejected")) addToast("Connection rejected.", "error")
      else addToast(err.message || "WalletConnect failed", "error")
    } finally { setConnectingWallet(false) }
  }

  async function handleSaveManual() {
    if (!manualAddress.trim()) return
    setConnectingWallet(true)
    try {
      await saveWalletAddress(manualAddress.trim())
      addToast("Wallet address saved!")
      setWalletMode("idle")
      setManualAddress("")
    } catch (err: any) {
      addToast(err.message, "error")
    } finally { setConnectingWallet(false) }
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data)
      setEditProfile(false)
      addToast("Profile updated!")
    } catch (err: any) { addToast(err.message, "error") }
    finally { setSavingProfile(false) }
  }

  async function handleSaveProject() {
    setSavingProject(true)
    const token = localStorage.getItem("token")!
    try {
      const tagsArray = projectForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...projectForm, goal: Number(projectForm.goal), raised: Number(projectForm.raised), tags: tagsArray }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProject(data)
      setEditProject(false)
      addToast(data.published ? "Project published!" : "Project saved as draft.")
    } catch (err: any) { addToast(err.message, "error") }
    finally { setSavingProject(false) }
  }

  function truncateAddress(addr: string) {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-2xl mx-auto flex flex-col gap-6">

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Profile</h2>
              <p className="text-xs text-slate-600 mt-0.5">Your founder information</p>
            </div>
            {!editProfile ? (
              <button onClick={() => setEditProfile(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer"
                style={{ background: "transparent" }}>
                <RiEditLine size={13} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  <RiCheckLine size={13} /> {savingProfile ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditProfile(false); setProfileForm(profile) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer"
                  style={{ background: "transparent" }}>
                  <RiCloseLine size={13} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                {profile.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-white font-semibold">{profile.name || "—"}</p>
                <p className="text-slate-600 text-xs mt-0.5">{profile.email}</p>
              </div>
            </div>

            {[
              { label: "Full Name", key: "name", placeholder: "Your name" },
              { label: "Company", key: "company", placeholder: "Your company or project" },
              { label: "Bio", key: "bio", placeholder: "Short bio..." },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">{f.label}</label>
                {editProfile ? (
                  <input value={(profileForm as any)[f.key] || ""} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                ) : (
                  <p className="text-sm text-slate-300">{(profile as any)[f.key] || <span className="text-slate-700">Not set</span>}</p>
                )}
              </div>
            ))}

            {/* Wallet Section */}
            <div>
              <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Wallet Address</label>

              {profile.wallet_address && walletMode === "idle" ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] flex-1 min-w-0"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300 font-mono truncate">{truncateAddress(profile.wallet_address)}</span>
                    <span className="text-[11px] text-slate-600 truncate hidden sm:block">{profile.wallet_address}</span>
                  </div>
                  <button onClick={() => setWalletMode("connecting")}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer whitespace-nowrap flex-shrink-0"
                    style={{ background: "transparent" }}>
                    <RiWallet3Line size={13} /> Change
                  </button>
                </div>
              ) : walletMode === "manual" ? (
                <div className="flex flex-col gap-2">
                  <input value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                    placeholder="Paste your wallet address (0x...)"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveManual} disabled={connectingWallet || !manualAddress.trim()}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                      {connectingWallet ? "Saving..." : "Save Address"}
                    </button>
                    <button onClick={() => { setWalletMode("idle"); setManualAddress("") }}
                      className="px-4 py-2.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer"
                      style={{ background: "transparent" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Connect options
                <div className="flex flex-col gap-2">
                  <button onClick={handleConnectMetaMask} disabled={connectingWallet}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                    <RiWallet3Line size={18} />
                    {connectingWallet ? "Connecting..." : "Connect MetaMask"}
                    <span className="ml-auto text-[11px] text-slate-600">Browser extension</span>
                  </button>
                  <button onClick={handleConnectWalletConnect} disabled={connectingWallet}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.2)", color: "#38bdf8" }}>
                    <RiQrCodeLine size={18} />
                    {connectingWallet ? "Connecting..." : "WalletConnect"}
                    <span className="ml-auto text-[11px] text-slate-600">QR code · any wallet</span>
                  </button>
                  <button onClick={() => setWalletMode("manual")}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                    <RiPencilLine size={18} />
                    Paste address manually
                    <span className="ml-auto text-[11px] text-slate-600">Any wallet</span>
                  </button>
                  {profile.wallet_address && (
                    <button onClick={() => setWalletMode("idle")}
                      className="text-xs text-slate-600 cursor-pointer bg-transparent border-0 text-center">
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Project Card */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-white tracking-tight">Your Project</h2>
                {project?.published && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                    Live
                  </span>
                )}
                {project && !project.published && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Visible to investors on Deal Flow</p>
            </div>
            {!editProject ? (
              <button onClick={() => setEditProject(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer"
                style={{ background: "transparent" }}>
                {project ? <><RiEditLine size={13} /> Edit</> : <><RiRocketLine size={13} /> Create</>}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveProject} disabled={savingProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  <RiCheckLine size={13} /> {savingProject ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditProject(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/[0.08] cursor-pointer"
                  style={{ background: "transparent" }}>
                  <RiCloseLine size={13} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {!project && !editProject ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 border border-white/[0.06] mx-auto mb-3"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <RiRocketLine size={22} />
                </div>
                <p className="text-sm text-slate-600 mb-4">No project yet. Create one to appear on the investor Deal Flow.</p>
                <button onClick={() => setEditProject(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  Create Project
                </button>
              </div>
            ) : editProject ? (
              <div className="flex flex-col gap-3.5">
                {[
                  { key: "name", label: "Project Name", placeholder: "e.g. NovaPay" },
                  { key: "description", label: "Description", placeholder: "What does your project do?" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input value={(projectForm as any)[f.key]} onChange={e => setProjectForm({ ...projectForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Stage</label>
                    <select value={projectForm.stage} onChange={e => setProjectForm({ ...projectForm, stage: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-white/[0.08] outline-none"
                      style={{ background: "rgba(14,7,15,0.9)", color: "#e2e8f0" }}>
                      {STAGE_OPTIONS.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Chain</label>
                    <select value={projectForm.chain} onChange={e => setProjectForm({ ...projectForm, chain: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-white/[0.08] outline-none"
                      style={{ background: "rgba(14,7,15,0.9)", color: "#e2e8f0" }}>
                      {CHAIN_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Funding Goal ($)</label>
                    <input type="number" value={projectForm.goal} onChange={e => setProjectForm({ ...projectForm, goal: e.target.value })}
                      placeholder="2500000"
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Raised So Far ($)</label>
                    <input type="number" value={projectForm.raised} onChange={e => setProjectForm({ ...projectForm, raised: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                  <input value={projectForm.tags} onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })}
                    placeholder="DeFi, AI, B2B"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div className="flex items-center justify-between rounded-xl px-4 py-3 border border-white/[0.08]"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2.5">
                    {projectForm.published ? <RiEyeLine size={15} className="text-emerald-400" /> : <RiEyeOffLine size={15} className="text-slate-600" />}
                    <div>
                      <p className="text-sm text-slate-300 font-medium">{projectForm.published ? "Published" : "Draft"}</p>
                      <p className="text-[11px] text-slate-600">{projectForm.published ? "Visible to investors" : "Only you can see this"}</p>
                    </div>
                  </div>
                  <button onClick={() => setProjectForm({ ...projectForm, published: !projectForm.published })}
                    className="relative w-10 h-5 rounded-full transition-all cursor-pointer border-0 flex-shrink-0"
                    style={{ background: projectForm.published ? "#0ea5e9" : "rgba(255,255,255,0.1)" }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: projectForm.published ? "22px" : "2px" }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                    {project.name?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{project.name}</p>
                    <p className="text-xs text-slate-600">{STAGE_LABELS[project.stage]} · {project.chain}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{project.description}</p>
                <div className="flex gap-4 text-xs">
                  <div><span className="text-slate-600">Goal: </span><span className="text-white">${Number(project.goal).toLocaleString()}</span></div>
                  <div><span className="text-slate-600">Raised: </span><span className="text-white">${Number(project.raised).toLocaleString()}</span></div>
                </div>
                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t: string) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
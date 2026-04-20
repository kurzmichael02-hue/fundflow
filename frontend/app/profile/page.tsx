"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import { requireToken } from "@/lib/api"
import {
  RiCheckLine, RiEditLine, RiCloseLine, RiRocketLine,
  RiEyeLine, RiEyeOffLine, RiWallet3Line, RiQrCodeLine, RiPencilLine,
  RiArrowRightLine,
} from "react-icons/ri"

type Profile = {
  name?: string | null
  email?: string | null
  company?: string | null
  bio?: string | null
  wallet_address?: string | null
}
type Project = {
  name?: string
  description?: string
  stage?: string
  chain?: string
  goal?: number | string
  raised?: number | string
  tags?: string[]
  published?: boolean
}

const STAGE_OPTIONS = ["pre-seed", "seed", "series-a", "series-b", "web3"] as const
const STAGE_LABELS: Record<string, string> = {
  "pre-seed": "Pre-Seed", "seed": "Seed", "series-a": "Series A",
  "series-b": "Series B", "web3": "Web3 / Token",
}
const CHAIN_OPTIONS = ["ETH", "SOL", "ARB", "BASE", "BNB", "MATIC", "Other"]

declare global {
  interface Window { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }
}

const WC_PROJECT_ID = "1a895e994a423c409a9ce755f220cb71"

// Profile — editorial redesign split into two sections: Identity (profile +
// wallet) and Deal room (published project). Underline-form inputs, hairline
// borders, mono labels. Wallet flow unchanged; UI rewritten.

export default function ProfilePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [profile, setProfile] = useState<Profile>({ name: "", email: "", company: "", bio: "", wallet_address: "" })
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<Profile>(profile)
  const [savingProfile, setSavingProfile] = useState(false)

  const [walletMode, setWalletMode] = useState<"idle" | "manual" | "connecting">("idle")
  const [manualAddress, setManualAddress] = useState("")
  const [connectingWallet, setConnectingWallet] = useState(false)

  const [project, setProject] = useState<Project | null>(null)
  const [editProject, setEditProject] = useState(false)
  const [projectForm, setProjectForm] = useState({
    name: "", description: "", stage: "pre-seed", goal: "",
    raised: "", chain: "ETH", tags: "", published: false,
  })
  const [savingProject, setSavingProject] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAll(token: string) {
    try {
      const [pRes, projRes] = await Promise.all([
        fetch("/api/profile",  { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/projects", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (pRes.status === 401 || projRes.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user_type")
        router.push("/login")
        return
      }
      const pData: Profile = await pRes.json()
      setProfile(pData)
      setProfileForm(pData)
      const projData: Project | null = await projRes.json()
      if (projData) {
        setProject(projData)
        setProjectForm({
          name: projData.name || "",
          description: projData.description || "",
          stage: projData.stage || "pre-seed",
          goal: projData.goal?.toString() || "",
          raised: projData.raised?.toString() || "",
          chain: projData.chain || "ETH",
          tags: Array.isArray(projData.tags) ? projData.tags.join(", ") : "",
          published: projData.published || false,
        })
      }
    } catch {
      // Non-401 — leave the page in its blank state; the user can refresh.
    } finally { setLoading(false) }
  }

  async function saveWalletAddress(address: string) {
    const token = requireToken(router.push)
    if (!token) return
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ wallet_address: address }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setProfile(data)
    setProfileForm(prev => ({ ...prev, wallet_address: data.wallet_address }))
  }

  async function handleConnectMetaMask() {
    if (!window.ethereum) {
      addToast("MetaMask not installed — use WalletConnect or paste manually", "info")
      return
    }
    setConnectingWallet(true)
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]
      if (!accounts.length) throw new Error("No accounts found")
      await saveWalletAddress(accounts[0])
      addToast("MetaMask connected")
      setWalletMode("idle")
    } catch (err) {
      const e = err as { code?: number; message?: string }
      if (e.code === 4001) addToast("Connection rejected", "error")
      else addToast(e.message || "Failed to connect", "error")
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
      addToast("Wallet connected via WalletConnect")
      setWalletMode("idle")
    } catch (err) {
      const e = err as { message?: string }
      if (e.message?.includes("User rejected")) addToast("Connection rejected", "error")
      else addToast(e.message || "WalletConnect failed", "error")
    } finally { setConnectingWallet(false) }
  }

  async function handleSaveManual() {
    const trimmed = manualAddress.trim()
    if (!trimmed) return
    // Accept either an EVM address (0x + 40 hex) or a Solana address
    // (base58, 32–44 chars with Bitcoin's no-0/O/I/l alphabet). The
    // CHAIN_OPTIONS list has SOL as a first-class option, so rejecting
    // Solana addresses here leaves those founders unable to save a wallet.
    const isEvm    = /^0x[a-fA-F0-9]{40}$/.test(trimmed)
    const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)
    if (!isEvm && !isSolana) {
      addToast("That doesn't look like a wallet address — paste an EVM (0x…) or Solana address", "error")
      return
    }
    setConnectingWallet(true)
    try {
      await saveWalletAddress(trimmed)
      addToast("Wallet address saved")
      setWalletMode("idle")
      setManualAddress("")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed", "error")
    } finally { setConnectingWallet(false) }
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const token = requireToken(router.push)
    if (!token) { setSavingProfile(false); return }
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profileForm.name,
          company: profileForm.company,
          bio: profileForm.bio,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user_type")
          router.push("/login")
          return
        }
        throw new Error(data.error)
      }
      setProfile(data)
      setEditProfile(false)
      addToast("Profile updated")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed", "error")
    }
    finally { setSavingProfile(false) }
  }

  async function handleSaveProject() {
    setSavingProject(true)
    const token = requireToken(router.push)
    if (!token) { setSavingProject(false); return }
    try {
      const tagsArray = projectForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      // Number("") is 0, Number("abc") is NaN — guard both. We also clamp
      // negatives because nobody raises -$1M.
      const safeNumber = (v: string) => {
        const n = Number(v)
        return Number.isFinite(n) && n >= 0 ? n : 0
      }
      const trimmedName = projectForm.name.trim()
      if (!trimmedName) {
        addToast("Project name is required", "error")
        return
      }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...projectForm,
          name: trimmedName,
          goal: safeNumber(projectForm.goal),
          raised: safeNumber(projectForm.raised),
          tags: tagsArray,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user_type")
          router.push("/login")
          return
        }
        throw new Error(data.error)
      }
      setProject(data)
      setEditProject(false)
      addToast(data.published ? "Project published" : "Project saved as draft")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed", "error")
    }
    finally { setSavingProject(false) }
  }

  function truncateAddress(addr: string) {
    if (!addr) return ""
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Loading profile...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[900px] mx-auto px-6 md:px-10">

        {/* ── Ticker ── */}
        <div className="flex items-center justify-between pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Profile · Identity · Deal room
          </span>
          {project?.published && (
            <span className="mono flex items-center gap-1.5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              Project live
            </span>
          )}
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-10">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Account
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 64px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            You & your project.
          </h1>
        </section>

        {/* ── Section: Profile ── */}
        <Section
          kicker="Identity"
          title="Who you are."
          action={!editProfile && (
            <button onClick={() => setEditProfile(true)} className="mono cursor-pointer flex items-center gap-1.5"
              style={editActionStyle}>
              <RiEditLine size={12} /> Edit
            </button>
          )}
          rightOfAction={editProfile && (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditProfile(false); setProfileForm(profile) }}
                className="mono cursor-pointer" style={editActionStyle}>
                <RiCloseLine size={12} /> Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={savingProfile}
                className="mono cursor-pointer flex items-center gap-1.5"
                style={{ ...primaryActionStyle, opacity: savingProfile ? 0.6 : 1 }}>
                <RiCheckLine size={12} /> {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          )}>
          <FieldRow label="Name">
            {editProfile
              ? <input value={profileForm.name || ""} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your name" style={underlineInput} />
              : <span style={valueStyle}>{profile.name || <span style={{ color: "#64748b" }}>—</span>}</span>
            }
          </FieldRow>
          <FieldRow label="Email">
            <span style={{ ...valueStyle, color: "#94a3b8" }}>{profile.email || "—"}</span>
          </FieldRow>
          <FieldRow label="Company">
            {editProfile
              ? <input value={profileForm.company || ""} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                  placeholder="Your company or project" style={underlineInput} />
              : <span style={valueStyle}>{profile.company || <span style={{ color: "#64748b" }}>—</span>}</span>
            }
          </FieldRow>
          <FieldRow label="Bio">
            {editProfile
              ? <input value={profileForm.bio || ""} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Short bio..." style={underlineInput} />
              : <span style={valueStyle}>{profile.bio || <span style={{ color: "#64748b" }}>—</span>}</span>
            }
          </FieldRow>
        </Section>

        {/* ── Section: Wallet ── */}
        <Section kicker="Wallet" title="Connect an address.">
          {profile.wallet_address && walletMode === "idle" ? (
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                <span className="mono" style={{ fontSize: 13, color: "#e5e7eb", letterSpacing: "0.02em" }}>
                  {truncateAddress(profile.wallet_address)}
                </span>
                <span className="mono hidden sm:inline" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.02em" }}>
                  {profile.wallet_address}
                </span>
              </div>
              <button onClick={() => setWalletMode("connecting")}
                className="mono cursor-pointer flex items-center gap-1.5"
                style={editActionStyle}>
                <RiWallet3Line size={12} /> Change
              </button>
            </div>
          ) : walletMode === "manual" ? (
            <div className="py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="mono mb-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Paste address
              </div>
              <input value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                placeholder="0x..." style={{ ...underlineInput, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }} />
              <div className="flex gap-2 mt-5">
                <button onClick={() => { setWalletMode("idle"); setManualAddress("") }}
                  className="mono cursor-pointer" style={editActionStyle}>
                  Cancel
                </button>
                <button onClick={handleSaveManual} disabled={connectingWallet || !manualAddress.trim()}
                  className="mono cursor-pointer"
                  style={{ ...primaryActionStyle, opacity: (connectingWallet || !manualAddress.trim()) ? 0.5 : 1 }}>
                  {connectingWallet ? "Saving..." : "Save address"}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {[
                { icon: <RiWallet3Line size={14} />, label: "MetaMask",      hint: "Browser extension",  color: "#fbbf24", onClick: handleConnectMetaMask },
                { icon: <RiQrCodeLine size={14} />,  label: "WalletConnect", hint: "QR · any wallet",    color: "#38bdf8", onClick: handleConnectWalletConnect },
                { icon: <RiPencilLine size={14} />,  label: "Paste address", hint: "Any 0x…",            color: "#94a3b8", onClick: () => setWalletMode("manual") },
              ].map(w => (
                <button key={w.label} onClick={w.onClick} disabled={connectingWallet}
                  className="w-full grid grid-cols-[auto_1fr_auto] gap-4 items-center py-4 cursor-pointer text-left"
                  style={{
                    background: "transparent", border: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    opacity: connectingWallet ? 0.5 : 1,
                  }}>
                  <span style={{ color: w.color }}>{w.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }}>{w.label}</div>
                    <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>{w.hint}</div>
                  </div>
                  <RiArrowRightLine size={12} style={{ color: "#64748b" }} />
                </button>
              ))}
              {profile.wallet_address && (
                <button onClick={() => setWalletMode("idle")}
                  className="mono w-full mt-4" style={{ ...editActionStyle, justifyContent: "center" }}>
                  Cancel
                </button>
              )}
            </div>
          )}
        </Section>

        {/* ── Section: Project ── */}
        <Section
          kicker="Deal room"
          title={project?.published ? "Live on the deal flow." : project ? "Draft." : "Publish a project."}
          badge={project && (
            <span className="mono" style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
              padding: "3px 8px",
              color: project.published ? "#34d399" : "#64748b",
              background: project.published ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${project.published ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 2,
            }}>
              {project.published ? "Live" : "Draft"}
            </span>
          )}
          action={!editProject && (
            <button onClick={() => setEditProject(true)}
              className="mono cursor-pointer flex items-center gap-1.5"
              style={editActionStyle}>
              {project ? <><RiEditLine size={12} /> Edit</> : <><RiRocketLine size={12} /> Create</>}
            </button>
          )}
          rightOfAction={editProject && (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditProject(false)}
                className="mono cursor-pointer" style={editActionStyle}>
                <RiCloseLine size={12} /> Cancel
              </button>
              <button onClick={handleSaveProject} disabled={savingProject}
                className="mono cursor-pointer flex items-center gap-1.5"
                style={{ ...primaryActionStyle, opacity: savingProject ? 0.6 : 1 }}>
                <RiCheckLine size={12} /> {savingProject ? "Saving..." : "Save"}
              </button>
            </div>
          )}>

          {!project && !editProject ? (
            <div className="py-14 text-center">
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
                No project yet. Publish one to appear on the investor deal flow.
              </p>
              <button onClick={() => setEditProject(true)}
                className="mono cursor-pointer inline-flex items-center gap-1.5"
                style={primaryActionStyle}>
                <RiRocketLine size={12} /> Create project
              </button>
            </div>
          ) : editProject ? (
            <div className="flex flex-col">
              <FieldRow label="Name">
                <input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g. NovaPay" style={underlineInput} />
              </FieldRow>
              <FieldRow label="Description">
                <input value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="One-line pitch" style={underlineInput} />
              </FieldRow>
              <FieldRow label="Stage">
                <select value={projectForm.stage} onChange={e => setProjectForm({ ...projectForm, stage: e.target.value })}
                  style={{ ...underlineInput, cursor: "pointer", background: "#060608" }}>
                  {STAGE_OPTIONS.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Chain">
                <select value={projectForm.chain} onChange={e => setProjectForm({ ...projectForm, chain: e.target.value })}
                  style={{ ...underlineInput, cursor: "pointer", background: "#060608" }}>
                  {CHAIN_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Funding goal ($)">
                <input type="number" value={projectForm.goal} onChange={e => setProjectForm({ ...projectForm, goal: e.target.value })}
                  placeholder="2500000" style={underlineInput} />
              </FieldRow>
              <FieldRow label="Raised so far ($)">
                <input type="number" value={projectForm.raised} onChange={e => setProjectForm({ ...projectForm, raised: e.target.value })}
                  placeholder="0" style={underlineInput} />
              </FieldRow>
              <FieldRow label="Tags">
                <input value={projectForm.tags} onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })}
                  placeholder="DeFi, AI, B2B" style={underlineInput} />
              </FieldRow>
              <div className="py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => setProjectForm({ ...projectForm, published: !projectForm.published })}
                  className="w-full grid grid-cols-[1fr_auto] gap-4 items-center cursor-pointer text-left"
                  style={{ background: "transparent", border: 0, padding: 0 }}>
                  <div className="flex items-center gap-3">
                    {projectForm.published
                      ? <RiEyeLine size={14} style={{ color: "#10b981" }} />
                      : <RiEyeOffLine size={14} style={{ color: "#64748b" }} />}
                    <div>
                      <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }}>
                        {projectForm.published ? "Published" : "Draft"}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                        {projectForm.published ? "Investors see this on the deal flow" : "Only you can see this"}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 36, height: 20,
                    background: projectForm.published ? "#10b981" : "rgba(255,255,255,0.08)",
                    position: "relative",
                    borderRadius: 2,
                    transition: "background 180ms",
                  }}>
                    <div style={{
                      position: "absolute", top: 2,
                      left: projectForm.published ? 18 : 2,
                      width: 16, height: 16,
                      background: "#fff",
                      borderRadius: 2,
                      transition: "left 180ms",
                    }} />
                  </div>
                </button>
              </div>
            </div>
          ) : project && (
            <div className="flex flex-col gap-5 pb-2">
              <div className="flex items-baseline gap-4">
                <h3 className="serif text-white" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{project.name}</h3>
                <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {STAGE_LABELS[project.stage || ""] || project.stage} · {project.chain}
                </span>
              </div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, maxWidth: 560 }}>{project.description}</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mono mb-1" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Goal
                  </div>
                  <div className="serif" style={{ fontSize: 22, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em" }}>
                    ${Number(project.goal || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="mono mb-1" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Raised
                  </div>
                  <div className="serif" style={{ fontSize: 22, color: "#34d399", fontWeight: 500, letterSpacing: "-0.02em" }}>
                    ${Number(project.raised || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map(t => (
                    <span key={t} className="mono" style={{
                      fontSize: 10, color: "#94a3b8", letterSpacing: "0.04em",
                      padding: "3px 8px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 2,
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        <div style={{ height: 80 }} />
      </div>
    </main>
  )
}

const editActionStyle: React.CSSProperties = {
  padding: "8px 12px", fontSize: 10,
  color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
  background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
  display: "flex", alignItems: "center", gap: 6,
}
const primaryActionStyle: React.CSSProperties = {
  padding: "8px 12px", fontSize: 10,
  color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
  background: "#10b981", border: 0, borderRadius: 2,
  display: "flex", alignItems: "center", gap: 6,
}
const underlineInput: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid rgba(16,185,129,0.4)",
  color: "#e5e7eb",
  fontSize: 14,
  outline: "none",
  padding: "6px 0",
  fontFamily: "inherit",
}
const valueStyle: React.CSSProperties = {
  fontSize: 14, color: "#e5e7eb",
}

function Section({
  kicker, title, badge, action, rightOfAction, children,
}: {
  kicker: string
  title: string
  badge?: React.ReactNode
  action?: React.ReactNode
  rightOfAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {kicker}
          </p>
          <div className="flex items-baseline gap-3">
            <h2 className="serif text-white" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              {title}
            </h2>
            {badge}
          </div>
        </div>
        <div>{action}{rightOfAction}</div>
      </div>
      {children}
    </section>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] gap-4 py-4 items-baseline"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  )
}

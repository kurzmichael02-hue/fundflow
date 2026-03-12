"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import {
  RiUserLine,
  RiMailLine,
  RiBuildingLine,
  RiFileTextLine,
  RiWallet3Line,
  RiCheckLine,
  RiEditLine,
} from "react-icons/ri"

interface Profile {
  id: string
  name: string
  email: string
  company: string
  bio: string
  wallet_address: string
  user_type: string
  subscription_status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: "", company: "", bio: "", wallet_address: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data)
      setForm({ name: data.name || "", company: data.company || "", bio: data.bio || "", wallet_address: data.wallet_address || "" })
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading profile...
      </div>
    </div>
  )

  const initials = profile?.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your account details</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm text-emerald-400 border border-emerald-500/20"
              style={{ background: "rgba(16,185,129,0.08)" }}>
              <RiCheckLine size={15} /> Saved successfully
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 p-6 rounded-2xl border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{profile?.name || "—"}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full text-sky-400 border border-sky-500/20"
                style={{ background: "rgba(14,165,233,0.08)" }}>
                {profile?.user_type || "founder"}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-500/20"
                style={{ background: "rgba(16,185,129,0.08)" }}>
                {profile?.subscription_status || "free"}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white">Account Details</p>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-[12px] text-slate-400 border border-white/[0.08] px-3 py-1.5 rounded-lg hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
                style={{ background: "transparent" }}>
                <RiEditLine size={13} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setForm({ name: profile?.name || "", company: profile?.company || "", bio: profile?.bio || "", wallet_address: profile?.wallet_address || "" }) }}
                  className="text-[12px] text-slate-500 border border-white/[0.08] px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                  style={{ background: "transparent" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 text-[12px] text-white px-3 py-1.5 rounded-lg disabled:opacity-50 cursor-pointer border-0"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  <RiCheckLine size={13} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-5">
            {[
              { key: "name", label: "Full Name", icon: <RiUserLine size={15} />, placeholder: "Your full name" },
              { key: "company", label: "Company / Fund", icon: <RiBuildingLine size={15} />, placeholder: "Your company or fund name" },
              { key: "wallet_address", label: "Wallet Address", icon: <RiWallet3Line size={15} />, placeholder: "0x..." },
            ].map(f => (
              <div key={f.key}>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-widest mb-2">
                  <span className="text-sky-500/60">{f.icon}</span> {f.label}
                </label>
                {editing ? (
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none focus:border-sky-500/40 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                ) : (
                  <p className="text-sm text-slate-300 py-2.5 px-3.5">
                    {(profile as any)?.[f.key] || <span className="text-slate-600">Not set</span>}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-widest mb-2">
                <span className="text-sky-500/60"><RiFileTextLine size={15} /></span> Bio
              </label>
              {editing ? (
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell investors about yourself and your project..." rows={4}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none focus:border-sky-500/40 transition-colors resize-none"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              ) : (
                <p className="text-sm text-slate-300 py-2.5 px-3.5 leading-relaxed">
                  {profile?.bio || <span className="text-slate-600">Not set</span>}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-widest mb-2">
                <span className="text-sky-500/60"><RiMailLine size={15} /></span> Email
              </label>
              <p className="text-sm text-slate-500 py-2.5 px-3.5 rounded-xl border border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.01)" }}>
                {profile?.email} <span className="ml-2 text-[11px] text-slate-700">(read-only)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"
import InterestForm from "./InterestForm"
import { RiArrowRightLine, RiExternalLinkLine } from "react-icons/ri"

// Public per-project page. Renders server-side so social platforms
// (Twitter, LinkedIn, Telegram, Farcaster) get a real preview when
// the founder shares the URL — that's the whole point of this route
// existing separately from /investor/discover. The discover listing is
// for browse-mode VCs; this page is for "DM the link to one specific
// VC" mode.
//
// SSR also means the page renders without JavaScript — important for
// link previews that scrape with simple HTTP fetchers, and for old
// Telegram clients that don't run JS.
//
// Auth: none. Anyone with the URL can view + tap Express Interest.
// The interest insert goes through /api/interests which is rate-limited
// per IP, so spamming the form gets capped automatically.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fundflow-omega.vercel.app"

type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  stage: string | null
  chain: string | null
  tags: string[] | null
  goal: number | null
  raised: number | null
  published: boolean
  created_at: string
  profiles: { name: string | null; company: string | null } | null
}

const STAGE_COLOR: Record<string, string> = {
  "pre-seed": "#a78bfa",
  "seed":     "#38bdf8",
  "series-a": "#fbbf24",
  "series-b": "#f87171",
  "web3":     "#34d399",
}

const STAGE_LABEL: Record<string, string> = {
  "pre-seed": "Pre-Seed",
  "seed":     "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  "web3":     "Web3 / Token",
}

function formatAmount(n: number | null): string {
  if (!n || n <= 0) return "$0"
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

// Server-side fetch. Uses the service-role key because (a) we want to
// dodge RLS — the page is intentionally public — and (b) this runs on
// the server, never reaches the client bundle. The PUBLIC_COLUMNS
// allowlist keeps it honest: if `projects` ever grows internal columns
// we don't want them leaked here.
const PUBLIC_COLUMNS = "id, user_id, name, description, stage, chain, tags, goal, raised, published, created_at"
async function fetchProject(id: string): Promise<Project | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data } = await supabase
    .from("projects")
    .select(`${PUBLIC_COLUMNS}, profiles(name, company)`)
    .eq("id", id)
    .eq("published", true)
    .maybeSingle<Project>()
  return data
}

// Dynamic OG / Twitter metadata. The hero text social platforms show
// when the URL is pasted into a chat. Matters more than the page itself
// for distribution — most viewers see the preview, not the page.
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params
  const project = await fetchProject(id)
  if (!project) {
    return { title: "Project not found · FundFlow" }
  }
  const founder = project.profiles?.name || project.profiles?.company
  const stageBit = project.stage ? STAGE_LABEL[project.stage] || project.stage : "raising"
  const desc = project.description?.slice(0, 200) ||
    `${project.name} is ${stageBit}${founder ? ` — by ${founder}` : ""}.`

  return {
    title: `${project.name} — ${stageBit} on FundFlow`,
    description: desc,
    openGraph: {
      title: `${project.name}`,
      description: desc,
      type: "website",
      url: `${SITE_URL}/p/${project.id}`,
      siteName: "FundFlow",
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: desc,
    },
  }
}

export default async function PublicProjectPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const project = await fetchProject(id)
  if (!project) notFound()

  const stageColor = project.stage ? STAGE_COLOR[project.stage] || "#94a3b8" : "#94a3b8"
  const stageLabel = project.stage ? STAGE_LABEL[project.stage] || project.stage : null
  const founder = project.profiles?.name || project.profiles?.company || "Anonymous founder"
  const goal = project.goal || 0
  const raised = project.raised || 0
  const progressPct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0

  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNav />

      <div className="max-w-[1180px] mx-auto px-6 md:px-10">

        {/* ── Top strip with stage + raised label ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Deal flow</span>
            {stageLabel && (
              <>
                <span style={{ color: "#475569" }}>·</span>
                <span style={{ color: stageColor }}>{stageLabel}</span>
              </>
            )}
            <span style={{ color: "#475569" }}>·</span>
            <span>Raising {formatAmount(goal)}</span>
          </div>
          <Link href="/investor/discover"
            className="mono no-underline flex items-center gap-1.5"
            style={{
              fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
            }}>
            More projects <RiArrowRightLine size={11} />
          </Link>
        </div>

        {/* ── Hero ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 pt-10 md:pt-14 pb-10 md:pb-14">
          <div className="md:col-span-7">
            <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              by {founder}
            </p>
            <h1 className="serif text-white" style={{
              fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
            }}>
              {project.name}
            </h1>
            {project.description && (
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#94a3b8", marginTop: 24, maxWidth: 580 }}>
                {project.description}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-7">
                {project.tags.map(tag => (
                  <span key={tag} className="mono"
                    style={{
                      fontSize: 10, color: "#cbd5e1",
                      letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500,
                      padding: "4px 10px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 2,
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right rail — facts table */}
          <div className="md:col-span-5">
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "24px 24px 28px" }}>
              <div className="mono mb-5" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                The round
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <div className="mono mb-1" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Target
                  </div>
                  <div className="serif text-white" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {formatAmount(goal)}
                  </div>
                </div>
                <div>
                  <div className="mono mb-1" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Raised
                  </div>
                  <div className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1, color: "#34d399" }}>
                    {formatAmount(raised)}
                  </div>
                </div>
                {project.chain && (
                  <div>
                    <div className="mono mb-1" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Chain
                    </div>
                    <div className="mono" style={{ fontSize: 14, color: "#e5e7eb", letterSpacing: "0.04em" }}>
                      {project.chain.toUpperCase()}
                    </div>
                  </div>
                )}
                {stageLabel && (
                  <div>
                    <div className="mono mb-1" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Stage
                    </div>
                    <div className="mono" style={{ fontSize: 14, color: stageColor, letterSpacing: "0.04em" }}>
                      {stageLabel}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar — only when goal is set */}
              {goal > 0 && (
                <div className="mt-7">
                  <div className="mono flex items-center justify-between mb-2" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <span>Progress</span>
                    <span style={{ color: "#cbd5e1" }}>{progressPct.toFixed(0)}%</span>
                  </div>
                  <div style={{
                    height: 4, background: "rgba(255,255,255,0.06)",
                    borderRadius: 0,
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${progressPct}%`,
                      background: progressPct >= 100 ? "#34d399" : "#10b981",
                      transition: "width 0.4s ease-out",
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Express Interest panel ── */}
        <section className="pb-16 md:pb-20">
          <div style={{
            borderTop: "2px solid #10b981",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(16,185,129,0.025)",
            padding: "32px 28px",
          }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-5">
                <p className="mono mb-3" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Express interest
                </p>
                <h2 className="serif text-white" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                  Want to talk to {founder.split(" ")[0] || "the founder"}?
                </h2>
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 14, lineHeight: 1.6 }}>
                  Drop your email — they get a realtime ping with your name and a link to reply.
                  No account needed. Anonymous works too.
                </p>
              </div>
              <div className="md:col-span-7">
                <InterestForm projectId={project.id} projectName={project.name} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Share strip ── */}
        <section className="pb-16">
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap py-5"
            style={{
              fontSize: 11, color: "#64748b",
              letterSpacing: "0.08em", textTransform: "uppercase",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
            <span>Share</span>
            <span style={{ color: "#475569" }}>·</span>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${project.name} is raising on FundFlow → ${SITE_URL}/p/${project.id}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="no-underline flex items-center gap-1.5"
              style={{ color: "#94a3b8" }}>
              X / Twitter <RiExternalLinkLine size={10} />
            </a>
            <span style={{ color: "#475569" }}>·</span>
            <a href={`https://warpcast.com/~/compose?text=${encodeURIComponent(`${project.name} is raising → ${SITE_URL}/p/${project.id}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="no-underline flex items-center gap-1.5"
              style={{ color: "#94a3b8" }}>
              Farcaster <RiExternalLinkLine size={10} />
            </a>
            <span style={{ color: "#475569" }}>·</span>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(`${SITE_URL}/p/${project.id}`)}&text=${encodeURIComponent(`${project.name} is raising`)}`}
              target="_blank" rel="noopener noreferrer"
              className="no-underline flex items-center gap-1.5"
              style={{ color: "#94a3b8" }}>
              Telegram <RiExternalLinkLine size={10} />
            </a>
          </div>
        </section>

      </div>

      <PublicFooter />
    </main>
  )
}

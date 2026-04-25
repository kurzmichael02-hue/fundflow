import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { requireUser } from "@/lib/auth"
import { rateLimit } from "@/lib/ratelimit"

// POST /api/investors/{id}/draft-opener
//
// Drafts three cold-outreach email variants for a given investor row,
// grounded in the caller's own project pitch. Each variant has a tone
// (direct / warm / technical), a subject, and a body. The caller picks
// one, copies it, tweaks, sends.
//
// Why this exists: the top of the pipeline is the slowest part of
// fundraising. Staring at a blank text box for ten minutes thinking how
// to not sound like every other founder in a VC's inbox is exactly the
// friction this removes. Gritt.io has this, Foundersuite doesn't, and
// OpenVC doesn't — it's a real differentiator in the Web3 CRM space.
//
// Cost safety:
//   · requireUser — no anonymous calls
//   · rateLimit — 20 per hour per user (one LLM call is ~1-2 cents,
//     an abuser running it 10k/hour would cost $100+)
//   · Prompt caching — the stable product-level system prompt (~2k
//     tokens) is cached. First call from this process pays full price;
//     subsequent calls within the 5-minute TTL pay ~10% for the
//     cached prefix and full price only on the varying per-investor
//     tail. Cache is per-prefix, so all callers benefit.
//
// Env: needs ANTHROPIC_API_KEY on the deployment. Without it the
// endpoint returns a 503 with a clear message so the UI can show a
// sensible error state.

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic | null {
  if (_anthropic) return _anthropic
  if (!process.env.ANTHROPIC_API_KEY) return null
  _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Shape we expect Claude to return. Using Zod + messages.parse() so the
// SDK enforces this on the API side — no brittle regex parsing if the
// model wraps text around the JSON.
const DraftSchema = z.object({
  variants: z
    .array(
      z.object({
        tone: z.enum(["direct", "warm", "technical"]),
        subject: z.string(),
        body: z.string(),
      }),
    )
    .length(3),
})

// Product-level system prompt. Deliberately stable byte-for-byte so the
// prompt cache stays warm across all callers. Anything per-founder or
// per-investor lives in the user message — never here.
const SYSTEM_PROMPT = `You draft cold-outreach emails for founders raising Web3 rounds. You write for human founders reaching out to human investors — not generic SaaS marketing.

You will be given two pieces of context in the user message:
1. FOUNDER CONTEXT: the founder's own project — name, what they build, stage, chain, ask.
2. INVESTOR CONTEXT: the investor being contacted — name, firm, typical check size, any prior interaction notes.

Your job: return exactly three variants of a cold-outreach email, each in a different tone.

Rules for every variant:
- Under 150 words. Investors read these on their phone between meetings.
- First line refers to something specific — their portfolio, a post they wrote, a deal they led, or the warm detail from the notes if present. Never "I hope this finds you well".
- Make the ask explicit: a 15-minute call, feedback on the deck, or a warm intro.
- No marketing buzzwords: "revolutionizing", "seamlessly", "game-changer", "synergies", "leverage", "paradigm shift" — none of these ever.
- No emoji. No exclamation marks.
- Contractions are fine ("we're", "it's"). Write like a real person.
- Do not sign as a fake name. End the body with a simple "— [Founder]" placeholder so the founder fills in their real sign-off.

Three required tones, one per variant:
- "direct": straight to the point. Opens with the concrete reason you're writing. No throat-clearing. Four to six sentences total.
- "warm": acknowledges something specific about the investor's work before the ask. Slightly longer, still under 150 words. Reads like one human to another.
- "technical": leads with a number, metric, or architectural detail that signals the founder knows what they built. Appropriate when the investor is technical or the project is infra / protocol-level.

Subject lines: under 60 characters, lowercase is fine, no clickbait. A direct subject like "Intro — [project] raising seed" usually wins over clever.

Return exactly three variants. Never four, never two. If either context is thin, still return three — mark weak ones so the founder knows where to fill in.`

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Cheap pre-flight to fail loud when the env is missing, before we
  // burn any Supabase query time.
  const client = getAnthropic()
  if (!client) {
    return NextResponse.json(
      {
        error: "Draft feature not configured. Set ANTHROPIC_API_KEY on the deployment.",
        env: "ANTHROPIC_API_KEY",
      },
      { status: 503 },
    )
  }

  // 20/h per user is generous — a founder drafting ten times an hour is
  // deliberate, one drafting a thousand is misusing it.
  const limited = await rateLimit(req, "draft-opener", 20, "1 h")
  if (limited) return limited

  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard
  const { id } = await ctx.params

  const supabase = getClient()

  // Fetch the investor AND the founder's project in parallel. user_id
  // scoping on the investor row keeps a malicious id from leaking a
  // different founder's pipeline; the project is owned by the same user.
  const [investorRes, projectRes, profileRes] = await Promise.all([
    supabase
      .from("investors")
      .select("id, name, company, email, status, deal_size, notes")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("name, description, stage, chain, tags, goal, raised")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("name, company, bio, plan")
      .eq("id", user.id)
      .maybeSingle(),
  ])

  const investor = investorRes.data
  if (!investor) {
    return NextResponse.json({ error: "Investor not found" }, { status: 404 })
  }
  const project = projectRes.data
  const profile = profileRes.data

  // Pro-only feature. Free callers get a 403 with `upgrade: true` so the
  // UI can pop the upgrade modal in-context. We do this AFTER the parallel
  // fetch (one round-trip vs. two sequential), but BEFORE the Anthropic
  // call — Free users never trigger an LLM cost.
  if (profile?.plan !== "pro") {
    return NextResponse.json(
      {
        error: "Draft opener is a Pro feature. Upgrade to unlock.",
        upgrade: true,
      },
      { status: 403 },
    )
  }

  // Build the founder context block. If the founder hasn't published a
  // project yet, fall back to profile fields — thin context, but the
  // model can still draft; the prompt tells it to mark weak variants.
  const founderLines: string[] = []
  if (profile?.name)    founderLines.push(`Founder name: ${profile.name}`)
  if (profile?.company) founderLines.push(`Company: ${profile.company}`)
  if (project?.name)    founderLines.push(`Project: ${project.name}`)
  if (project?.description) founderLines.push(`Pitch: ${project.description}`)
  if (project?.stage)   founderLines.push(`Stage: ${project.stage}`)
  if (project?.chain)   founderLines.push(`Chain: ${project.chain}`)
  if (project?.goal)    founderLines.push(`Raise target: ${project.goal}`)
  if (project?.tags && Array.isArray(project.tags) && project.tags.length > 0) {
    founderLines.push(`Tags: ${project.tags.join(", ")}`)
  }
  if (profile?.bio)     founderLines.push(`Bio: ${profile.bio}`)

  const investorLines: string[] = []
  investorLines.push(`Name: ${investor.name}`)
  if (investor.company)   investorLines.push(`Firm: ${investor.company}`)
  if (investor.email)     investorLines.push(`Email: ${investor.email}`)
  if (investor.deal_size) investorLines.push(`Target check: ${investor.deal_size}`)
  if (investor.status)    investorLines.push(`Current pipeline stage: ${investor.status}`)
  if (investor.notes)     investorLines.push(`Prior notes: ${investor.notes}`)

  const userPrompt = [
    "FOUNDER CONTEXT",
    founderLines.length ? founderLines.join("\n") : "(No project context yet — founder hasn't published their project. Mark all variants as weak and ask them to fill in the pitch.)",
    "",
    "INVESTOR CONTEXT",
    investorLines.join("\n"),
    "",
    "Draft three cold-outreach email variants now.",
  ].join("\n")

  try {
    // Claude call. Sonnet 4.6 for cost/quality — same model Cursor ships
    // for drafting. Adaptive thinking on (recommended for 4.6). Prompt
    // cache marker on the system block so repeat calls pay ~10% for the
    // stable prefix. No temperature / top_p — Anthropic's 4.6 defaults
    // are tuned for this kind of task.
    const response = await client.messages.parse({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Caches system+tools together. 5-minute TTL. Most founders
          // draft several investors in a row, so the second call
          // onwards rides the cache.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        format: zodOutputFormat(DraftSchema),
      },
    })

    if (!response.parsed_output) {
      // Refusal or malformed output — surface it instead of crashing.
      return NextResponse.json(
        { error: "Couldn't generate drafts — try again or tweak the notes." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      variants: response.parsed_output.variants,
      // Expose cache stats to the UI so we can later show "cached" hint
      // and spot silent invalidators in production logs.
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cache_read: response.usage.cache_read_input_tokens ?? 0,
        cache_write: response.usage.cache_creation_input_tokens ?? 0,
      },
    })
  } catch (err) {
    // Claude-API typed errors. Each maps to a sensible HTTP response
    // instead of leaking raw error text to the UI.
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Claude rate-limit hit. Try again in a minute." },
        { status: 429 },
      )
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is invalid. Check your env." },
        { status: 503 },
      )
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error in draft-opener:", err.status, err.message)
      return NextResponse.json(
        { error: `Draft service error (${err.status}).` },
        { status: 502 },
      )
    }
    console.error("Unexpected draft-opener error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draft failed" },
      { status: 500 },
    )
  }
}

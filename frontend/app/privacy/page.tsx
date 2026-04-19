"use client"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"

const SECTIONS: Array<{ num: string; title: string; body: React.ReactNode }> = [
  {
    num: "01",
    title: "Overview",
    body: (
      <p>
        FundFlow (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the FundFlow platform — a Web3 investor
        CRM for startup founders. This policy explains what we collect, why we collect it, and
        how we protect it.
      </p>
    ),
  },
  {
    num: "02",
    title: "What we collect",
    body: (
      <ul className="flex flex-col gap-2.5">
        {[
          "Your name and email address",
          "Investor data you enter into the platform — names, companies, notes, deal sizes",
          "Wallet addresses you connect (MetaMask, WalletConnect, pasted manually)",
          "Usage data: pages visited, features used, rough session shape",
          "Technical data: IP address, browser and device information",
        ].map(i => (
          <li key={i} className="flex items-start gap-3">
            <span className="mono" style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>—</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    num: "03",
    title: "How we use it",
    body: (
      <ul className="flex flex-col gap-2.5">
        {[
          "Provide and improve FundFlow",
          "Authenticate your account and keep it secure",
          "Send transactional emails — confirmation, password reset, new-interest notifications",
          "Analyse aggregate usage patterns to prioritise product work",
          "Meet our legal obligations",
        ].map(i => (
          <li key={i} className="flex items-start gap-3">
            <span className="mono" style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>—</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    num: "04",
    title: "Where it lives",
    body: (
      <p>
        All data is stored on Supabase infrastructure in Frankfurt (EU). Encryption at rest and
        in transit. Row-level security isolates each founder&apos;s pipeline from every other.
        We don&apos;t sell or share your data with third parties for advertising.
      </p>
    ),
  },
  {
    num: "05",
    title: "Third parties",
    body: (
      <ul className="flex flex-col gap-2.5">
        {[
          ["Supabase", "Postgres, Auth, Realtime (EU)"],
          ["Vercel", "Hosting, CDN, serverless functions"],
          ["Resend", "Transactional email delivery"],
          ["Stripe", "Payment and subscription management"],
          ["Sentry", "Error monitoring"],
          ["PostHog EU", "Product analytics"],
        ].map(([name, desc]) => (
          <li key={name} className="flex items-start gap-3">
            <span className="mono" style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>—</span>
            <span><span className="mono" style={{ color: "#e5e7eb" }}>{name}</span> &nbsp;·&nbsp; {desc}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    num: "06",
    title: "Your rights",
    body: (
      <p>
        You can access, correct, or delete your personal data at any time. To exercise those
        rights, email{" "}
        <a href="mailto:hello@fundflow.io" style={{ color: "#10b981", textDecoration: "none" }}>hello@fundflow.io</a>{" "}
        — we respond within five business days.
      </p>
    ),
  },
  {
    num: "07",
    title: "Cookies",
    body: (
      <p>
        FundFlow uses the minimum set of cookies needed for authentication and session
        management. No tracking cookies, no advertising cookies. The cookie banner on first
        visit gives you a choice on analytics.
      </p>
    ),
  },
  {
    num: "08",
    title: "Changes",
    body: (
      <p>
        We update this policy when we meaningfully change how we handle data. Registered users
        get an email when that happens.
      </p>
    ),
  },
  {
    num: "09",
    title: "Contact",
    body: (
      <p>
        Anything privacy-related:{" "}
        <a href="mailto:hello@fundflow.io" style={{ color: "#10b981", textDecoration: "none" }}>hello@fundflow.io</a>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNav />

      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Privacy · Policy
            </span>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Last updated · March 13, 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-16 md:pt-24 pb-12">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Privacy
              </p>
            </div>
            <div className="md:col-span-9">
              <h1 className="serif text-white" style={{
                fontSize: "clamp(44px, 6vw, 80px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                Your data,<br />
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>on your terms.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginTop: 28, maxWidth: 560, fontWeight: 300 }}>
                Plain language, no dark patterns. Here&apos;s what we collect, why we collect it,
                where it lives, and how you get it back if you want it.
              </p>
            </div>
          </div>

          <div className="max-w-[860px] mx-auto pb-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {SECTIONS.map(s => (
              <div key={s.num}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-8 md:py-10"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="md:col-span-2 flex items-baseline gap-3">
                  <span className="serif" style={{ fontSize: 36, color: "rgba(255,255,255,0.12)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 0.9 }}>
                    {s.num}
                  </span>
                </div>
                <div className="md:col-span-10">
                  <h2 className="serif text-white mb-4" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                    {s.title}
                  </h2>
                  <div style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.75 }}>
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

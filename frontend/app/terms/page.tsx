"use client"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"

const SECTIONS: Array<{ num: string; title: string; body: React.ReactNode }> = [
  {
    num: "01",
    title: "The agreement",
    body: (
      <p>
        By creating an account or using FundFlow, you agree to these terms. If you don&apos;t
        agree, don&apos;t use the service — that&apos;s fair for everyone.
      </p>
    ),
  },
  {
    num: "02",
    title: "Accounts",
    body: (
      <ul className="flex flex-col gap-2.5">
        {[
          "You must be at least 18 to create an account",
          "Your credentials are your responsibility — keep them private",
          "One person per account; share access through your organisation, not by sharing logins",
          "We can suspend accounts that abuse the service or other users",
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
    title: "Acceptable use",
    body: (
      <>
        <p className="mb-4">You agree not to:</p>
        <ul className="flex flex-col gap-2.5">
          {[
            "Scrape or reverse-engineer the platform",
            "Upload illegal, misleading, or harmful data about other people",
            "Use FundFlow to send spam or unsolicited pitches to investors in the directory",
            "Attempt to bypass the plan caps, rate limits, or authentication",
          ].map(i => (
            <li key={i} className="flex items-start gap-3">
              <span className="mono" style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>—</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: "04",
    title: "Subscriptions & billing",
    body: (
      <>
        <p className="mb-3">
          Free is free forever, capped at 25 investors. Pro is $99/month, unlimited investors.
        </p>
        <p className="mb-3">
          Payments are processed by Stripe. Billing renews monthly on the day you signed up.
          Cancel any time from the Stripe billing portal — access stays live through the end
          of the period you already paid for.
        </p>
        <p>No refunds for partial months, no hidden charges, no multi-year contracts.</p>
      </>
    ),
  },
  {
    num: "05",
    title: "Your content",
    body: (
      <p>
        You own everything you put into FundFlow — your pipeline, notes, project content, and
        investor data. We get a limited licence to store and display it back to you so the
        product works. Published projects are visible to investors on the deal-flow page; you
        can unpublish at any time.
      </p>
    ),
  },
  {
    num: "06",
    title: "Our content",
    body: (
      <p>
        The FundFlow platform, the curated investor directory, and everything we build is
        ours. You can use it through the product; you can&apos;t copy, resell, or republish it
        without our written permission.
      </p>
    ),
  },
  {
    num: "07",
    title: "Availability",
    body: (
      <p>
        We aim for high uptime but can&apos;t promise zero outages. Scheduled maintenance will
        be announced when meaningful. Outside that, the service is provided &quot;as is&quot; without
        warranties of fitness for any particular purpose.
      </p>
    ),
  },
  {
    num: "08",
    title: "Liability",
    body: (
      <p>
        To the extent allowed by law, our liability is limited to the fees you paid us in
        the 12 months before any claim. We&apos;re not responsible for lost profits or
        consequential damages.
      </p>
    ),
  },
  {
    num: "09",
    title: "Termination",
    body: (
      <p>
        You can delete your account at any time. We can close accounts that violate these
        terms, with notice where reasonable. Upon closure, your data is deleted within 30
        days unless we&apos;re required by law to keep it longer.
      </p>
    ),
  },
  {
    num: "10",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of Germany. Disputes go to the competent courts
        in Berlin, unless consumer protection law says otherwise in your jurisdiction.
      </p>
    ),
  },
  {
    num: "11",
    title: "Changes",
    body: (
      <p>
        We may update these terms. Material changes are announced by email to registered
        users. Continued use after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    num: "12",
    title: "Contact",
    body: (
      <p>
        Anything contract-related:{" "}
        <a href="mailto:hello@fundflow.io" style={{ color: "#10b981", textDecoration: "none" }}>hello@fundflow.io</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNav />

      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Terms · of service
            </span>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Last updated · March 13, 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-16 md:pt-24 pb-12">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Terms
              </p>
            </div>
            <div className="md:col-span-9">
              <h1 className="serif text-white" style={{
                fontSize: "clamp(44px, 6vw, 80px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                The ground<br />
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>rules.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginTop: 28, maxWidth: 560, fontWeight: 300 }}>
                Twelve short sections. No lawyer-speak where plain language works. If anything
                here sounds ambiguous, email us — we&apos;d rather clarify than litigate.
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

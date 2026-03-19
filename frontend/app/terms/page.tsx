"use client"
import Link from "next/link"
import { RiArrowLeftLine } from "react-icons/ri"

export default function TermsPage() {
  return (
    <main className="bg-[#050508] min-h-screen text-slate-200">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors no-underline mb-10">
          <RiArrowLeftLine size={15} /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
          <span className="text-[15px] font-bold text-white">FundFlow</span>
        </div>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-600 mb-10">Last updated: March 13, 2026</p>

        <div className="flex flex-col gap-10 text-[15px] text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account or using FundFlow, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Description of Service</h2>
            <p>FundFlow is a Web3 investor CRM platform that allows founders to track investor relationships, manage deal pipelines, and connect with the investor community. Features include investor tracking, pipeline management, analytics, and an investor discovery network.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Account Registration</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use FundFlow.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="flex flex-col gap-2 pl-4">
              {[
                "Use FundFlow for any unlawful purpose",
                "Upload false, misleading, or fraudulent investor data",
                "Attempt to gain unauthorized access to other users' accounts",
                "Scrape, copy, or redistribute platform data without permission",
                "Use the platform to spam or harass investors or founders",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Subscription & Billing</h2>
            <p>FundFlow offers a free Starter plan and a paid Pro plan. Paid subscriptions are billed monthly. You may cancel at any time. Refunds are handled on a case-by-case basis. Pricing may change with 30 days notice to existing subscribers.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Intellectual Property</h2>
            <p>All content, design, and code on the FundFlow platform is the intellectual property of FundFlow. You retain ownership of the data you enter into the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Disclaimer of Warranties</h2>
            <p>FundFlow is provided "as is" without warranty of any kind. We do not guarantee that the platform will be error-free or uninterrupted. FundFlow does not provide financial or investment advice.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, FundFlow shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of Germany. Any disputes shall be resolved in the courts of Frankfurt am Main.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. Contact</h2>
            <p>For any questions about these terms, contact us at <a href="mailto:hello@fundflow.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">hello@fundflow.io</a>.</p>
          </section>

        </div>
      </div>
    </main>
  )
}

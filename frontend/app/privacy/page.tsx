"use client"
import Link from "next/link"
import { RiArrowLeftLine } from "react-icons/ri"

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-white mt-6 mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-600 mb-10">Last updated: March 13, 2026</p>

        <div className="flex flex-col gap-10 text-[15px] text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Overview</h2>
            <p>FundFlow ("we", "us", "our") operates the FundFlow platform, a Web3 investor CRM for startup founders. This Privacy Policy explains how we collect, use, and protect your personal data when you use our services.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Data We Collect</h2>
            <p className="mb-3">When you create an account or use FundFlow, we may collect:</p>
            <ul className="flex flex-col gap-2 pl-4">
              {["Your name and email address", "Investor data you enter into the platform (names, companies, notes, deal sizes)", "Wallet addresses you connect (MetaMask, WalletConnect)", "Usage data such as pages visited and features used", "Technical data such as IP address, browser type, and device information"].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. How We Use Your Data</h2>
            <p className="mb-3">We use your data to:</p>
            <ul className="flex flex-col gap-2 pl-4">
              {["Provide and improve the FundFlow platform", "Authenticate your account and keep it secure", "Send transactional emails (e.g. email confirmation, password reset)", "Analyze usage patterns to improve product features", "Comply with legal obligations"].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored securely on Supabase infrastructure hosted in the EU (Frankfurt). We use industry-standard encryption at rest and in transit. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="flex flex-col gap-2 pl-4">
              {["Supabase — database and authentication", "Vercel — hosting and deployment", "Resend — transactional email delivery", "Stripe — payment processing (when applicable)"].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:hello@fundflow.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">hello@fundflow.io</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Cookies</h2>
            <p>FundFlow uses minimal cookies necessary for authentication and session management. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Contact</h2>
            <p>For any privacy-related questions, contact us at <a href="mailto:hello@fundflow.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">hello@fundflow.io</a>.</p>
          </section>

        </div>
      </div>
    </main>
  )
}

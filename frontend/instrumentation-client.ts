import posthog from "posthog-js"

// PostHog initialises here on every page load, but we keep it opted out by
// default so we don't capture anything before the user has accepted the
// cookie banner. CookieBanner flips opt_in / opt_out based on the choice.
//
// Sentry runs unconditionally — error tracking is a legitimate interest
// under GDPR (service operation, security) and only sends technical error
// data, not behaviour.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    // Opt out by default. Capturing only kicks in when CookieBanner
    // calls posthog.opt_in_capturing() after explicit accept.
    opt_out_capturing_by_default: true,
    persistence: "memory",
  })

  // Re-apply the previous choice on every page load so a returning user
  // doesn't see the banner again and get tracked from a clean slate.
  if (typeof window !== "undefined") {
    const consent = localStorage.getItem("cookie_consent")
    if (consent === "accepted") {
      posthog.opt_in_capturing()
      // Persist across page loads now that we have permission.
      posthog.set_config({ persistence: "localStorage+cookie" })
    } else if (consent === "declined") {
      posthog.opt_out_capturing()
    }
  }
}

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://7e8eb5acf17acadd1e88611ad3605933@o4511049263415296.ingest.de.sentry.io/4511049268789328",
  tracesSampleRate: 1.0,
  debug: false,
})
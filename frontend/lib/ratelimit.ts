import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting for public + sensitive endpoints.
//
// Backed by Upstash Redis. The env vars are UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN — grab them from console.upstash.com after
// creating a free Redis database.
//
// If those env vars aren't set we fall back to a permissive "no-op" limiter
// so local dev and preview builds don't fail. Production should always have
// them configured; `UPSTASH_REQUIRED=true` on Vercel makes a missing env var
// fail the request instead of silently letting it through.
//
// Each bucket is keyed by the caller's IP (from x-forwarded-for on Vercel)
// with a route-specific prefix so /api/auth/login and /api/contact don't
// share the same quota.
// ─────────────────────────────────────────────────────────────────────────────

const HAS_UPSTASH = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const STRICT = process.env.UPSTASH_REQUIRED === "true"

let _redis: Redis | null = null
function getRedis(): Redis | null {
  if (!HAS_UPSTASH) return null
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

// One limiter per prefix — cached so we don't rebuild the object on every request.
const limiters = new Map<string, Ratelimit>()
function getLimiter(prefix: string, max: number, window: `${number} ${"s" | "m" | "h" | "d"}`): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  const key = `${prefix}|${max}|${window}`
  let limiter = limiters.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: `fundflow:${prefix}`,
      analytics: false,
    })
    limiters.set(key, limiter)
  }
  return limiter
}

function extractIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; behind other proxies, x-real-ip is common.
  // Strip the first entry — the rest are proxy hops.
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

/**
 * Check the rate limit for this route + caller. Returns `null` if the
 * request may proceed, or a 429 response the route should return as-is.
 *
 * @param req the incoming request
 * @param prefix a short tag used as part of the Redis key ("login", "contact")
 * @param max how many requests per window
 * @param window duration string (e.g. "1 m", "1 h")
 * @param extraKey optional extra component (e.g. normalised email) so an
 *   attacker can't rotate IPs to brute a single account
 */
export async function rateLimit(
  req: NextRequest,
  prefix: string,
  max: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  extraKey?: string,
): Promise<NextResponse | null> {
  if (!HAS_UPSTASH) {
    if (STRICT) {
      return NextResponse.json(
        { error: "Rate limiting unavailable" },
        { status: 503 },
      )
    }
    return null
  }

  const limiter = getLimiter(prefix, max, window)
  if (!limiter) return null

  const ip = extractIp(req)
  const key = extraKey ? `${ip}:${extraKey}` : ip
  const result = await limiter.limit(key)

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    return NextResponse.json(
      {
        error: "Too many requests. Slow down and try again shortly.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      },
    )
  }

  return null
}

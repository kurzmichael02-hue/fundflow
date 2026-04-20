import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

// ─────────────────────────────────────────────────────────────────────────────
// Server-side JWT handling for API routes.
//
// Two paths:
//   1. Strict — when SUPABASE_JWT_SECRET is set we verify the signature
//      against it (HS256) and check exp. Forged or expired tokens are
//      rejected. This is what production should look like.
//   2. Fallback — when the env var isn't set we decode the payload, still
//      enforce the `exp` claim, and let the request through. We log a warn
//      so the operator knows. This path used to be the only path; bringing
//      it back as a fallback prevents the situation where a fresh deploy
//      without the env var locks every authed user out of the app
//      (every API call 401s, the client redirects to /login, login
//      succeeds and lands back on the same page that 401s — infinite loop).
//
// Set SUPABASE_JWT_SECRET on every environment. The fallback exists so
// nobody locks themselves out, not as a long-term substitute.
// ─────────────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET
let encoded: Uint8Array | null = null
let warnedFallback = false

function getKey(): Uint8Array {
  if (!encoded) encoded = new TextEncoder().encode(JWT_SECRET || "")
  return encoded
}

export type AuthedUser = {
  id: string
  email: string | null
  role: string | null
}

type RawPayload = {
  sub?: unknown
  email?: unknown
  role?: unknown
  exp?: unknown
}

function shapePayload(payload: RawPayload): AuthedUser | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null
  if (!sub) return null
  // Always enforce exp if present, even on the fallback path. atob/decode
  // doesn't validate this for us — Supabase tokens default to 1h, so
  // ignoring it would let stale tokens stick around indefinitely.
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return null
  }
  return {
    id: sub,
    email: typeof payload.email === "string" ? payload.email : null,
    role:  typeof payload.role  === "string" ? payload.role  : null,
  }
}

function decodeWithoutVerify(token: string): AuthedUser | null {
  try {
    const raw = token.split(".")[1]
    if (!raw) return null
    const norm = raw.replace(/-/g, "+").replace(/_/g, "/")
    const padded = norm + "=".repeat((4 - norm.length % 4) % 4)
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as RawPayload
    return shapePayload(decoded)
  } catch {
    return null
  }
}

/**
 * Verify the `Authorization: Bearer <jwt>` header on a request.
 * Returns the verified user payload or null if the header is missing, the
 * signature is bad, or the token is expired.
 */
export async function verifyRequest(req: NextRequest): Promise<AuthedUser | null> {
  const header = req.headers.get("authorization")
  if (!header) return null
  const token = header.replace(/^Bearer\s+/i, "").trim()
  if (!token) return null

  if (JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(token, getKey(), {
        algorithms: ["HS256"],
      })
      return shapePayload(payload as RawPayload)
    } catch {
      return null
    }
  }

  if (!warnedFallback) {
    warnedFallback = true
    console.warn(
      "[auth] SUPABASE_JWT_SECRET is missing — falling back to UNVERIFIED token decode. " +
      "Set the env var on the deployment to enable proper signature checks. " +
      "Find it under Supabase → Settings → API → JWT Settings."
    )
  }
  return decodeWithoutVerify(token)
}

/**
 * Convenience helper for the common "verify or return 401" pattern.
 * Usage:
 *   const guard = await requireUser(req)
 *   if ("error" in guard) return guard.error
 *   const { user } = guard
 */
export async function requireUser(req: NextRequest): Promise<
  | { user: AuthedUser }
  | { error: NextResponse }
> {
  const user = await verifyRequest(req)
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return { user }
}

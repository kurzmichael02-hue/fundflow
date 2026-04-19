import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

// ─────────────────────────────────────────────────────────────────────────────
// Server-side JWT verification for API routes.
//
// What used to happen: every API route called `getUserIdFromToken()` which
// base64-decoded the JWT payload and trusted `decoded.sub` without verifying
// the signature. That means anyone could forge a token with any user id in
// the `sub` field and every API route would happily treat it as that user —
// because the routes use the service-role Supabase key, RLS doesn't save us
// either. This was the worst open security issue in the codebase.
//
// What happens now: every authed route calls `requireUser(req)` which
// verifies the JWT signature against SUPABASE_JWT_SECRET (HS256, the secret
// from Supabase Dashboard → Settings → API → JWT Settings), checks exp/iat,
// and only returns a user id when the token really came from our Supabase
// project. Otherwise it returns a 401 response the route should just return
// as-is.
//
// The secret must be set. Refusing to run without it is intentional —
// silently falling back to decoded-only would reintroduce the same hole.
// ─────────────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET
let encoded: Uint8Array | null = null

function getKey(): Uint8Array {
  if (!JWT_SECRET) {
    throw new Error(
      "SUPABASE_JWT_SECRET is missing. Grab it from Supabase → Settings → API → JWT Settings and set it on every environment where API routes run."
    )
  }
  if (!encoded) encoded = new TextEncoder().encode(JWT_SECRET)
  return encoded
}

export type AuthedUser = {
  id: string
  email: string | null
  role: string | null
}

/**
 * Verify the `Authorization: Bearer <jwt>` header on a request.
 * Returns the verified user payload or null if the header is missing, the
 * signature is bad, or the token is expired/not-yet-valid.
 */
export async function verifyRequest(req: NextRequest): Promise<AuthedUser | null> {
  const header = req.headers.get("authorization")
  if (!header) return null
  const token = header.replace(/^Bearer\s+/i, "").trim()
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      // Supabase JWTs have `iss: https://<project>.supabase.co/auth/v1` — we
      // don't pin it here because it depends on the project ref, which is
      // already implicitly bound by the shared secret.
    })
    const sub = typeof payload.sub === "string" ? payload.sub : null
    if (!sub) return null
    return {
      id: sub,
      email: typeof payload.email === "string" ? payload.email : null,
      role:  typeof payload.role  === "string" ? payload.role  : null,
    }
  } catch {
    return null
  }
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

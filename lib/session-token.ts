/** Edge-safe session token helpers (used by middleware and route handlers). */
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'pc_session'
export const CSRF_COOKIE = 'pc_csrf'

export type SessionPayload = {
  userId: string
  email: string
  role: string
  name: string
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET || 'dev-only-secret-change-before-deploy-0123456789abcdef'
  return new TextEncoder().encode(value)
}

export async function signSession(payload: SessionPayload, maxAgeSeconds = 60 * 60 * 24 * 14): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('praticchabi')
    .setAudience('praticchabi-web')
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret())
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: 'praticchabi',
      audience: 'praticchabi-web',
    })
    if (!payload.userId || !payload.email) return null
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: String(payload.role || 'READER'),
      name: String(payload.name || ''),
    }
  } catch {
    return null
  }
}

export const SESSION_MAX_AGE = 60 * 60 * 24 * 14

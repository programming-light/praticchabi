import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { CSRF_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from './session-token'

export { SESSION_COOKIE, CSRF_COOKIE, SessionPayload }

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function setSessionCookie(payload: SessionPayload) {
  const store = await cookies()
  const token = await signSession(payload)
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  const csrf = crypto.randomUUID()
  store.set(CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  store.delete(CSRF_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

export async function currentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, bio: true, createdAt: true },
  })
}

export function isEditor(role?: string | null) {
  return role === 'ADMIN' || role === 'EDITOR'
}

export async function requireUser(redirectTo = '/login') {
  const user = await currentUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireEditor() {
  const user = await currentUser()
  if (!user || !isEditor(user.role)) redirect('/login?next=/admin')
  return user
}

export async function requireAdmin() {
  const user = await currentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login?next=/admin')
  return user
}

/** Route-handler guard. Returns null when allowed, otherwise a JSON error response. */
export async function apiGuard(roles?: string[]) {
  const session = await getSession()
  if (!session) return Response.json({ ok: false, code: 'err_unauthorized' }, { status: 401 })
  if (roles && !roles.includes(session.role)) {
    return Response.json({ ok: false, code: 'err_unauthorized' }, { status: 403 })
  }
  return null
}

export async function validCsrf(request: Request): Promise<boolean> {
  const store = await cookies()
  const cookieToken = store.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get('x-csrf-token')
  return Boolean(cookieToken && headerToken && cookieToken === headerToken)
}

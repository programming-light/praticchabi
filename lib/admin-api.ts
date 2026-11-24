import { apiGuard, validCsrf } from './auth'

/** Guard for all state-changing admin API routes. */
export async function adminGuard(request: Request, roles: string[] = ['ADMIN', 'EDITOR']) {
  const denied = await apiGuard(roles)
  if (denied) return denied
  if (!(await validCsrf(request))) {
    return Response.json({ ok: false, code: 'err_nonce', message: 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে।' }, { status: 403 })
  }
  return null
}

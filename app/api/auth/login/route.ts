import { prisma } from '@/lib/db'
import { isEditor, setSessionCookie, verifyPassword } from '@/lib/auth'
import { emailValid, fail, honeypotPassed, ok, text } from '@/lib/api'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`login:${requestIp(request)}`, 15))) return fail('err_rate')

  const email = text(form, 'email').toLowerCase()
  const password = text(form, 'password')
  const rawNext = text(form, 'next')

  if (!email || !password) return fail('err_required')
  if (!emailValid(email)) return fail('err_email')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) return fail('err_login')

  await setSessionCookie({ userId: user.id, email: user.email, role: user.role, name: user.name })

  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : ''
  return ok({ redirect: isEditor(user.role) && !safeNext ? '/admin' : safeNext || '/account' })
}

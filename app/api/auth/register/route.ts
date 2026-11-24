import { prisma } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { checked, emailValid, fail, honeypotPassed, ok, text } from '@/lib/api'
import { MESSAGES } from '@/lib/config'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`register:${requestIp(request)}`, 5))) return fail('err_rate')

  const name = text(form, 'name')
  const email = text(form, 'email').toLowerCase()
  const password = text(form, 'password')

  if (!name || !email || !password) return fail('err_required')
  if (!emailValid(email)) return fail('err_email')
  if (password.length < 8) return fail('err_password')
  if (!checked(form, 'terms')) return fail('err_terms')

  if (await prisma.user.findUnique({ where: { email } })) return fail('err_exists')

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: 'READER' },
    })
    await setSessionCookie({ userId: user.id, email: user.email, role: user.role, name: user.name })
    return ok({ message: MESSAGES.reg_ok.text, redirect: '/account?pcp=reg_ok' })
  } catch (error) {
    console.error(error)
    return fail('err_unknown')
  }
}

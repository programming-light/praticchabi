import { prisma } from '@/lib/db'
import { emailValid, fail, honeypotPassed, ok, text } from '@/lib/api'
import { MESSAGES } from '@/lib/config'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`subscribe:${requestIp(request)}`, 8))) return fail('err_rate')

  const email = text(form, 'email').toLowerCase()
  if (!emailValid(email)) return fail('err_email')

  const existing = await prisma.subscriber.findUnique({ where: { email } })
  if (existing) return ok({ message: MESSAGES.sub_dup.text })

  await prisma.subscriber.create({ data: { email } })
  return ok({ message: MESSAGES.sub_ok.text })
}

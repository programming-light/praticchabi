import { prisma } from '@/lib/db'
import { emailValid, fail, honeypotPassed, ok, text } from '@/lib/api'
import { mailContact } from '@/lib/mail'
import { settings } from '@/lib/settings'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`contact:${requestIp(request)}`, 5))) return fail('err_rate')

  const name = text(form, 'name')
  const email = text(form, 'email').toLowerCase()
  const subject = text(form, 'subject') || `বার্তা: ${name}`
  const body = text(form, 'body')

  if (!name || !email || !body) return fail('err_required')
  if (!emailValid(email)) return fail('err_email')

  await prisma.message.create({ data: { name, email, subject, body } })
  const config = await settings()
  await mailContact({ to: config.notify_email, name, email, subject, body })

  return ok({ message: 'আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!' })
}

import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/db'
import { emailValid, fail, honeypotPassed, ok, text } from '@/lib/api'
import { mailPasswordReset } from '@/lib/mail'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`forgot:${requestIp(request)}`, 5))) return fail('err_rate')

  const email = text(form, 'email').toLowerCase()
  if (!emailValid(email)) return fail('err_email')

  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const token = randomBytes(24).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpires: new Date(Date.now() + 60 * 60 * 1000) },
    })
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    await mailPasswordReset(user.email, user.name, url)
  }
  return ok({ message: 'যদি এই ইমেইলে অ্যাকাউন্ট থাকে, একটি রিসেট লিংক পাঠানো হয়েছে।' })
}

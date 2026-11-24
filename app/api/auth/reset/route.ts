import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { fail, ok, text } from '@/lib/api'

export async function POST(request: Request) {
  const form = await request.formData()
  const token = text(form, 'token')
  const password = text(form, 'password')
  if (!token) return fail('err_token')
  if (password.length < 8) return fail('err_password')

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  })
  if (!user) return fail('err_token')

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), resetToken: null, resetExpires: null },
  })
  return ok({ message: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে। এখন লগইন করুন।' })
}

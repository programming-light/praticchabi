import { adminGuard } from '@/lib/admin-api'
import { fail, ok, text } from '@/lib/api'
import { prisma } from '@/lib/db'
import { emailValid } from '@/lib/api'

const KEYS = [
  'notify_email', 'max_mb', 'min_words', 'max_words',
  'contact_email', 'whatsapp', 'whatsapp_label', 'facebook', 'address', 'about_text',
]

export async function POST(request: Request) {
  const guard = await adminGuard(request, ['ADMIN'])
  if (guard) return guard
  const form = await request.formData()
  const notifyEmail = text(form, 'notify_email')
  const contactEmail = text(form, 'contact_email')
  if (notifyEmail && !emailValid(notifyEmail)) return fail('err_email')
  if (contactEmail && !emailValid(contactEmail)) return fail('err_email')

  for (const key of KEYS) {
    const value = text(form, key)
    if (key === 'max_mb') {
      const number = Math.min(50, Math.max(1, Number(value) || 5))
      await prisma.setting.upsert({ where: { key }, create: { key, value: String(number) }, update: { value: String(number) } })
    } else {
      await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    }
  }
  return ok({ message: 'সেটিংস সংরক্ষণ করা হয়েছে।' })
}

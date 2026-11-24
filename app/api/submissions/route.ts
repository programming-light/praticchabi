import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { checked, emailValid, fail, fileFrom, honeypotPassed, ok, text } from '@/lib/api'
import { analyzeDocx } from '@/lib/docx'
import { putFile } from '@/lib/storage'
import { mailNewSubmission, mailSubmissionReceived } from '@/lib/mail'
import { maxUploadBytes, settings } from '@/lib/settings'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`submit:${requestIp(request)}`, 5))) return fail('err_rate')

  const name = text(form, 'name')
  const email = text(form, 'email').toLowerCase()
  const phone = text(form, 'phone')
  const categoryId = text(form, 'categoryId')
  const title = text(form, 'title')
  const note = text(form, 'note')

  if (!name || !email || !categoryId || !title) return fail('err_required')
  if (!emailValid(email)) return fail('err_email')
  if (!checked(form, 'agree')) return fail('err_agree')

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) return fail('err_required')

  const file = fileFrom(form, 'file')
  if (!file || !file.name.toLowerCase().endsWith('.docx')) return fail('err_file')
  const maxBytes = await maxUploadBytes()
  if (file.size === 0 || file.size > maxBytes) return fail('err_file')

  const buffer = new Uint8Array(await file.arrayBuffer())
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) return fail('err_file')

  try {
    let words = 0
    try {
      words = (await analyzeDocx(buffer)).words
    } catch (error) {
      console.error('[docx] could not read word count', error)
    }

    const key = await putFile(
      `submissions/${randomUUID()}.docx`,
      buffer,
      file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      { access: 'private' },
    )
    const session = await getSession()
    const config = await settings()

    const submission = await prisma.submission.create({
      data: {
        title, name, email, phone: phone || null, note: note || null,
        categoryId: category.id, fileKey: key, originalName: file.name.slice(0, 200),
        words, status: 'NEW', userId: session?.userId || null,
      },
    })

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/submissions/${submission.id}`
    await mailNewSubmission({ to: config.notify_email, title, name, email, phone, category: category.name, words, adminUrl })
    await mailSubmissionReceived(email, title)

    return ok({ message: 'আপনার লেখা জমা হয়েছে। ধন্যবাদ!' })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { checked, fail, ok, text } from '@/lib/api'
import { STATUS_LABELS } from '@/lib/config'
import { deleteFile } from '@/lib/storage'
import { mailStatus } from '@/lib/mail'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params

  const form = await request.formData()
  const status = text(form, 'status')
  const editorNote = text(form, 'editorNote')
  const emailAuthor = checked(form, 'emailAuthor')

  if (!STATUS_LABELS[status]) return fail('err_required')

  const submission = await prisma.submission.findUnique({ where: { id } })
  if (!submission) return fail('err_unknown', 404)

  const updated = await prisma.submission.update({
    where: { id },
    data: { status, editorNote: editorNote || null },
  })

  if (emailAuthor && updated.status !== submission.status) {
    await mailStatus(updated.email, updated.title, STATUS_LABELS[updated.status], updated.editorNote)
  }
  return ok({ message: 'সংরক্ষণ করা হয়েছে।' })
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const submission = await prisma.submission.findUnique({ where: { id } })
  if (!submission) return fail('err_unknown', 404)

  await deleteFile(submission.fileKey)
  await prisma.submission.delete({ where: { id } })
  return ok({ message: 'লেখা জমা মুছে ফেলা হয়েছে।' })
}

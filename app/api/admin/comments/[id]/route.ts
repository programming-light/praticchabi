import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { checked, ok } from '@/lib/api'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const form = await request.formData()
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return ok({})
  await prisma.comment.update({ where: { id }, data: { approved: checked(form, 'approved') } })
  return ok({ message: 'মন্তব্য হালনাগাদ হয়েছে।' })
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  await prisma.comment.delete({ where: { id } })
  return ok({ message: 'মন্তব্য মুছে ফেলা হয়েছে।' })
}

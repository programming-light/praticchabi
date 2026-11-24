import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { ok } from '@/lib/api'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  await prisma.message.update({ where: { id }, data: { isRead: true } })
  return ok({})
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  await prisma.message.delete({ where: { id } })
  return ok({ message: 'বার্তা মুছে ফেলা হয়েছে।' })
}

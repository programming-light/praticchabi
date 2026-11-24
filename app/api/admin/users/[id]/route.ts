import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, text } from '@/lib/api'

const ROLES = ['READER', 'AUTHOR', 'EDITOR', 'ADMIN']

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(request, ['ADMIN'])
  if (guard) return guard
  const { id } = await params
  const form = await request.formData()
  const role = text(form, 'role')
  if (!ROLES.includes(role)) return fail('err_required')

  await prisma.user.update({ where: { id }, data: { role } })
  return ok({ message: 'ব্যবহারকারীর ভূমিকা হালনাগাদ হয়েছে।' })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(request, ['ADMIN'])
  if (guard) return guard
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return ok({ message: 'ব্যবহারকারী মুছে ফেলা হয়েছে।' })
}

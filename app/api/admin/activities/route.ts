import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, text } from '@/lib/api'
import { uploadImage } from '@/lib/upload-helper'

export async function POST(request: Request) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const form = await request.formData()
  const caption = text(form, 'caption')
  if (!caption) return fail('err_required')

  try {
    const imageUrl = await uploadImage(form, 'image', 'activities')
    const activity = await prisma.activity.create({
      data: { caption, dateLabel: text(form, 'dateLabel') || null, imageUrl },
    })
    return ok({ message: 'ছবি যোগ করা হয়েছে।', id: activity.id })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

export async function DELETE(request: Request) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return fail('err_required')
  const activity = await prisma.activity.findUnique({ where: { id } })
  if (!activity) return fail('err_unknown', 404)
  await prisma.activity.delete({ where: { id } })
  if (activity.imageUrl) {
    const { deleteFile } = await import('@/lib/storage')
    await deleteFile(activity.imageUrl)
  }
  return ok({ message: 'ছবি মুছে ফেলা হয়েছে।' })
}

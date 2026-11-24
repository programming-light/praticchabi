import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, slugify, text } from '@/lib/api'
import { uploadImage } from '@/lib/upload-helper'

export async function POST(request: Request) {
  const guard = await adminGuard(request)
  if (guard) return guard

  const form = await request.formData()
  const title = text(form, 'title')
  if (!title) return fail('err_required')

  let slug = slugify(text(form, 'slug') || title)
  if (await prisma.issue.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`

  try {
    const coverUrl = await uploadImage(form, 'cover', 'issues')
    const issue = await prisma.issue.create({
      data: {
        title, slug,
        period: text(form, 'period') || null,
        price: text(form, 'price') || null,
        orderUrl: text(form, 'orderUrl') || null,
        description: text(form, 'description') || null,
        coverUrl,
      },
    })
    return ok({ message: 'নতুন সংখ্যা যোগ করা হয়েছে।', redirect: '/admin/issues' , id: issue.id })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

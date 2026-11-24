import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { checked, fail, ok, slugify, text } from '@/lib/api'
import { plainTextToHtml, uploadImage } from '@/lib/upload-helper'

export async function POST(request: Request) {
  const guard = await adminGuard(request)
  if (guard) return guard

  const form = await request.formData()
  const title = text(form, 'title')
  const content = text(form, 'content')
  if (!title || !content) return fail('err_required')

  let slug = slugify(text(form, 'slug') || title)
  if (await prisma.post.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`

  const status = text(form, 'status') === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
  const authorId = text(form, 'authorId') || (await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'EDITOR'] } }, select: { id: true } }))?.id
  if (!authorId) return fail('err_required')

  try {
    const coverUrl = await uploadImage(form, 'cover', 'posts')
    const post = await prisma.post.create({
      data: {
        title, slug,
        byline: text(form, 'byline') || null,
        content: plainTextToHtml(content),
        excerpt: text(form, 'excerpt') || null,
        coverUrl,
        authorId,
        categoryId: text(form, 'categoryId') || null,
        issueId: text(form, 'issueId') || null,
        featured: checked(form, 'featured'),
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })
    return ok({ message:status === 'PUBLISHED' ? 'লেখা প্রকাশিত হয়েছে।' : 'খসড়া সংরক্ষিত হয়েছে।', redirect: '/admin/posts', id: post.id })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

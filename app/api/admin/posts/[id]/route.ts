import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { checked, fail, ok, slugify, text } from '@/lib/api'
import { plainTextToHtml, uploadImage } from '@/lib/upload-helper'
import { deleteFile } from '@/lib/storage'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const form = await request.formData()
  const title = text(form, 'title')
  const content = text(form, 'content')
  if (!title || !content) return fail('err_required')

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) return fail('err_unknown', 404)

  let slug = slugify(text(form, 'slug') || title)
  const clash = await prisma.post.findUnique({ where: { slug } })
  if (clash && clash.id !== id) slug = `${slug}-${id.slice(0, 6)}`

  const status = text(form, 'status') === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'

  try {
    const newCover = await uploadImage(form, 'cover', 'posts')
    await prisma.post.update({
      where: { id },
      data: {
        title, slug,
        byline: text(form, 'byline') || null,
        content: plainTextToHtml(content),
        excerpt: text(form, 'excerpt') || null,
        ...(newCover ? { coverUrl: newCover } : {}),
        authorId: text(form, 'authorId') || existing.authorId,
        categoryId: text(form, 'categoryId') || null,
        issueId: text(form, 'issueId') || null,
        featured: checked(form, 'featured'),
        status,
        publishedAt: status === 'PUBLISHED' ? (existing.publishedAt || new Date()) : null,
      },
    })
    if (checked(form, 'removeCover') && existing.coverUrl) {
      await prisma.post.update({ where: { id }, data: { coverUrl: null } })
      await deleteFile(existing.coverUrl)
    }
    return ok({ message: 'লেখা হালনাগাদ হয়েছে।' })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return fail('err_unknown', 404)
  await prisma.post.delete({ where: { id } })
  if (post.coverUrl) await deleteFile(post.coverUrl)
  return ok({ message: 'লেখা মুছে ফেলা হয়েছে।' })
}

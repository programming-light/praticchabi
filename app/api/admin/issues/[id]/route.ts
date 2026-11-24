import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, slugify, text } from '@/lib/api'
import { uploadImage } from '@/lib/upload-helper'
import { deleteFile } from '@/lib/storage'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const form = await request.formData()
  const title = text(form, 'title')
  if (!title) return fail('err_required')

  const existing = await prisma.issue.findUnique({ where: { id } })
  if (!existing) return fail('err_unknown', 404)

  let slug = slugify(text(form, 'slug') || title)
  const clash = await prisma.issue.findUnique({ where: { slug } })
  if (clash && clash.id !== id) slug = `${slug}-${id.slice(0, 6)}`

  try {
    const newCover = await uploadImage(form, 'cover', 'issues')
    const makeCurrent = text(form, 'release') === 'on'

    await prisma.$transaction(async (tx) => {
      if (makeCurrent) await tx.issue.updateMany({ data: { isCurrent: false } })
      await tx.issue.update({
        where: { id },
        data: {
          title, slug,
          period: text(form, 'period') || null,
          price: text(form, 'price') || null,
          orderUrl: text(form, 'orderUrl') || null,
          description: text(form, 'description') || null,
          ...(newCover ? { coverUrl: newCover } : {}),
          ...(makeCurrent ? { isCurrent: true } : {}),
        },
      })
    })

    revalidatePath('/')
    revalidatePath('/issues')
    return ok({ message: makeCurrent ? 'সংখ্যা হালনাগাদ হয়েছে এবং বর্তমান হার্ডকপি হিসেবে প্রকাশিত হয়েছে।' : 'সংখ্যা হালনাগাদ হয়েছে।' })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params
  const issue = await prisma.issue.findUnique({ where: { id } })
  if (!issue) return fail('err_unknown', 404)
  await prisma.post.updateMany({ where: { issueId: id }, data: { issueId: null } })
  await prisma.issue.delete({ where: { id } })
  if (issue.coverUrl) await deleteFile(issue.coverUrl)
  if (issue.isCurrent) {
    const next = await prisma.issue.findFirst({ orderBy: { publishedAt: 'desc' } })
    if (next) await prisma.issue.update({ where: { id: next.id }, data: { isCurrent: true } })
  }
  revalidatePath('/')
  revalidatePath('/issues')
  return ok({ message: 'সংখ্যা মুছে ফেলা হয়েছে।' })
}

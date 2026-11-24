import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, slugify } from '@/lib/api'
import { analyzeDocx } from '@/lib/docx'
import { getFile } from '@/lib/storage'
import { STATUS_LABELS } from '@/lib/config'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard(request)
  if (guard) return guard
  const { id } = await params

  const submission = await prisma.submission.findUnique({ where: { id }, include: { category: true } })
  if (!submission) return fail('err_unknown', 404)
  if (submission.postId) return ok({ message: 'এই লেখার খসড়া আগেই তৈরি করা হয়েছে।', redirect: `/admin/posts/${submission.postId}/edit` })

  const bytes = await getFile(submission.fileKey)
  if (!bytes) return fail('err_file')

  let html = ''
  try {
    html = (await analyzeDocx(bytes)).html
  } catch (error) {
    console.error('[docx]', error)
  }

  const session = await getSession()
  let authorId = session!.userId
  if (submission.userId) {
    const submitter = await prisma.user.findUnique({ where: { id: submission.userId }, select: { role: true } })
    if (submitter && ['AUTHOR', 'EDITOR', 'ADMIN'].includes(submitter.role)) authorId = submission.userId
  }

  const slug = `${slugify(submission.title)}-${submission.id.slice(0, 6)}`
  const post = await prisma.post.create({
    data: {
      slug,
      title: submission.title,
      byline: submission.name,
      content: html || `<p>${submission.note || submission.title}</p>`,
      excerpt: submission.note || null,
      authorId,
      categoryId: submission.categoryId,
      status: 'DRAFT',
      publishedAt: null,
    },
  })
  await prisma.submission.update({
    where: { id },
    data: { postId: post.id, status: submission.status === 'NEW' ? 'ACCEPTED' : submission.status },
  })

  return ok({ message: 'খসড়া পোস্ট তৈরি হয়েছে।', redirect: `/admin/posts/${post.id}/edit` })
}

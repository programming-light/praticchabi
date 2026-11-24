import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { fail, honeypotPassed, ok, text } from '@/lib/api'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return fail('err_unauthorized', 401)

  const form = await request.formData()
  if (!honeypotPassed(form)) return fail('err_unknown')
  if (!(await rateLimit(`comment:${session.userId}`, 20))) return fail('err_rate')

  const postId = text(form, 'postId')
  const body = text(form, 'body')
  if (!postId || body.length < 2) return fail('err_required')

  const post = await prisma.post.findFirst({ where: { id: postId, status: 'PUBLISHED' }, select: { id: true } })
  if (!post) return fail('err_unknown')

  await prisma.comment.create({ data: { postId, userId: session.userId, body: body.slice(0, 5000) } })
  return ok({ message: 'আপনার মন্তব্য প্রকাশিত হয়েছে।' })
}

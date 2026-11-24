import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { fail, ok, text } from '@/lib/api'
import { MESSAGES } from '@/lib/config'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return fail('err_unauthorized', 401)

  const form = await request.formData()
  const postId = text(form, 'postId')
  if (!postId) return fail('err_required')

  const existing = await prisma.savedArticle.findUnique({
    where: { userId_postId: { userId: session.userId, postId } },
  })

  if (existing) {
    await prisma.savedArticle.delete({ where: { userId_postId: { userId: session.userId, postId } } })
    return ok({ message: MESSAGES.unsaved.text })
  }
  await prisma.savedArticle.create({ data: { userId: session.userId, postId } })
  return ok({ message: MESSAGES.saved.text })
}

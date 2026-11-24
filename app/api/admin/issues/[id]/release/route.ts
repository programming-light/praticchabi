import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok } from '@/lib/api'

type Context = { params: Promise<{ id: string }> }

/** Marks one issue as the released hard-copy edition and clears the old marker. */
export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard

  const { id } = await params
  const issue = await prisma.issue.findUnique({ where: { id }, select: { id: true, title: true } })
  if (!issue) return fail('err_unknown', 404)

  await prisma.$transaction(async (tx) => {
    await tx.issue.updateMany({ data: { isCurrent: false } })
    await tx.issue.update({
      where: { id },
      data: { isCurrent: true, publishedAt: new Date() },
    })
  })

  revalidatePath('/')
  revalidatePath('/issues')
  return ok({ message: `“${issue.title}” বর্তমান হার্ডকপি হিসেবে প্রকাশিত হয়েছে।` })
}

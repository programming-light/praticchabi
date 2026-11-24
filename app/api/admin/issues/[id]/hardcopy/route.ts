import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { adminGuard } from '@/lib/admin-api'
import { fail, ok, text } from '@/lib/api'
import { uploadImage } from '@/lib/upload-helper'

type Context = { params: Promise<{ id: string }> }

function parseReleaseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Fast edit for the dashboard: price, period, order link, cover and release date. */
export async function POST(request: Request, { params }: Context) {
  const guard = await adminGuard(request)
  if (guard) return guard

  const { id } = await params
  const existing = await prisma.issue.findUnique({ where: { id } })
  if (!existing) return fail('err_unknown', 404)

  const form = await request.formData()
  const publishedAt = parseReleaseDate(text(form, 'releasedAt'))

  try {
    const coverUrl = await uploadImage(form, 'cover', 'issues')
    await prisma.issue.update({
      where: { id },
      data: {
        period: text(form, 'period') || null,
        price: text(form, 'price') || null,
        orderUrl: text(form, 'orderUrl') || null,
        description: text(form, 'description') || null,
        ...(publishedAt ? { publishedAt } : {}),
        ...(coverUrl ? { coverUrl } : {}),
      },
    })
    revalidatePath('/')
    revalidatePath('/issues')
    return ok({ message: 'হার্ডকপির তথ্য হালনাগাদ হয়েছে।' })
  } catch (error) {
    console.error(error)
    return fail('err_upload')
  }
}

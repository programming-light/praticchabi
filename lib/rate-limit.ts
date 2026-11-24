import { prisma } from './db'

/** Simple DB-backed per-IP limiter; mirrors the WP transient limiter in the original plugin. */
export async function rateLimit(key: string, max: number, windowMs = 60 * 60 * 1000): Promise<boolean> {
  const now = new Date()
  try {
    const current = await prisma.rateLimit.findUnique({ where: { key } })
    if (!current || now.getTime() - current.windowStart.getTime() > windowMs) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      })
      return true
    }
    if (current.count >= max) return false
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } })
    return true
  } catch (error) {
    console.error('[rate-limit]', error)
    return true // never block the site because of a limiter failure
  }
}

export function requestIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

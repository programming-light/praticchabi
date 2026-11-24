import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { STATUS_LABELS } from '@/lib/config'

function csvCell(value: unknown): string {
  const string = value == null ? '' : String(value)
  return `"${string.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !['ADMIN', 'EDITOR'].includes(session.role)) {
    return Response.json({ ok: false }, { status: 403 })
  }

  const type = new URL(request.url).searchParams.get('type') === 'subscribers' ? 'subscribers' : 'submissions'
  const rows: string[] = []

  if (type === 'subscribers') {
    rows.push(['ইমেইল', 'তারিখ'].map(csvCell).join(','))
    const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 })
    for (const item of subscribers) rows.push([item.email, item.createdAt.toISOString()].map(csvCell).join(','))
  } else {
    rows.push(['শিরোনাম', 'লেখক', 'ইমেইল', 'ফোন', 'বিভাগ', 'শব্দসংখ্যা', 'অবস্থা', 'তারিখ'].map(csvCell).join(','))
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
      take: 5000,
    })
    for (const item of submissions) {
      rows.push([
        item.title, item.name, item.email, item.phone, item.category?.name,
        item.words, STATUS_LABELS[item.status] || item.status, item.createdAt.toISOString(),
      ].map(csvCell).join(','))
    }
  }

  return new Response(`\uFEFF${rows.join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="praticchabi-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

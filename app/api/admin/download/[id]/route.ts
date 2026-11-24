import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getFile } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !['ADMIN', 'EDITOR'].includes(session.role)) {
    return Response.json({ ok: false, message: 'অনুমতি নেই।' }, { status: 403 })
  }

  const { id } = await params
  const submission = await prisma.submission.findUnique({ where: { id } })
  if (!submission) return new Response('Not found', { status: 404 })

  const bytes = await getFile(submission.fileKey)
  if (!bytes) return new Response('File missing', { status: 404 })

  const asciiName = submission.originalName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_')
  return new Response(new Blob([new Uint8Array(bytes)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(submission.originalName)}`,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

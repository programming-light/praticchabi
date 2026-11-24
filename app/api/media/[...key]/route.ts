import { contentTypeFor, getFile, safeKey } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params
  const joined = safeKey(key.join('/'))
  const data = await getFile(joined)
  if (!data) return new Response('Not found', { status: 404 })

  return new Response(new Blob([new Uint8Array(data)], { type: contentTypeFor(joined) }), {
    headers: {
      'Content-Type': contentTypeFor(joined),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

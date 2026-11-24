/**
 * Upload adapter. Priority for public images:
 *  1. ImgBB        (IMGBB_API_KEY) — free public image host, returns a direct URL
 *  2. Vercel Blob  (BLOB_READ_WRITE_TOKEN)
 *  3. S3-compatible (S3_BUCKET + credentials)
 *  4. Local disk    (.data/uploads — development only; Vercel's filesystem is read-only)
 *
 * Private files (.docx submissions) never go to a public host — they stay on
 * Blob/S3/local disk and are only served through the admin download route.
 */
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LOCAL_ROOT = path.join(process.cwd(), '.data', 'uploads')

export type UploadProvider = 'imgbb' | 'blob' | 's3' | 'local'

export function storageProvider(): UploadProvider {
  if (process.env.IMGBB_API_KEY) return 'imgbb'
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob'
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) return 's3'
  return 'local'
}

async function uploadToImgBB(data: Uint8Array, filename: string, contentType: string): Promise<string> {
  const form = new FormData()
  form.append('image', new Blob([new Uint8Array(data)], { type: contentType }), filename)
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(process.env.IMGBB_API_KEY!)}`, {
    method: 'POST',
    body: form,
  })
  const json = (await response.json()) as {
    success?: boolean
    data?: { display_url?: string; url?: string }
    error?: { message?: string }
  }
  if (!response.ok || !json.success || !json.data?.display_url) {
    throw new Error(`ImgBB upload failed: ${json.error?.message || response.statusText}`)
  }
  return json.data.display_url
}

export function safeKey(key: string): string {
  return key.replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((p) => p && p !== '..' && p !== '.').join('/')
}

function localPath(key: string) {
  return path.join(LOCAL_ROOT, safeKey(key))
}

/** Stores bytes and returns the key to persist in the database. */
export async function putFile(
  key: string,
  data: Uint8Array,
  contentType: string,
  options: { access?: 'public' | 'private' } = {},
): Promise<string> {
  const clean = safeKey(key)
  // Public images go to ImgBB; private .docx files must never leave the private store.
  if (options.access !== 'private' && process.env.IMGBB_API_KEY && contentType.startsWith('image/')) {
    return uploadToImgBB(data, path.basename(clean), contentType)
  }

  if (storageProvider() === 'blob') {
    const { put } = await import('@vercel/blob')
    const result = await put(clean, new Blob([new Uint8Array(data)], { type: contentType }), {
      access: options.access || 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return result.url
  }

  if (storageProvider() === 's3') {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: clean,
      Body: data,
      ContentType: contentType,
    }))
    return clean
  }

  const target = localPath(clean)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, data)
  return clean
}

export async function getFile(key: string): Promise<Uint8Array | null> {
  if (key.startsWith('http://') || key.startsWith('https://')) {
    // Private Blob objects need the token; public ones can be fetched directly.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { get } = await import('@vercel/blob')
        const result = await get(key, { token: process.env.BLOB_READ_WRITE_TOKEN, access: 'private' })
        if (result?.statusCode === 200) {
          return new Uint8Array(await new Response(result.stream).arrayBuffer())
        }
      } catch (error) {
        console.error('[storage] blob get failed, trying public fetch', error)
      }
    }
    const response = await fetch(key)
    if (!response.ok) return null
    return new Uint8Array(await response.arrayBuffer())
  }

  if (storageProvider() === 's3') {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
    const object = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: safeKey(key) }))
    if (!object.Body) return null
    return object.Body.transformToByteArray()
  }

  try {
    return await readFile(localPath(key))
  } catch {
    return null
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!key) return
  if (key.startsWith('http://') || key.startsWith('https://')) {
    // ImgBB URLs have no deletable local/blob object; skip them safely.
    const isBlobUrl = new URL(key).hostname.includes('blob.vercel-storage.com')
    if (isBlobUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import('@vercel/blob')
      await del(key, { token: process.env.BLOB_READ_WRITE_TOKEN })
    }
    return
  }
  if (storageProvider() === 's3') {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: safeKey(key) }))
    return
  }
  try {
    await unlink(localPath(key))
  } catch {
    /* already gone */
  }
}

export function publicUrl(key?: string | null): string {
  if (!key) return ''
  if (key.startsWith('http://') || key.startsWith('https://')) return key
  // Static assets copied verbatim from the original theme live in /public.
  if (key.startsWith('/images/') || key.startsWith('/fonts/') || key.startsWith('/assets/')) return key
  if (process.env.S3_PUBLIC_BASE_URL) {
    return `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${safeKey(key)}`
  }
  return `/api/media/${safeKey(key).split('/').map(encodeURIComponent).join('/')}`
}

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const types: Record<string, string> = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  }
  return types[ext] || 'application/octet-stream'
}

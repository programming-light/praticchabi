import { randomUUID } from 'node:crypto'
import { fileFrom } from './api'
import { putFile } from './storage'

/** Uploads an admin-selected image. Returns the stored key, or null when no file was chosen. */
export async function uploadImage(form: FormData, field: string, folder: string): Promise<string | null> {
  const file = fileFrom(form, field)
  if (!file || file.size === 0) return null
  if (!file.type.startsWith('image/')) throw new Error('invalid-image')
  if (file.size > 10 * 1024 * 1024) throw new Error('image-too-large')

  const extension = (file.name.split('.').pop() || 'img').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'img'
  const bytes = new Uint8Array(await file.arrayBuffer())
  return putFile(`${folder}/${randomUUID()}.${extension}`, bytes, file.type)
}

export function plainTextToHtml(value: string): string {
  if (/<(p|br|h[1-6]|blockquote|a|strong|em|ul|ol|li)\b/i.test(value)) return value
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}

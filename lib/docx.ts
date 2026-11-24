/** DOCX reading without any native dependencies — works on Vercel serverless. */
import JSZip from 'jszip'

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

export async function readDocx(buffer: Uint8Array): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer)
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) return []
  const xml = await xmlFile.async('string')
  return xml
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\r?\n/u)
    .map((line) => decodeEntities(line).trim())
    .filter(Boolean)
}

export function countWords(text: string): number {
  return text.split(/\s+/u).filter(Boolean).length
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`).join('\n')
}

export async function analyzeDocx(buffer: Uint8Array) {
  const paragraphs = await readDocx(buffer)
  const text = paragraphs.join('\n')
  return { paragraphs, words: countWords(text), html: paragraphsToHtml(paragraphs) }
}

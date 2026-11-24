import { prisma } from './db'
import { SITE } from './config'

export const SETTING_DEFAULTS: Record<string, string> = {
  notify_email: process.env.NOTIFY_EMAIL || SITE.email,
  max_mb: '5',
  min_words: '1500',
  max_words: '3000',
  contact_email: SITE.email,
  whatsapp: SITE.whatsapp,
  whatsapp_label: SITE.whatsappLabel,
  facebook: SITE.facebook,
  address: SITE.address,
  about_text: '',
}

export async function settings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany()
  return { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) }
}

export async function setting(key: string): Promise<string> {
  return (await settings())[key] ?? SETTING_DEFAULTS[key] ?? ''
}

export async function maxUploadBytes(): Promise<number> {
  const value = Number(await setting('max_mb'))
  const mb = Number.isFinite(value) ? Math.min(50, Math.max(1, value)) : 5
  return mb * 1024 * 1024
}

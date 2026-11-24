import { NextResponse } from 'next/server'
import { MESSAGES } from './config'

export { slugify } from './config'

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data })
}

export function fail(code = 'err_unknown', status = 400) {
  return NextResponse.json(
    { ok: false, code, message: MESSAGES[code]?.text || MESSAGES.err_unknown.text },
    { status },
  )
}

export function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export function checked(form: FormData, key: string): boolean {
  const value = form.get(key)
  return value === 'on' || value === '1' || value === 'true'
}

export function fileFrom(form: FormData, key: string): File | null {
  const value = form.get(key)
  return value instanceof File ? value : null
}

export function honeypotPassed(form: FormData): boolean {
  return !text(form, 'website')
}

export function emailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function errorCode(error: unknown): string {
  console.error('[api]', error)
  return 'err_unknown'
}

'use client'

export type ApiResult = { ok: boolean; code?: string; message?: string; redirect?: string; id?: string }

export function csrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)pc_csrf=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export async function postForm(url: string, body: FormData): Promise<ApiResult> {
  const response = await fetch(url, {
    method: 'POST',
    body,
    headers: { 'x-csrf-token': csrfToken() },
  })
  try {
    return (await response.json()) as ApiResult
  } catch {
    return { ok: false, message: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' }
  }
}

export async function postJson(url: string, body: unknown): Promise<ApiResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken() },
    body: JSON.stringify(body),
  })
  try {
    return (await response.json()) as ApiResult
  } catch {
    return { ok: false, message: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' }
  }
}

export async function sendDelete(url: string): Promise<ApiResult> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'x-csrf-token': csrfToken() },
  })
  try {
    return (await response.json()) as ApiResult
  } catch {
    return { ok: false, message: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' }
  }
}

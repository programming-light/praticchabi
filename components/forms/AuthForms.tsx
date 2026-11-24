'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postForm } from './request'

function Result({ message, ok }: { message: string; ok: boolean }) {
  if (!message) return null
  return <div className={`pc-notice pc-notice--${ok ? 'ok' : 'err'}`} role="status">{message}</div>
}

export function LoginForm({ nextUrl = '' }: { nextUrl?: string }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const result = await postForm('/api/auth/login', new FormData(event.currentTarget))
        setBusy(false)
        setMessage(result.message || '')
        setOk(result.ok)
        if (result.ok) {
          router.push(result.redirect || '/account')
          router.refresh()
        }
      }}
    >
      <Result message={message} ok={ok} />
      <input type="hidden" name="next" value={nextUrl} />
      <p><label htmlFor="login-email">ইমেইল</label><input id="login-email" name="email" type="email" required autoComplete="email" /></p>
      <p><label htmlFor="login-pass">পাসওয়ার্ড</label><input id="login-pass" name="password" type="password" required autoComplete="current-password" /></p>
      <p className="pc-form__check">
        <input id="login-remember" name="remember" type="checkbox" />
        <label htmlFor="login-remember">লগইন রাখুন</label>
      </p>
      <p className="pc-form__between"><small><a href="/forgot-password">পাসওয়ার্ড ভুলে গেছেন?</a></small></p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : 'লগইন'}</button></div>
    </form>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const result = await postForm('/api/auth/register', new FormData(event.currentTarget))
        setBusy(false)
        setMessage(result.message || '')
        setOk(result.ok)
        if (result.ok) {
          router.push('/account?pcp=reg_ok')
          router.refresh()
        }
      }}
    >
      <Result message={message} ok={ok} />
      <p><label htmlFor="reg-name">নাম</label><input id="reg-name" name="name" type="text" required /></p>
      <p><label htmlFor="reg-email">ইমেইল</label><input id="reg-email" name="email" type="email" required autoComplete="email" /></p>
      <p><label htmlFor="reg-pass">পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</label><input id="reg-pass" name="password" type="password" minLength={8} required autoComplete="new-password" /></p>
      <p className="pc-form__check">
        <input id="reg-terms" name="terms" type="checkbox" required />
        <label htmlFor="reg-terms">আমি শর্তাবলিতে সম্মত। *</label>
      </p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : 'নিবন্ধন করুন'}</button></div>
    </form>
  )
}

export function ForgotForm() {
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const result = await postForm('/api/auth/forgot', new FormData(event.currentTarget))
        setBusy(false)
        setMessage(result.message || '')
        setOk(result.ok)
      }}
    >
      <Result message={message} ok={ok} />
      <p><label htmlFor="forgot-email">ইমেইল</label><input id="forgot-email" name="email" type="email" required /></p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'পাঠানো হচ্ছে…' : 'রিসেট লিংক পাঠান'}</button></div>
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const form = new FormData(event.currentTarget)
        form.set('token', token)
        const result = await postForm('/api/auth/reset', form)
        setBusy(false)
        setMessage(result.message || '')
        setOk(result.ok)
        if (result.ok) {
          setTimeout(() => router.push('/login?pcp=pass_reset'), 800)
        }
      }}
    >
      <Result message={message} ok={ok} />
      <p><label htmlFor="reset-pass">নতুন পাসওয়ার্ড</label><input id="reset-pass" name="password" type="password" minLength={8} required /></p>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'সংরক্ষণ…' : 'পাসওয়ার্ড পরিবর্তন'}</button></div>
    </form>
  )
}

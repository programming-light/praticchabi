'use client'

import { useState } from 'react'
import { postForm } from './request'

export default function NewsletterForm() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-news"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const form = event.currentTarget
        const result = await postForm('/api/newsletter', new FormData(form))
        setBusy(false)
        setError(!result.ok)
        setMessage(result.message || '')
        if (result.ok) form.reset()
      }}
    >
      <label className="screen-reader-text" htmlFor="newsletter-email">ইমেইল ঠিকানা</label>
      <input id="newsletter-email" type="email" name="email" placeholder="আপনার ইমেইল ঠিকানা" required />
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <button type="submit" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : 'সাবস্ক্রাইব'}</button>
      {message && <div className={`pc-notice pc-notice--${error ? 'err' : 'ok'}`} role="status">{message}</div>}
    </form>
  )
}

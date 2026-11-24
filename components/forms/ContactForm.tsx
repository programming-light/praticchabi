'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MESSAGES } from '@/lib/config'
import { postForm } from './request'

export default function ContactForm({ defaultName = '', defaultEmail = '' }: { defaultName?: string; defaultEmail?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        setError('')
        const form = event.currentTarget
        const result = await postForm('/api/contact', new FormData(form))
        setBusy(false)
        if (result.ok) {
          router.push('/contact?pcp=contact_ok')
          router.refresh()
        } else {
          setError(result.message || MESSAGES.err_unknown.text)
        }
      }}
    >
      {error && <div className="pc-notice pc-notice--err" role="alert">{error}</div>}
      <div className="pc-form__row">
        <p><label htmlFor="contact-name">নাম *</label><input id="contact-name" name="name" type="text" required defaultValue={defaultName} /></p>
        <p><label htmlFor="contact-email">ইমেইল *</label><input id="contact-email" name="email" type="email" required defaultValue={defaultEmail} /></p>
      </div>
      <p><label htmlFor="contact-subject">বিষয়</label><input id="contact-subject" name="subject" type="text" /></p>
      <p><label htmlFor="contact-body">বার্তা *</label><textarea id="contact-body" name="body" rows={6} required /></p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান'}</button></div>
    </form>
  )
}

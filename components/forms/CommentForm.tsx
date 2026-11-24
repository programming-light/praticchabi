'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postForm } from './request'

export default function CommentForm({ postId }: { postId: string }) {
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
        form.set('postId', postId)
        const result = await postForm('/api/comments', form)
        setBusy(false)
        setMessage(result.message || '')
        setOk(result.ok)
        if (result.ok) {
          event.currentTarget.reset()
          router.refresh()
        }
      }}
    >
      {message && <div className={`pc-notice pc-notice--${ok ? 'ok' : 'err'}`}>{message}</div>}
      <p><label htmlFor="comment-body">আপনার মন্তব্য</label><textarea id="comment-body" name="body" rows={4} required /></p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn pc-btn--small" type="submit" disabled={busy}>{busy ? 'পাঠানো হচ্ছে…' : 'মন্তব্য করুন'}</button></div>
    </form>
  )
}

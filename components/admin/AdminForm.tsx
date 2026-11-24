'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postForm, sendDelete } from '@/components/forms/request'

export default function AdminForm({
  action, method = 'POST', button, children, redirect, confirmMessage,
  buttonClass = 'pc-btn', reset = false,
}: {
  action: string
  method?: 'POST' | 'DELETE'
  button: string
  children?: React.ReactNode
  redirect?: string
  confirmMessage?: string
  buttonClass?: string
  reset?: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  return (
    <form
      className="admin-form"
      encType="multipart/form-data"
      onSubmit={async (event) => {
        event.preventDefault()
        if (confirmMessage && !window.confirm(confirmMessage)) return
        setBusy(true)
        setMessage('')
        const form = event.currentTarget
        const result = method === 'DELETE'
          ? await sendDelete(action)
          : await postForm(action, new FormData(form))
        setBusy(false)
        setError(!result.ok)
        setMessage(result.message || (result.ok ? 'সংরক্ষণ করা হয়েছে।' : 'সমস্যা হয়েছে।'))
        if (result.ok) {
          if (reset) form.reset()
          const target = result.redirect || redirect
          if (target) router.push(target)
          router.refresh()
        }
      }}
    >
      {children}
      <div className="admin-form__actions">
        <button className={buttonClass} type="submit" disabled={busy}>{busy ? 'অপেক্ষা করুন…' : button}</button>
      </div>
      {message && <div className={`admin-notice admin-notice--${error ? 'err' : 'ok'}`}>{message}</div>}
    </form>
  )
}

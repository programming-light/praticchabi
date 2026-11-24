'use client'

import { useState } from 'react'
import { postForm } from './request'

export default function SaveButton({ postId, saved, loggedIn, loginUrl }: { postId: string; saved: boolean; loggedIn: boolean; loginUrl: string }) {
  const [isSaved, setIsSaved] = useState(saved)
  const [busy, setBusy] = useState(false)

  if (!loggedIn) {
    return <a href={loginUrl}>সংরক্ষণ করতে লগইন করুন</a>
  }

  return (
    <button
      type="button"
      className="admin-btn-link admin-btn-link--ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const form = new FormData()
        form.set('postId', postId)
        const result = await postForm('/api/save', form)
        setBusy(false)
        if (result.ok) setIsSaved(!isSaved)
      }}
    >
      {isSaved ? '★ সংরক্ষিত — বাতিল করুন' : '☆ সংরক্ষণ করুন'}
    </button>
  )
}

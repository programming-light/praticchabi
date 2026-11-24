'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { postForm } from '@/components/forms/request'

type IssueOption = { id: string; title: string }

export default function IssueReleaseForm({ issues, currentId }: { issues: IssueOption[]; currentId?: string }) {
  const options = issues.filter((issue) => issue.id !== currentId)
  const [selected, setSelected] = useState(options[0]?.id || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  if (!options.length) {
    return (
      <div className="admin-empty">
        আরেকটি সংখ্যা যোগ করুন—তারপর এক ক্লিকে বর্তমান হার্ডকপি হিসেবে প্রকাশ করা যাবে।{' '}
        <Link href="/admin/issues/new">নতুন সংখ্যা তৈরি করুন →</Link>
      </div>
    )
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    if (!window.confirm('এই সংখ্যাটি বর্তমান হার্ডকপি হিসেবে প্রকাশ করবেন? বর্তমান সংখ্যার মার্কা সরে যাবে।')) return
    setBusy(true)
    setMessage('')
    const result = await postForm(`/api/admin/issues/${selected}/release`, new FormData())
    setBusy(false)
    setError(!result.ok)
    setMessage(result.message || (result.ok ? 'সংখ্যাটি প্রকাশিত হয়েছে।' : 'সমস্যা হয়েছে।'))
    if (result.ok) router.refresh()
  }

  return (
    <form className="admin-form admin-form--compact" onSubmit={submit}>
      <label>
        নতুন সংখ্যা বাছাই করুন
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          {options.map((issue) => <option value={issue.id} key={issue.id}>{issue.title}</option>)}
        </select>
      </label>
      <div className="admin-form__actions">
        <button className="admin-btn-link" type="submit" disabled={busy}>
          {busy ? 'অপেক্ষা করুন…' : 'বর্তমান হার্ডকপি হিসেবে প্রকাশ করুন'}
        </button>
      </div>
      {message && <div className={`admin-notice admin-notice--${error ? 'err' : 'ok'}`}>{message}</div>}
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bn } from '@/lib/config'
import { postForm } from './request'

type Category = { id: string; name: string }

export default function SubmitForm({
  categories, maxMb, defaultName = '', defaultEmail = '',
}: { categories: Category[]; maxMb: number; defaultName?: string; defaultEmail?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="pc-form"
      id="pc-form"
      encType="multipart/form-data"
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        setError('')
        const result = await postForm('/api/submissions', new FormData(event.currentTarget))
        setBusy(false)
        if (result.ok) {
          router.push('/submit?pcp=submit_ok')
          router.refresh()
        } else {
          setError(result.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।')
        }
      }}
    >
      {error && <div className="pc-notice pc-notice--err" role="alert">{error}</div>}
      <div className="pc-form__row">
        <p><label htmlFor="sub-name">নাম *</label><input id="sub-name" name="name" type="text" required defaultValue={defaultName} /></p>
        <p><label htmlFor="sub-email">ইমেইল *</label><input id="sub-email" name="email" type="email" required defaultValue={defaultEmail} /></p>
      </div>
      <div className="pc-form__row">
        <p><label htmlFor="sub-phone">মোবাইল নম্বর</label><input id="sub-phone" name="phone" type="tel" /></p>
        <p><label htmlFor="sub-cat">বিভাগ *</label>
          <select id="sub-cat" name="categoryId" required defaultValue="">
            <option value="" disabled>বিভাগ বেছে নিন</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </p>
      </div>
      <p><label htmlFor="sub-title">লেখার শিরোনাম *</label><input id="sub-title" name="title" type="text" required /></p>
      <p>
        <label htmlFor="sub-file">লেখার ফাইল (.docx) *</label>
        <input id="sub-file" name="file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
        <small className="pc-file-name">সর্বোচ্চ আকার: {bn(maxMb)} এমবি · শুধু .docx</small>
      </p>
      <p><label htmlFor="sub-note">সম্পাদকের জন্য বার্তা (ঐচ্ছিক)</label><textarea id="sub-note" name="note" rows={4} /></p>
      <p className="pc-form__check">
        <input id="sub-agree" name="agree" type="checkbox" required />
        <label htmlFor="sub-agree">আমি ঘোষণা করছি যে লেখাটি আমার নিজের মৌলিক রচনা—AI দিয়ে তৈরি নয়, কোথাও প্রকাশিত হয়নি এবং অন্যের থেকে কপি করা হয়নি। *</label>
      </p>
      <div className="pc-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div><button className="pc-btn" type="submit" disabled={busy}>{busy ? 'জমা দেওয়া হচ্ছে…' : 'লেখা জমা দিন'}</button></div>
    </form>
  )
}

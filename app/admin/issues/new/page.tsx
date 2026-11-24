import Link from 'next/link'
import IssueForm from '@/components/admin/IssueForm'

export default function NewIssuePage() {
  return (
    <>
      <p className="pc-mb"><Link href="/admin/issues">← সব সংখ্যা</Link></p>
      <div className="admin-panel">
        <h2>নতুন সংখ্যা</h2>
        <IssueForm action="/api/admin/issues" />
      </div>
    </>
  )
}

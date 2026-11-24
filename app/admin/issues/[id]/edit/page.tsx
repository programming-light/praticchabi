import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import IssueForm from '@/components/admin/IssueForm'
import { publicUrl } from '@/lib/storage'

export default async function EditIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await prisma.issue.findUnique({ where: { id } })
  if (!issue) notFound()

  return (
    <>
      <p className="pc-mb"><Link href="/admin/issues">← সব সংখ্যা</Link> · <Link href={`/issues/${issue.slug}`} target="_blank">সাইটে দেখুন ↗</Link></p>
      <div className="admin-grid2">
        <div className="admin-panel">
          <h2>সংখ্যা সম্পাদনা</h2>
          <IssueForm issue={issue} action={`/api/admin/issues/${id}`} />
        </div>
        {issue.coverUrl && (
          <div className="admin-panel">
            <h2>বর্তমান প্রচ্ছদ</h2>
            <img className="admin-preview" src={publicUrl(issue.coverUrl)} alt={issue.title} />
          </div>
        )}
      </div>
    </>
  )
}

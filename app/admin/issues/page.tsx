import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate } from '@/lib/config'
import { publicUrl } from '@/lib/storage'
import AdminForm from '@/components/admin/AdminForm'

export default async function IssuesPage() {
  const issues = await prisma.issue.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  })

  return (
    <>
      <div className="admin-toolbar">
        <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>সংখ্যা ({bn(issues.length)})</h2>
        <Link className="admin-btn-link" href="/admin/issues/new">নতুন সংখ্যা যোগ করুন</Link>
      </div>
      <div className="admin-panel">
        {issues.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>প্রচ্ছদ</th><th>সংখ্যা</th><th>সময়কাল</th><th>লেখা</th><th>তারিখ</th><th></th></tr></thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      {issue.coverUrl
                        ? <img className="admin-thumb" src={publicUrl(issue.coverUrl)} alt="" />
                        : <span className="pc-noimg admin-thumb" />}
                    </td>
                    <td>
                      <strong>{issue.title}</strong>
                      <br />
                      <Link href={`/issues/${issue.slug}`} target="_blank" className="pc-muted">/issues/{issue.slug} ↗</Link>
                    </td>
                    <td>{issue.period || '—'}</td>
                    <td className="num">{bn(issue._count.posts)}</td>
                    <td>{formatDate(issue.publishedAt)}</td>
                    <td>
                      <div className="pc-inline">
                        <Link className="admin-btn-link admin-btn-link--ghost" href={`/admin/issues/${issue.id}/edit`}>সম্পাদনা</Link>
                        <AdminForm
                          action={`/api/admin/issues/${issue.id}`}
                          method="DELETE"
                          button="মুছুন"
                          buttonClass="admin-btn-link admin-btn-link--danger"
                          confirmMessage="এই সংখ্যাটি মুছে ফেলবেন? এর লেখাগুলো সংখ্যাহীন হয়ে যাবে।"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">এখনো কোনো সংখ্যা যোগ করা হয়নি।</div>
        )}
      </div>
    </>
  )
}

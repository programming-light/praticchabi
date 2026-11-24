import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, issueOrderUrl } from '@/lib/config'
import { publicUrl } from '@/lib/storage'
import AdminForm from '@/components/admin/AdminForm'

export default async function IssuesPage() {
  const issues = await prisma.issue.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: [{ isCurrent: 'desc' }, { publishedAt: 'desc' }],
    take: 100,
  })

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>সংখ্যা ({bn(issues.length)})</h2>
          <p className="pc-muted">বর্তমান হার্ডকপি সংখ্যাটি প্রথমে দেখানো হয়। মূল্য ও অর্ডার লিংক এখান থেকেই নিয়ন্ত্রণ করুন।</p>
        </div>
        <Link className="admin-btn-link" href="/admin/issues/new">নতুন সংখ্যা যোগ করুন</Link>
      </div>
      <div className="admin-panel">
        {issues.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>প্রচ্ছদ</th>
                  <th>সংখ্যা</th>
                  <th>অবস্থা</th>
                  <th>সময়কাল</th>
                  <th>মূল্য</th>
                  <th>অর্ডার</th>
                  <th>লেখা</th>
                  <th>প্রকাশ</th>
                  <th></th>
                </tr>
              </thead>
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
                    <td>
                      {issue.isCurrent
                        ? <span className="admin-badge admin-badge--PUBLISHED">বর্তমান</span>
                        : <span className="admin-badge admin-badge--false">আর্কাইভ</span>}
                    </td>
                    <td>{issue.period || '—'}</td>
                    <td>{issue.price || '—'}</td>
                    <td>
                      <a href={issueOrderUrl(issue)} target="_blank" rel="noopener">
                        {issue.orderUrl ? 'কাস্টম লিংক ↗' : 'WhatsApp ↗'}
                      </a>
                    </td>
                    <td className="num">{bn(issue._count.posts)}</td>
                    <td>{formatDate(issue.publishedAt)}</td>
                    <td>
                      <div className="pc-inline">
                        <Link className="admin-btn-link admin-btn-link--ghost" href={`/admin/issues/${issue.id}/edit`}>সম্পাদনা</Link>
                        {!issue.isCurrent && (
                          <AdminForm
                            action={`/api/admin/issues/${issue.id}/release`}
                            button="প্রকাশ করুন"
                            buttonClass="admin-btn-link admin-btn-link--ghost"
                            confirmMessage={`“${issue.title}” কে বর্তমান হার্ডকপি হিসেবে প্রকাশ করবেন?`}
                          />
                        )}
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

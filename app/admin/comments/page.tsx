import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/config'
import AdminForm from '@/components/admin/AdminForm'

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      post: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <>
      <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24, marginBottom: 18 }}>মন্তব্য ({comments.length})</h2>
      <div className="admin-panel">
        {comments.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>লেখা</th><th>মন্তব্যকারী</th><th>মন্তব্য</th><th>অবস্থা</th><th></th></tr></thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id}>
                    <td><Link href={`/posts/${comment.post.slug}`} target="_blank">{comment.post.title}</Link></td>
                    <td>{comment.user.name}<br /><small className="pc-muted">{formatDate(comment.createdAt)}</small></td>
                    <td style={{ maxWidth: 360 }}>{comment.body}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${comment.approved ? 'true' : 'false'}`}>
                        {comment.approved ? 'প্রকাশিত' : 'অপেক্ষমাণ'}
                      </span>
                    </td>
                    <td>
                      <div className="pc-inline">
                        <AdminForm action={`/api/admin/comments/${comment.id}`} button={comment.approved ? 'লুকান' : 'অনুমোদন'} buttonClass="admin-btn-link admin-btn-link--ghost">
                          <input type="hidden" name="approved" value={comment.approved ? '' : '1'} />
                        </AdminForm>
                        <AdminForm
                          action={`/api/admin/comments/${comment.id}`}
                          method="DELETE"
                          button="মুছুন"
                          buttonClass="admin-btn-link admin-btn-link--danger"
                          confirmMessage="এই মন্তব্যটি মুছে ফেলবেন?"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">এখনো কোনো মন্তব্য নেই।</div>
        )}
      </div>
    </>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate } from '@/lib/config'
import { publicUrl } from '@/lib/storage'
import AdminForm from '@/components/admin/AdminForm'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const status = Array.isArray(query.status) ? query.status[0] : query.status || ''
  const search = (Array.isArray(query.q) ? query.q[0] : query.q || '').trim()

  const posts = await prisma.post.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      issue: { select: { title: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  })

  return (
    <>
      <div className="admin-toolbar">
        <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>সব লেখা ({bn(posts.length)})</h2>
        <Link className="admin-btn-link" href="/admin/posts/new">নতুন লেখা</Link>
      </div>
      <div className="admin-panel">
        <form method="get" action="/admin/posts" className="admin-toolbar">
          <input type="search" name="q" defaultValue={search} placeholder="শিরোনাম দিয়ে খুঁজুন" aria-label="খুঁজুন" />
          <select name="status" aria-label="অবস্থা" defaultValue={status}>
            <option value="">সব অবস্থা</option>
            <option value="PUBLISHED">প্রকাশিত</option>
            <option value="DRAFT">খসড়া</option>
          </select>
          <button className="admin-btn-link" type="submit">ফিল্টার</button>
        </form>
        {posts.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ছবি</th><th>শিরোনাম</th><th>বিভাগ</th><th>সংখ্যা</th><th>অবস্থা</th><th>হালনাগাদ</th><th></th></tr></thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      {post.coverUrl
                        ? <img className="admin-thumb" src={publicUrl(post.coverUrl)} alt="" />
                        : <span className="pc-noimg admin-thumb" />}
                    </td>
                    <td>
                      <Link href={`/admin/posts/${post.id}/edit`}>{post.title}</Link>
                      {post.featured && <span className="admin-badge" style={{ marginLeft: 6 }}>নির্বাচিত</span>}
                      <br />
                      <small className="pc-muted">{post.author.name}</small>
                    </td>
                    <td>{post.category?.name || '—'}</td>
                    <td>{post.issue?.title || '—'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${post.status}`}>
                        {post.status === 'PUBLISHED' ? 'প্রকাশিত' : 'খসড়া'}
                      </span>
                    </td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td>
                      <div className="pc-inline">
                        <Link className="admin-btn-link admin-btn-link--ghost" href={`/posts/${post.slug}`} target="_blank">দেখুন</Link>
                        <AdminForm
                          action={`/api/admin/posts/${post.id}`}
                          method="DELETE"
                          button="মুছুন"
                          buttonClass="admin-btn-link admin-btn-link--danger"
                          confirmMessage="এই লেখাটি স্থায়ীভাবে মুছে ফেলবেন?"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">কোনো লেখা পাওয়া যায়নি।</div>
        )}
      </div>
    </>
  )
}

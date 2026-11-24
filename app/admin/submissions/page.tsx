import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, STATUS_LABELS } from '@/lib/config'
import { getCategories } from '@/lib/queries'

const PER_PAGE = 25

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const one = (key: string) => {
    const value = query[key]
    return Array.isArray(value) ? value[0] : value
  }
  const status = one('status') || ''
  const categoryId = one('category') || ''
  const search = (one('q') || '').trim()
  const page = Math.max(1, Number(one('page')) || 1)

  const categories = await getCategories()
  const where = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  }

  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
    }),
  ])

  const pages = Math.ceil(total / PER_PAGE)
  const href = (nextPage: number) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (categoryId) params.set('category', categoryId)
    if (search) params.set('q', search)
    params.set('page', String(nextPage))
    return `/admin/submissions?${params}`
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>লেখা জমা ({bn(total)})</h2>
        <div className="pc-inline">
          <a className="admin-btn-link admin-btn-link--ghost" href="/api/admin/export?type=submissions">
            CSV ডাউনলোড
          </a>
          <Link className="admin-btn-link" href="/submit" target="_blank">
            ফর্ম দেখুন ↗
          </Link>
        </div>
      </div>

      <div className="admin-panel">
        <form method="get" action="/admin/submissions" className="admin-toolbar">
          <input type="search" name="q" defaultValue={search} placeholder="শিরোনাম / লেখক / ইমেইল" aria-label="খুঁজুন" />
          <select name="status" aria-label="অবস্থা" defaultValue={status}>
            <option value="">সব অবস্থা</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select name="category" aria-label="বিভাগ" defaultValue={categoryId}>
            <option value="">সব বিভাগ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button className="admin-btn-link" type="submit">ফিল্টার</button>
          <Link className="admin-btn-link admin-btn-link--ghost" href="/admin/submissions">রিসেট</Link>
        </form>

        {submissions.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>শিরোনাম</th>
                  <th>লেখক</th>
                  <th>বিভাগ</th>
                  <th>শব্দ</th>
                  <th>অবস্থা</th>
                  <th>তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/admin/submissions/${item.id}`}>{item.title}</Link></td>
                    <td>
                      {item.name}
                      <br />
                      <small className="pc-muted">{item.email}</small>
                    </td>
                    <td>{item.category?.name || '—'}</td>
                    <td className="num">{item.words ? bn(item.words) : '—'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${item.status}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">কোনো লেখা জমা পাওয়া যায়নি।</div>
        )}
      </div>

      {pages > 1 && (
        <div className="pc-pagination-wrap">
          <nav className="pc-pagination">
            {page > 1 && <Link href={href(page - 1)}>আগের</Link>}
            {Array.from({ length: pages }, (_, index) => index + 1)
              .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
              .map((n) => (
                <Link href={href(n)} key={n} aria-current={n === page ? 'page' : undefined}>
                  {bn(n)}
                </Link>
              ))}
            {page < pages && <Link href={href(page + 1)}>পরের</Link>}
          </nav>
        </div>
      )}
    </>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, STATUS_LABELS } from '@/lib/config'
import { StatusBadge } from '@/components/ui'

export default async function AdminDashboard() {
  const [newSubmissions, totalSubmissions, unreadMessages, subscribers, readers, published, recentSubmissions, recentMessages] = await Promise.all([
    prisma.submission.count({ where: { status: 'NEW' } }),
    prisma.submission.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.subscriber.count(),
    prisma.user.count({ where: { role: 'READER' } }),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.submission.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const stats = [
    { label: 'নতুন লেখা জমা', value: newSubmissions, href: '/admin/submissions?status=NEW', hint: 'পর্যালোচনার অপেক্ষায়', tone: 'gold', hot: newSubmissions > 0 },
    { label: 'মোট লেখা জমা', value: totalSubmissions, href: '/admin/submissions', hint: 'সব জমা করা লেখা', tone: 'green' },
    { label: 'অপঠিত বার্তা', value: unreadMessages, href: '/admin/messages', hint: 'এখনো পড়া হয়নি', tone: 'blue', hot: unreadMessages > 0 },
    { label: 'সাবস্ক্রাইবার', value: subscribers, href: '/admin/subscribers', hint: 'নিউজলেটার সদস্য', tone: 'mint' },
    { label: 'নিবন্ধিত পাঠক', value: readers, href: '/admin/users', hint: 'সক্রিয় অ্যাকাউন্ট', tone: 'sand' },
    { label: 'প্রকাশিত লেখা', value: published, href: '/admin/posts', hint: 'সাইটে প্রকাশিত', tone: 'green' },
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__head">
        <div>
          <span className="admin-dashboard__eyebrow">সম্পাদকীয় সারসংক্ষেপ</span>
          <h2>ড্যাশবোর্ড</h2>
          <p>জমা, বার্তা ও প্রকাশনার এক নজরে বিবরণ।</p>
        </div>
        <span className="admin-dashboard__date">{formatDate(new Date())}</span>
      </div>

      <div className="admin-cards">
        {stats.map((stat) => (
          <Link className={`admin-card admin-card--link admin-stat admin-stat--${stat.tone}${stat.hot ? ' is-hot' : ''}`} href={stat.href} key={stat.label}>
            <span className="admin-stat__dot" aria-hidden="true" />
            <div className="admin-card__num">{bn(stat.value)}</div>
            <div className="admin-card__label">{stat.label}</div>
            <div className="admin-stat__hint">{stat.hint} <span aria-hidden="true">→</span></div>
          </Link>
        ))}
      </div>

      <div className="admin-grid2 admin-dashboard__panels">
        <div className="admin-panel">
          <div className="admin-panel__head">
            <div><h2>সাম্প্রতিক লেখা জমা</h2><p>নতুন জমাগুলোর ওপর নজর রাখুন।</p></div>
            <Link href="/admin/submissions">সব দেখুন →</Link>
          </div>
          {recentSubmissions.length ? (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>শিরোনাম</th><th>লেখক</th><th>অবস্থা</th><th>তারিখ</th></tr></thead>
              <tbody>
                {recentSubmissions.map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/admin/submissions/${item.id}`}>{item.title}</Link></td>
                    <td>{item.name}</td>
                    <td><span className={`admin-badge admin-badge--${item.status}`}>{STATUS_LABELS[item.status]}</span></td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : <div className="admin-empty">এখনো কোনো লেখা জমা হয়নি।</div>}
        </div>

        <div className="admin-panel">
          <div className="admin-panel__head">
            <div><h2>সাম্প্রতিক বার্তা</h2><p>পাঠকের বার্তা ও জিজ্ঞাসা।</p></div>
            <Link href="/admin/messages">সব দেখুন →</Link>
          </div>
          {recentMessages.length ? (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>বিষয়</th><th>নাম</th><th>অবস্থা</th></tr></thead>
              <tbody>
                {recentMessages.map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/admin/messages?id=${item.id}`}>{item.subject}</Link></td>
                    <td>{item.name}</td>
                    <td>{item.isRead ? 'পড়া হয়েছে' : <span className="admin-badge admin-badge--NEW">নতুন</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : <div className="admin-empty">এখনো কোনো বার্তা নেই।</div>}
        </div>
      </div>

      <div className="admin-panel admin-dashboard__quick">
        <div className="admin-panel__head">
          <div><h2>দ্রুত কাজ</h2><p>সবচেয়ে ব্যবহৃত পদক্ষেপ।</p></div>
        </div>
        <div className="pc-actions">
          <Link className="admin-btn-link" href="/admin/posts/new">নতুন লেখা</Link>
          <Link className="admin-btn-link" href="/admin/issues/new">নতুন সংখ্যা</Link>
          <Link className="admin-btn-link" href="/admin/activities">নতুন ছবি যোগ করুন</Link>
          <a className="admin-btn-link admin-btn-link--ghost" href="/api/admin/export?type=submissions">CSV ডাউনলোড</a>
        </div>
      </div>
    </div>
  )
}

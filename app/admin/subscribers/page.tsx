import { prisma } from '@/lib/db'
import { bn, formatDate } from '@/lib/config'

export default async function SubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
  })

  return (
    <>
      <div className="admin-toolbar">
        <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>
          নিউজলেটার সাবস্ক্রাইবার ({bn(subscribers.length)})
        </h2>
        <a className="admin-btn-link" href="/api/admin/export?type=subscribers">
          CSV ডাউনলোড
        </a>
      </div>
      <div className="admin-panel">
        {subscribers.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>#</th><th>ইমেইল</th><th>তারিখ</th></tr></thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr key={subscriber.id}>
                    <td className="num">{bn(index + 1)}</td>
                    <td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td>
                    <td>{formatDate(subscriber.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">এখনো কেউ সাবস্ক্রাইব করেননি।</div>
        )}
      </div>
    </>
  )
}

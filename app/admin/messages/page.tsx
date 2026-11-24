import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate } from '@/lib/config'
import AdminForm from '@/components/admin/AdminForm'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const selectedId = Array.isArray(query.id) ? query.id[0] : query.id

  const [messages, selected] = await Promise.all([
    prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    selectedId
      ? prisma.message.findUnique({ where: { id: selectedId } })
      : prisma.message.findFirst({ where: { isRead: false }, orderBy: { createdAt: 'desc' } }),
  ])

  if (selected && !selected.isRead) {
    await prisma.message.update({ where: { id: selected.id }, data: { isRead: true } })
  }

  return (
    <>
      <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24, marginBottom: 18 }}>
        বার্তা ({bn(messages.filter((message) => !message.isRead).length)}টি অপঠিত)
      </h2>
      <div className="admin-grid2">
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>বিষয়</th><th>নাম</th><th>তারিখ</th></tr></thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id} className={message.id === selected?.id ? 'is-selected' : undefined}>
                    <td>
                      <Link href={`/admin/messages?id=${message.id}`}>
                        {!message.isRead && <span className="admin-badge admin-badge--NEW">নতুন</span>}{' '}
                        {message.subject}
                      </Link>
                    </td>
                    <td>{message.name}</td>
                    <td>{formatDate(message.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!messages.length && <div className="admin-empty">এখনো কোনো বার্তা নেই।</div>}
        </div>

        <div className="admin-panel">
          {selected ? (
            <>
              <h2>{selected.subject}</h2>
              <dl className="admin-dl">
                <dt>নাম</dt><dd>{selected.name}</dd>
                <dt>ইমেইল</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd>
                <dt>তারিখ</dt><dd>{formatDate(selected.createdAt, true)}</dd>
              </dl>
              <div className="admin-note pc-mt" style={{ whiteSpace: 'pre-wrap' }}>{selected.body}</div>
              <div className="pc-mt">
                <AdminForm
                  action={`/api/admin/messages/${selected.id}`}
                  method="DELETE"
                  button="বার্তা মুছুন"
                  buttonClass="admin-btn-link admin-btn-link--danger"
                  confirmMessage="এই বার্তাটি মুছে ফেলবেন?"
                  redirect="/admin/messages"
                />
              </div>
            </>
          ) : (
            <div className="admin-empty">দেখার জন্য একটি বার্তা বেছে নিন।</div>
          )}
        </div>
      </div>
    </>
  )
}

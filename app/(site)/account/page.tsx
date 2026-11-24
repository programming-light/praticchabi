import Link from 'next/link'
import { currentUser, isEditor } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, STATUS_LABELS } from '@/lib/config'
import { Notice, StatusBadge } from '@/components/ui'
import { publicUrl } from '@/lib/storage'

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const code = Array.isArray(params.pcp) ? params.pcp[0] : params.pcp
  const user = await currentUser()
  if (!user) return null // middleware redirects guests to /login

  const [submissions, saved] = await Promise.all([
    prisma.submission.findMany({
      where: { OR: [{ userId: user.id }, { email: user.email }] },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { category: { select: { name: true } } },
    }),
    prisma.savedArticle.findMany({
      where: { userId: user.id },
      include: { post: { select: { id: true, slug: true, title: true, publishedAt: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <section className="pc-wrap pc-account pc-section" style={{ paddingBottom: 72 }}>
      <Notice code={code} />
      <div className="pc-account__head">
        <div>
          <strong style={{ fontFamily: 'var(--pc-serif)', fontSize: 24 }}>{user.name}</strong>
          <div className="pc-meta">{user.email} · সদস্য: {formatDate(user.createdAt)}</div>
        </div>
        {isEditor(user.role) && <Link className="pc-btn pc-btn--ghost pc-btn--small" href="/admin">প্যানেলে যান</Link>}
      </div>

      <h2>আমার জমা দেওয়া লেখা</h2>
      {submissions.length ? (
        <ul className="pc-account__list">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <span>{submission.title}<br /><small className="pc-meta">{submission.category?.name} · {formatDate(submission.createdAt)}</small></span>
              <StatusBadge status={submission.status} />
            </li>
          ))}
        </ul>
      ) : <div className="pc-empty">আপনি এখনো কোনো লেখা জমা দেননি। <Link href="/submit">লেখা পাঠান</Link></div>}

      <h2>সংরক্ষিত লেখা</h2>
      {saved.length ? (
        <ul className="pc-account__list">
          {saved.map((item) => (
            <li key={item.post.id}>
              <Link href={`/posts/${item.post.slug}`}>{item.post.title}</Link>
              <span className="pc-meta">{formatDate(item.post.publishedAt)}</span>
            </li>
          ))}
        </ul>
      ) : <div className="pc-empty">আপনি এখনো কোনো লেখা সংরক্ষণ করেননি।</div>}

      {user.avatarUrl && <p className="pc-mt"><img src={publicUrl(user.avatarUrl)} alt="" width={72} style={{ borderRadius: '50%' }} /></p>}
      <p className="pc-muted pc-mt">অবস্থার অর্থ: {Object.entries(STATUS_LABELS).map(([, label]) => label).join(' → ')}</p>
    </section>
  )
}

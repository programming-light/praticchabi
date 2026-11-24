import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, issueOrderUrl, STATUS_LABELS } from '@/lib/config'
import { publicUrl } from '@/lib/storage'
import { StatusBadge } from '@/components/ui'
import AdminForm from '@/components/admin/AdminForm'
import IssueReleaseForm from '@/components/admin/IssueReleaseForm'

export default async function AdminDashboard() {
  const [newSubmissions, totalSubmissions, unreadMessages, subscribers, readers, published, recentSubmissions, recentMessages, currentIssue, issues] = await Promise.all([
    prisma.submission.count({ where: { status: 'NEW' } }),
    prisma.submission.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.subscriber.count(),
    prisma.user.count({ where: { role: 'READER' } }),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.submission.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.issue.findFirst({ where: { isCurrent: true } }),
    prisma.issue.findMany({ orderBy: [{ isCurrent: 'desc' }, { publishedAt: 'desc' }], take: 30 }),
  ])

  const hardCopyIssue = currentIssue || issues[0] || null

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

      <div className="admin-panel admin-hardcopy">
        <div className="admin-panel__head">
          <div>
            <h2>হার্ডকপি ব্যবস্থাপনা</h2>
            <p>মূল্য, সময়কাল, অর্ডার লিংক ও নতুন সংখ্যা প্রকাশ—সব কিছু এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <Link href="/admin/issues">সব সংখ্যা →</Link>
        </div>
        {hardCopyIssue ? (
          <div className="admin-hardcopy__grid">
            <div className="admin-hardcopy__preview">
              {hardCopyIssue.coverUrl
                ? <img src={publicUrl(hardCopyIssue.coverUrl)} alt={hardCopyIssue.title} />
                : <span className="pc-noimg" />}
              <span className={`admin-badge ${currentIssue ? 'admin-badge--PUBLISHED' : 'admin-badge--NEW'}`}>
                {currentIssue ? 'বর্তমান সংখ্যা' : 'ডিফল্ট সংখ্যা'}
              </span>
            </div>
            <div className="admin-hardcopy__info">
              <h3>{hardCopyIssue.title}</h3>
              <dl className="admin-dl">
                <dt>সময়কাল</dt><dd>{hardCopyIssue.period || '—'}</dd>
                <dt>মূল্য</dt><dd>{hardCopyIssue.price || 'মূল্য সেট করা হয়নি'}</dd>
                <dt>প্রকাশ</dt><dd>{formatDate(hardCopyIssue.publishedAt)}</dd>
                <dt>অর্ডার</dt>
                <dd><a href={issueOrderUrl(hardCopyIssue)} target="_blank" rel="noopener">
                  {hardCopyIssue.orderUrl ? 'কাস্টম লিংক ↗' : 'WhatsApp লিংক ↗'}
                </a></dd>
              </dl>
              <div className="pc-actions">
                <Link className="admin-btn-link admin-btn-link--ghost" href={`/admin/issues/${hardCopyIssue.id}/edit`}>সম্পূর্ণ সম্পাদনা</Link>
                <Link className="admin-btn-link admin-btn-link--ghost" href={`/issues/${hardCopyIssue.slug}`} target="_blank">সাইটে দেখুন ↗</Link>
              </div>
            </div>
            <div className="admin-hardcopy__edit">
              <h3>দ্রুত হালনাগাদ</h3>
              <AdminForm action={`/api/admin/issues/${hardCopyIssue.id}/hardcopy`} button="হার্ডকপি আপডেট করুন" redirect="/admin">
                <div className="admin-form__row">
                  <label>
                    সময়কাল
                    <input type="text" name="period" defaultValue={hardCopyIssue.period || ''} placeholder="জানুয়ারি–মার্চ ২০২৬" />
                  </label>
                  <label>
                    মূল্য
                    <input type="text" name="price" defaultValue={hardCopyIssue.price || ''} placeholder="যেমন: ২০০ টাকা" />
                  </label>
                </div>
                <label>
                  অর্ডার লিংক
                  <input type="url" name="orderUrl" defaultValue={hardCopyIssue.orderUrl || ''} placeholder="খালি রাখলে WhatsApp ব্যবহার হবে" />
                </label>
                <label>
                  প্রকাশের তারিখ
                  <input type="date" name="releasedAt" defaultValue={hardCopyIssue.publishedAt.toISOString().slice(0, 10)} />
                </label>
                <label>
                  সংক্ষিপ্ত বিবরণ
                  <textarea name="description" rows={2} defaultValue={hardCopyIssue.description || ''} />
                </label>
                <label>
                  নতুন প্রচ্ছদ (ঐচ্ছিক)
                  <input type="file" name="cover" accept="image/*" />
                </label>
              </AdminForm>
            </div>
            <div className="admin-hardcopy__release">
              <h3>নতুন সংস্করণ প্রকাশ</h3>
              <p>যে সংখ্যাটি বাছাই করবেন সেটিই হোমপেজের হার্ডকপি কার্ডে দেখা যাবে।</p>
              <IssueReleaseForm
                issues={issues.map((issue) => ({ id: issue.id, title: issue.title }))}
                currentId={hardCopyIssue.id}
              />
              <Link className="admin-btn-link" href="/admin/issues/new">নতুন সংখ্যা তৈরি করুন</Link>
            </div>
          </div>
        ) : (
          <div className="admin-empty">
            এখনো কোনো হার্ডকপি সংখ্যা যোগ করা হয়নি।{' '}
            <Link href="/admin/issues/new">প্রথম সংখ্যা তৈরি করুন →</Link>
          </div>
        )}
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

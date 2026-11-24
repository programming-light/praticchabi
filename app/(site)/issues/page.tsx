import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, issueOrderUrl } from '@/lib/config'
import { PageHead, Pagination, PostImage } from '@/components/ui'
import { publicUrl } from '@/lib/storage'

const PER_PAGE = 12

export default async function IssuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)
  const [total, issues] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.findMany({
      orderBy: [{ isCurrent: 'desc' }, { publishedAt: 'desc' }],
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
    }),
  ])

  return (
    <>
      <PageHead title="সংখ্যা আর্কাইভ" description="প্রতিচ্ছবির প্রকাশিত সব সংখ্যা এক নজরে।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {issues.length ? (
          <>
            <div className="pc-grid pc-grid--issues">
              {issues.map((issue, index) => (
                <article className={`pc-issuecard${page === 1 && index === 0 ? ' is-latest' : ''}`} key={issue.id}>
                  <Link className="pc-issuecard__cover" href={`/issues/${issue.slug}`}>
                    {issue.coverUrl ? <img src={publicUrl(issue.coverUrl)} alt={issue.title} loading="lazy" /> : null}
                  </Link>
                  <div className="pc-issuecard__body">
                    {issue.isCurrent
                      ? <span className="pc-label">বর্তমান হার্ডকপি</span>
                      : page === 1 && index === 0 ? <span className="pc-label">সর্বশেষ সংখ্যা</span> : null}
                    <h2><Link href={`/issues/${issue.slug}`}>{issue.title}</Link></h2>
                    {issue.period && <span className="pc-meta">{issue.period}</span>}
                    {issue.price && <span className="pc-meta">মূল্য: {issue.price}</span>}
                    <span className="pc-meta">{bn(issue._count.posts)}টি লেখা</span>
                    <div className="pc-actions" style={{ marginTop: 8 }}>
                      <a className="pc-btn pc-btn--small" href={issueOrderUrl(issue)} target="_blank" rel="noopener">হার্ডকপি অর্ডার</a>
                      <Link className="pc-btn pc-btn--ghost pc-btn--small" href={`/issues/${issue.slug}`}>লেখাগুলো পড়ুন</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="pc-pagination-wrap"><Pagination page={page} pages={Math.ceil(total / PER_PAGE)} path="/issues" /></div>
          </>
        ) : (
          <div className="pc-empty">এখনো কোনো সংখ্যা যোগ করা হয়নি।</div>
        )}
      </section>
    </>
  )
}

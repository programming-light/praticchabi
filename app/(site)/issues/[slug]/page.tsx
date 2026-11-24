import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate, issueOrderUrl } from '@/lib/config'
import { publishedPosts } from '@/lib/queries'
import { PageHead, PostCard } from '@/components/ui'
import { publicUrl } from '@/lib/storage'

export default async function IssueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const issue = await prisma.issue.findUnique({ where: { slug } })
  if (!issue) notFound()

  const posts = await publishedPosts({ where: { issueId: issue.id }, take: 200 })
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <>
      <PageHead title={issue.title} description={issue.period || undefined} />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        <div className="pc-issueband" style={{ marginTop: 0, borderRadius: 10 }}>
          <div className="pc-issue" style={{ paddingTop: 36, paddingBottom: 36 }}>
            {issue.coverUrl && (
              <div className="pc-issue__cover" style={{ flexBasis: 220 }}>
                <img src={publicUrl(issue.coverUrl)} alt={issue.title} />
              </div>
            )}
            <div className="pc-issue__info">
              <span className="pc-label">{issue.period || 'নতুন সংখ্যা'}</span>
              <h2>{issue.title}</h2>
              {issue.description && <p>{issue.description}</p>}
              <p>ছাপা হার্ডকপি{issue.price ? `। মূল্য: ${issue.price}` : ''}</p>
              <div className="pc-actions">
                <a className="pc-btn pc-btn--white" href={issueOrderUrl(issue)} target="_blank" rel="noopener">হার্ডকপি অর্ডার করুন</a>
                <Link className="pc-btn pc-btn--line" href="/issues">সব সংখ্যা</Link>
              </div>
              <span className="pc-meta">প্রকাশ: {formatDate(issue.publishedAt)}</span>
            </div>
          </div>
        </div>

        {categories.map((category) => {
          const sectionPosts = posts.filter((post) => post.categoryId === category.id)
          if (!sectionPosts.length) return null
          return (
            <section key={category.id} style={{ marginTop: 44 }}>
              <div className="pc-sechead"><h2 className="pc-h2">{category.name}</h2><Link href={`/category/${category.slug}`}>সব লেখা</Link></div>
              <div className="pc-grid">{sectionPosts.map((post) => <PostCard post={post} key={post.id} />)}</div>
            </section>
          )
        })}

        {posts.length === 0 && <div className="pc-empty" style={{ marginTop: 32 }}>এই সংখ্যায় এখনো কোনো লেখা যোগ করা হয়নি।</div>}
      </section>
    </>
  )
}

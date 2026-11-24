import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, issueOrderUrl, SITE, excerpt } from '@/lib/config'
import { getCategories, getIssues, postInclude, publishedPosts, type PublicPost } from '@/lib/queries'
import { publicUrl } from '@/lib/storage'
import { Notice, PostCard, PostImage, PostRow, SectionHead } from '@/components/ui'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const categories = await getCategories()
  const issues = await getIssues(1)
  const latestIssue = issues[0]

  const [featuredBase, latest, popular, poetry, stories, activities, topAuthors] = await Promise.all([
    publishedPosts({ where: { featured: true, coverUrl: { not: null } }, take: 5 }),
    publishedPosts({ take: 6 }),
    publishedPosts({ take: 5, orderBy: [{ comments: { _count: 'desc' } }, { publishedAt: 'desc' }] }),
    publishedPosts({ where: { category: { slug: 'poetry' } }, take: 1 }),
    publishedPosts({ where: { category: { slug: 'short-story' } }, take: 3 }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 9 }),
    prisma.user.findMany({
      where: { posts: { some: { status: 'PUBLISHED' } } },
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { posts: { _count: 'desc' } },
      take: 6,
    }),
  ])

  const essayCategory = categories.find((category) => category.slug === 'essay')
  const featured = featuredBase.length
    ? featuredBase
    : await publishedPosts({ where: { category: { slug: 'essay' }, coverUrl: { not: null } }, take: 5 })

  const issuePosts: PublicPost[] = latestIssue
    ? await publishedPosts({ where: { issueId: latestIssue.id }, take: 5 })
    : []

  const categoryPosts = await Promise.all(
    categories.map(async (category) => publishedPosts({
      where: {
        categoryId: category.id,
        ...(category.slug === 'essay' ? { coverUrl: { not: null } } : {}),
      },
      take: 2,
    })),
  )

  const [bigFeature, ...restFeatures] = featured
  const sideColumns: PublicPost[][] = []
  for (let i = 0; i < restFeatures.length; i += 2) sideColumns.push(restFeatures.slice(i, i + 2))

  return (
    <>
      <section className="pc-band">
        <div className="pc-band__inner">
          <h1 className="pc-band__tagline">{SITE.tagline}</h1>
          <p className="pc-band__intro">
            আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম-এর একমাত্র সাহিত্য সাময়িকী <img src="/images/logo-inline.png" alt="ত্রৈমাসিক প্রতিচ্ছবি" />
          </p>
        </div>
      </section>

      <Notice code={one(params.pcp)} />

      {bigFeature && (
        <section className="pc-wrap pc-section">
          <SectionHead title="নির্বাচিত প্রবন্ধ" href="/category/essay" linkText="সব প্রবন্ধ" />
          <div className="pc-featured">
            <Link className="pc-featured__big" href={`/posts/${bigFeature.slug}`}>
              <div className="pc-card__img"><PostImage url={bigFeature.coverUrl} alt={bigFeature.title} /></div>
              <span className="pc-cat">{bigFeature.category?.name}</span>
              <h3>{bigFeature.title}</h3>
              <p>{excerpt(bigFeature.content, 32)}</p>
              <span className="pc-meta">{bigFeature.author.name} · {formatDate(bigFeature.publishedAt || bigFeature.createdAt)}</span>
            </Link>
            {sideColumns.map((column, index) => (
              <div className="pc-featured__sidecol" key={index}>
                {column.map((post) => <PostCard post={post} key={post.id} />)}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pc-wrap pc-section">
        <div className="pc-twocol">
          <div className="pc-twocol__main">
            <div className="pc-headline"><h2>সর্বশেষ লেখা</h2><Link href="/search">সব লেখা</Link></div>
            {latest.length ? latest.map((post) => <PostRow post={post} key={post.id} />) : <div className="pc-empty">এখনো কোনো লেখা প্রকাশিত হয়নি।</div>}
          </div>
          <aside className="pc-twocol__side">
            <div className="pc-popular">
              <div className="pc-headline"><h2>জনপ্রিয় লেখা</h2></div>
              {popular.map((post, index) => (
                <Link href={`/posts/${post.slug}`} key={post.id}>
                  <b>{bn(index + 1)}</b>
                  <div><h3>{post.title}</h3><span className="pc-meta">{post.author.name}</span></div>
                </Link>
              ))}
            </div>
            <div>
              <div className="pc-headline"><h2>বিভাগ</h2></div>
              <div className="pc-tags">
                {categories.map((category) => (
                  <Link href={`/category/${category.slug}`} key={category.id}>{category.name}</Link>
                ))}
              </div>
            </div>
            <div className="pc-sidecta">
              <h2>আপনার লেখা পাঠান</h2>
              <p>মৌলিক বাংলা লেখা, .docx ফরম্যাটে, ১৫০০-৩০০০ শব্দের মধ্যে।</p>
              <div><Link className="pc-btn pc-btn--white" href="/submit">লেখা জমা দিন</Link></div>
            </div>
          </aside>
        </div>
      </section>

      {latestIssue && (
        <section className="pc-issueband">
          <div className="pc-issue">
            {latestIssue.coverUrl && (
              <div className="pc-issue__cover">
                <img src={publicUrl(latestIssue.coverUrl)} alt={latestIssue.title} />
              </div>
            )}
            <div className="pc-issue__info">
              <span className="pc-label">সর্বশেষ সংখ্যা</span>
              <h2>{latestIssue.title}</h2>
              {latestIssue.period && <p style={{ fontSize: 17, color: '#fff' }}>{latestIssue.period}</p>}
              <p>ছাপা হার্ডকপি{latestIssue.price ? `। মূল্য: ${latestIssue.price}` : ''}</p>
              <div className="pc-actions" style={{ marginTop: 6 }}>
                <a className="pc-btn pc-btn--white" href={issueOrderUrl(latestIssue)} target="_blank" rel="noopener">হার্ডকপি অর্ডার করুন</a>
                <Link className="pc-btn pc-btn--line" href="/issues">সব সংখ্যা</Link>
              </div>
              {issuePosts.length > 0 && (
                <div className="pc-toc">
                  <h3>এই সংখ্যার লেখা</h3>
                  {issuePosts.map((post) => (
                    <Link href={`/posts/${post.slug}`} key={post.id}>
                      <span className="pc-label">{post.category?.name}</span>
                      <strong>{post.title}</strong>
                      <span className="pc-meta">{post.author.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(poetry.length > 0 || stories.length > 0) && (
        <section className="pc-sand">
          <div className="pc-wrap">
            <div className="pc-spot">
              <div className="pc-sechead" style={{ margin: 0 }}><h2 className="pc-h2">কবিতা</h2><Link href="/category/poetry">সব কবিতা</Link></div>
              {poetry.map((post) => (
                <Link className="pc-poem" href={`/posts/${post.slug}`} key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{excerpt(post.content, 28)}</p>
                  <span className="pc-meta">{post.author.name}</span>
                </Link>
              ))}
            </div>
            <div className="pc-spot">
              <div className="pc-sechead" style={{ margin: 0 }}><h2 className="pc-h2">ছোটগল্প</h2><Link href="/category/short-story">সব গল্প</Link></div>
              {stories.map((post) => (
                <Link className="pc-mini" href={`/posts/${post.slug}`} key={post.id}>
                  <div className="pc-mini__img"><PostImage url={post.coverUrl} alt={post.title} /></div>
                  <div>
                    <h3>{post.title}</h3>
                    <p>{excerpt(post.content, 14)}</p>
                    <span className="pc-meta">{post.author.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section className="pc-wrap pc-section" style={{ paddingTop: 52 }}>
          <h2 className="pc-h2" style={{ marginBottom: 6 }}>আমাদের কার্যক্রম</h2>
          <p className="pc-lead">পাঠপ্রাঙ্গনের বিভিন্ন আয়োজন ও অনুষ্ঠানের ছবি।</p>
          <div className="pc-gallery">
            {activities.map((activity) => (
              <figure key={activity.id}>
                <div className="pc-gallery__img">
                  {activity.imageUrl ? <img src={publicUrl(activity.imageUrl)} alt={activity.caption} loading="lazy" /> : <span className="pc-noimg" />}
                </div>
                <figcaption>{activity.caption}{activity.dateLabel && <span className="pc-meta"> · {activity.dateLabel}</span>}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {topAuthors.length > 0 && (
        <section className="pc-wrap pc-section" style={{ paddingTop: 52 }}>
          <SectionHead title="আমাদের লেখক" href="/authors" linkText="সব লেখক" />
          <div className="pc-strip">
            {topAuthors.map((author) => (
              <Link className="pc-person" href={`/author/${author.id}`} key={author.id}>
                {author.avatarUrl
                  ? <img src={publicUrl(author.avatarUrl)} alt="" style={{ width: 92, height: 92 }} />
                  : <span className="pc-noimg" style={{ width: 92, height: 92, borderRadius: '50%' }} />}
                <h3>{author.name}</h3>
                <span className="pc-meta">{bn(author._count.posts)}টি লেখা</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="pc-wrap pc-section" style={{ paddingTop: 52 }}>
        <SectionHead title="বিভাগসমূহ" />
        <div className="pc-catgrid">
          {categories.map((category, index) => (
            <div className="pc-catcard" key={category.id}>
              <div className="pc-catcard__head">
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
                <Link href={`/category/${category.slug}`}>সব লেখা</Link>
              </div>
              {categoryPosts[index].map((post) => (
                <Link className="pc-catcard__item" href={`/posts/${post.slug}`} key={post.id}>
                  <div className="pc-catcard__thumb"><PostImage url={post.coverUrl} alt={post.title} /></div>
                  <div><h3>{post.title}</h3><span className="pc-meta">{post.author.name}</span></div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="pc-wrap pc-ctas">
        <div className="pc-cta">
          <h2>পাঠক হিসেবে যুক্ত হোন</h2>
          <p>পছন্দের লেখা সংরক্ষণ করুন, মন্তব্য করুন।</p>
          <div className="pc-actions">
            <Link className="pc-btn" href="/login#register">নিবন্ধন করুন</Link>
            <Link className="pc-btn pc-btn--ghost" href="/login">লগইন</Link>
          </div>
        </div>
        <div className="pc-cta pc-cta--sand">
          <h2>আপনিও লিখুন</h2>
          <p>মৌলিক বাংলা লেখা, .docx ফরম্যাটে, ১৫০০-৩০০০ শব্দের মধ্যে।</p>
          <Link className="pc-btn" href="/submit">নিয়মাবলি ও ফর্ম</Link>
        </div>
      </section>
    </>
  )
}

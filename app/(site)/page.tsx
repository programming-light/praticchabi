import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn, formatDate, issueOrderUrl, SITE, excerpt } from '@/lib/config'
import { getCategories, getIssues, publishedPosts, type PublicPost } from '@/lib/queries'
import { publicUrl } from '@/lib/storage'
import { settings } from '@/lib/settings'
import { Notice, PostImage, SectionHead, StoryCard } from '@/components/ui'
import FeaturedCarousel, { type FeaturedSlide } from '@/components/FeaturedCarousel'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const [categories, issues, config] = await Promise.all([
    getCategories(),
    getIssues(1),
    settings(),
  ])
  const latestIssue = issues[0]

  const [featuredBase, latest, popular, poetry, stories, activities, topAuthors] = await Promise.all([
    publishedPosts({ where: { featured: true }, take: 5 }),
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

  const featured = featuredBase.filter((post) => post.coverUrl).slice(0, 5)
  if (featured.length < 4) {
    for (const post of [...featuredBase, ...latest]) {
      if (featured.length >= 4) break
      if (!featured.some((item) => item.id === post.id)) featured.push(post)
    }
  }

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

  const featuredSlides: FeaturedSlide[] = featured.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: excerpt(post.content, 26),
    category: post.category?.name || 'প্রবন্ধ',
    author: post.author.name,
    date: formatDate(post.publishedAt || post.createdAt),
    image: publicUrl(post.coverUrl) || '/images/logo-inline.png',
    hasCover: Boolean(publicUrl(post.coverUrl)),
  }))

  return (
    <>
      {/* ---- Hero + featured carousel ---------------------------------- */}
      <section className="pcx-hero">
        <span className="pcx-hero__orb pcx-hero__orb--one" aria-hidden="true" />
        <span className="pcx-hero__orb pcx-hero__orb--two" aria-hidden="true" />
        <div className="pc-wrap pcx-hero__intro">
          <span className="pcx-kicker"><span className="pcx-kicker__dot" aria-hidden="true" />{SITE.name} · সাহিত্য সাময়িকী</span>
          <h1 className="pcx-hero__title">{SITE.tagline}</h1>
          <p className="pcx-hero__lead">
            আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম-এর একমাত্র সাহিত্য সাময়িকী{' '}
            <img src="/images/logo-inline.png" alt="ত্রৈমাসিক প্রতিচ্ছবি" />
          </p>
        </div>
        {(featuredSlides.length > 0 || latestIssue) && (
          <div className="pc-wrap pcx-hero__stage">
            {featuredSlides.length > 0
              ? <FeaturedCarousel slides={featuredSlides} />
              : <div className="pcx-hero__stagegap" />}
            {latestIssue && (
              <aside className="pcx-hardcopy" aria-label="হার্ডকপি সংস্করণ">
                <span className="pcx-hardcopy__glow" aria-hidden="true" />
                <div className="pcx-hardcopy__top">
                  <span className="pcx-hardcopy__badge">হার্ডকপি</span>
                  <span className="pcx-hardcopy__tag">এখনই অর্ডার করুন</span>
                </div>
                {latestIssue.coverUrl && (
                  <div className="pcx-hardcopy__cover">
                    <img src={publicUrl(latestIssue.coverUrl)} alt={latestIssue.title} loading="lazy" />
                  </div>
                )}
                <h2 className="pcx-hardcopy__title">{latestIssue.title}</h2>
                {latestIssue.period && <p className="pcx-hardcopy__period">{latestIssue.period}</p>}
                <div className="pcx-hardcopy__row">
                  {latestIssue.price && <span className="pcx-hardcopy__price">{latestIssue.price}</span>}
                  <span className="pcx-hardcopy__stock">সীমিত কপি</span>
                </div>
                <p className="pcx-hardcopy__desc">ছাপা হার্ডকপি হাতে পেতে এখনই অর্ডার করুন।</p>
                <a className="pcx-hardcopy__btn" href={issueOrderUrl(latestIssue)} target="_blank" rel="noopener">
                  অর্ডার করুন <Arrow />
                </a>
                <div className="pcx-hardcopy__foot">
                  <Link href={`/issues/${latestIssue.slug}`}>সংখ্যার বিবরণ</Link>
                  <span>{config.whatsapp_label}</span>
                </div>
              </aside>
            )}
          </div>
        )}
        {popular.length > 0 && (
          <div className="pc-wrap pcx-popular">
            <div className="pcx-popular__head">
              <span className="pcx-popular__eyebrow">পাঠকের পছন্দ</span>
              <h2>জনপ্রিয় লেখা</h2>
            </div>
            <div className="pcx-popular__list">
              {popular.map((post, index) => (
                <Link className="pcx-popular__item" href={`/posts/${post.slug}`} key={post.id}>
                  <span className="pcx-popular__num">{bn(index + 1)}</span>
                  <span className="pcx-popular__thumb"><PostImage url={post.coverUrl} alt={post.title} /></span>
                  <span className="pcx-popular__body">
                    <b>{post.title}</b>
                    <span className="pc-meta">{post.author.name} · {post.category?.name}</span>
                  </span>
                  <span className="pcx-popular__arrow" aria-hidden="true"><Arrow /></span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="pc-wrap pcx-catbar">
          {categories.slice(0, 8).map((category) => (
            <Link href={`/category/${category.slug}`} key={category.id}>{category.name}</Link>
          ))}
          <Link className="pcx-catbar__all" href="/category/essay">সব বিভাগ <Arrow /></Link>
        </div>
      </section>

      <Notice code={one(params.pcp)} />

      {/* ---- Latest + sidebar ------------------------------------------ */}
      <section className="pc-wrap pcx-section">
        <div className="pcx-sechead">
          <div>
            <span className="pcx-sechead__eyebrow">নতুন প্রকাশ</span>
            <h2>সর্বশেষ লেখা</h2>
          </div>
          <Link className="pcx-sechead__all" href="/search">সব লেখা <Arrow /></Link>
        </div>
        <div className="pcx-layout">
          <div className="pcx-layout__main">
            {latest.length ? (
              <div className="pcx-grid">
                {latest.map((post) => <StoryCard post={post} key={post.id} />)}
              </div>
            ) : <div className="pc-empty">এখনো কোনো লেখা প্রকাশিত হয়নি।</div>}
          </div>
          <aside className="pcx-layout__side">
            <div className="pcx-panel">
              <div className="pcx-panel__head"><h3>বিভাগ</h3></div>
              <div className="pcx-tags">
                {categories.map((category) => (
                  <Link href={`/category/${category.slug}`} key={category.id}>{category.name}</Link>
                ))}
              </div>
            </div>
            <div className="pcx-submitcard">
              <span className="pcx-submitcard__icon" aria-hidden="true">✎</span>
              <h3>আপনার লেখা পাঠান</h3>
              <p>মৌলিক বাংলা লেখা, .docx ফরম্যাটে, ১৫০০-৩০০০ শব্দের মধ্যে।</p>
              <Link className="pc-btn pc-btn--white" href="/submit">লেখা জমা দিন</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---- Latest issue ----------------------------------------------- */}
      {latestIssue && (
        <section className="pcx-issueband">
          <div className="pcx-issue">
            <div className="pcx-issue__art">
              {latestIssue.coverUrl && (
                <img src={publicUrl(latestIssue.coverUrl)} alt={latestIssue.title} loading="lazy" />
              )}
              <span className="pcx-issue__badge">সর্বশেষ সংখ্যা</span>
            </div>
            <div className="pcx-issue__body">
              <span className="pc-label--light">নতুন প্রকাশ</span>
              <h2>{latestIssue.title}</h2>
              {latestIssue.period && <p className="pcx-issue__period">{latestIssue.period}</p>}
              <p>ছাপা হার্ডকপি{latestIssue.price ? `। মূল্য: ${latestIssue.price}` : ''}</p>
              <div className="pc-actions" style={{ marginTop: 6 }}>
                <a className="pc-btn pc-btn--white" href={issueOrderUrl(latestIssue)} target="_blank" rel="noopener">হার্ডকপি অর্ডার করুন</a>
                <Link className="pc-btn pc-btn--line" href="/issues">সব সংখ্যা</Link>
              </div>
              {issuePosts.length > 0 && (
                <div className="pcx-toc">
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

      {/* ---- Poetry + short stories ------------------------------------- */}
      {(poetry.length > 0 || stories.length > 0) && (
        <section className="pc-sand">
          <div className="pc-wrap pcx-spots">
            {poetry.length > 0 && (
              <div className="pc-spot">
                <SectionHead title="কবিতা" href="/category/poetry" linkText="সব কবিতা" />
                {poetry.map((post) => (
                  <Link className="pc-poem" href={`/posts/${post.slug}`} key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{excerpt(post.content, 28)}</p>
                    <span className="pc-meta">{post.author.name}</span>
                  </Link>
                ))}
              </div>
            )}
            {stories.length > 0 && (
              <div className="pc-spot">
                <SectionHead title="ছোটগল্প" href="/category/short-story" linkText="সব গল্প" />
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
            )}
          </div>
        </section>
      )}

      {/* ---- Gallery ----------------------------------------------------- */}
      {activities.length > 0 && (
        <section className="pc-wrap pcx-section">
          <div className="pcx-sechead">
            <div>
              <span className="pcx-sechead__eyebrow">পাঠপ্রাঙ্গন</span>
              <h2>আমাদের কার্যক্রম</h2>
            </div>
          </div>
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

      {/* ---- Writers ------------------------------------------------------ */}
      {topAuthors.length > 0 && (
        <section className="pc-wrap pcx-section">
          <div className="pcx-sechead">
            <div>
              <span className="pcx-sechead__eyebrow">কলমের অধিপতি</span>
              <h2>আমাদের লেখক</h2>
            </div>
            <Link className="pcx-sechead__all" href="/authors">সব লেখক <Arrow /></Link>
          </div>
          <div className="pc-strip">
            {topAuthors.map((author) => (
              <Link className="pc-person" href={`/author/${author.id}`} key={author.id}>
                <span className="pc-person__avatar">
                  {author.avatarUrl
                    ? <img src={publicUrl(author.avatarUrl)} alt="" loading="lazy" />
                    : <span className="pc-noimg" />}
                </span>
                <h3>{author.name}</h3>
                <span className="pc-meta">{bn(author._count.posts)}টি লেখা</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---- Categories --------------------------------------------------- */}
      <section className="pc-wrap pcx-section">
        <div className="pcx-sechead">
          <div>
            <span className="pcx-sechead__eyebrow">বিষয়ভিত্তিক সংগ্রহ</span>
            <h2>বিভাগসমূহ</h2>
          </div>
        </div>
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

      {/* ---- Join / submit ------------------------------------------------ */}
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

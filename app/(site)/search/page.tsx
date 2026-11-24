import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn } from '@/lib/config'
import { publishedPosts } from '@/lib/queries'
import { Pagination, StoryCard } from '@/components/ui'

const PER_PAGE = 12

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
  </svg>
)

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const raw = Array.isArray(params.q) ? params.q[0] : params.q
  const q = (raw || '').trim()
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)

  const where = q ? {
    OR: [
      { title: { contains: q } },
      { content: { contains: q } },
      { excerpt: { contains: q } },
      { category: { name: { contains: q } } },
      { author: { name: { contains: q } } },
    ],
  } : {}

  const [total, posts] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED', ...where } }),
    publishedPosts({ where, take: PER_PAGE, skip: (page - 1) * PER_PAGE }),
  ])

  return (
    <>
      <section className="pcx-searchhead">
        <span className="pcx-searchhead__orb" aria-hidden="true" />
        <div className="pc-wrap pcx-searchhead__inner">
          <span className="pcx-sechead__eyebrow">খোঁজার ঘর</span>
          <h1>খুঁজুন</h1>
          <p>শিরোনাম, লেখা, বিভাগ বা লেখকের নাম দিয়ে প্রিয় লেখাটি খুঁজে নিন।</p>
          <form className="pcx-searchform" action="/search" method="get">
            <span className="pcx-searchform__icon"><SearchIcon /></span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="শব্দ লিখুন…"
              aria-label="খুঁজুন"
            />
            {q && <Link className="pcx-searchform__clear" href="/search" aria-label="খোঁজা মুছুন">×</Link>}
            <button className="pcx-searchform__btn" type="submit">খুঁজুন <Arrow /></button>
          </form>
          {q && <p className="pcx-searchhead__hint">“{q}” — এর জন্য <b>{bn(total)}</b>টি ফলাফল পাওয়া গেছে।</p>}
        </div>
      </section>

      <section className="pc-wrap pcx-section pcx-searchresults">
        <div className="pcx-sechead">
          <div>
            <span className="pcx-sechead__eyebrow">ফলাফল</span>
            <h2>{q ? `“${q}”` : 'সম্প্রতিক লেখা'}</h2>
          </div>
          <span className="pcx-count">{bn(total)}টি লেখা</span>
        </div>
        {posts.length ? (
          <div className="pcx-grid">
            {posts.map((post) => <StoryCard post={post} key={post.id} />)}
          </div>
        ) : (
          <div className="pcx-empty-modern">
            <span className="pcx-empty-modern__icon"><SearchIcon /></span>
            <h3>কিছু পাওয়া যায়নি</h3>
            <p>অন্য শব্দ দিয়ে আবার চেষ্টা করুন, অথবা সব লেখা দেখুন।</p>
            <Link className="pc-btn" href="/search">সব লেখা দেখুন</Link>
          </div>
        )}
        <div className="pcx-searchresults__pages">
          <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} path="/search" query={q ? { q } : undefined} />
        </div>
      </section>
    </>
  )
}

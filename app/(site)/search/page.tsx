import { prisma } from '@/lib/db'
import { publishedPosts, postInclude } from '@/lib/queries'
import { Empty, PageHead, Pagination, PostRow } from '@/components/ui'

const PER_PAGE = 12

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
      <PageHead title="খুঁজুন" description={q ? `“${q}” এর জন্য ${total}টি ফলাফল পাওয়া গেছে।` : 'শিরোনাম, লেখা বা লেখক দিয়ে খুঁজুন।'}>
        <form action="/search" method="get" className="pc-form" style={{ maxWidth: 620, marginTop: 24 }}>
          <div className="pc-inline">
            <input type="search" name="q" defaultValue={q} placeholder="শব্দ লিখুন…" style={{ flex: '1 1 260px' }} aria-label="খুঁজুন" />
            <button className="pc-btn" type="submit">খুঁজুন</button>
          </div>
        </form>
      </PageHead>
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {posts.length ? posts.map((post) => <PostRow post={post} key={post.id} />) : <Empty>কোনো লেখা পাওয়া যায়নি।</Empty>}
        <div style={{ marginTop: 28 }}>
          <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} path="/search" query={q ? { q } : undefined} />
        </div>
      </section>
    </>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCategories, publishedPostCount, publishedPosts } from '@/lib/queries'
import { Empty, PageHead, Pagination, PostRow } from '@/components/ui'

const PER_PAGE = 12

export default async function CategoryPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const categories = await getCategories()
  const category = categories.find((item) => item.slug === slug)
  if (!category) notFound()

  const where = { categoryId: category.id, ...(slug === 'essay' ? { coverUrl: { not: null } } : {}) }
  const [total, posts] = await Promise.all([
    publishedPostCount(where),
    publishedPosts({ where, take: PER_PAGE, skip: (page - 1) * PER_PAGE }),
  ])

  return (
    <>
      <PageHead title={category.name} description={category.description || undefined}>
        <div className="pc-chips">
          {categories.map((item) => (
            <Link className={`pc-chip${item.id === category.id ? ' is-active' : ''}`} href={`/category/${item.slug}`} key={item.id}>
              {item.name}
            </Link>
          ))}
        </div>
      </PageHead>
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {posts.length ? posts.map((post) => <PostRow post={post} key={post.id} />) : <Empty>এই বিভাগে এখনো কোনো লেখা নেই।</Empty>}
        <div style={{ marginTop: 28 }}>
          <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} path={`/category/${slug}`} />
        </div>
      </section>
    </>
  )
}

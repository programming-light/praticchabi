import { PageHead, PostRow } from '@/components/ui'
import { publishedPosts } from '@/lib/queries'

export default async function FeaturedPage() {
  const posts = await publishedPosts({ where: { featured: true }, take: 50 })
  return (
    <>
      <PageHead title="নির্বাচিত লেখা" description="সম্পাদকদের বেছে নেওয়া উল্লেখযোগ্য লেখাসমূহ।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {posts.length ? posts.map((post) => <PostRow post={post} key={post.id} />) : <div className="pc-empty">এখনো কোনো লেখা নির্বাচিত করা হয়নি।</div>}
      </section>
    </>
  )
}

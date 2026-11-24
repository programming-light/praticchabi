import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { publishedPosts } from '@/lib/queries'
import { PageHead, PostRow } from '@/components/ui'
import { publicUrl } from '@/lib/storage'

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const author = await prisma.user.findUnique({ where: { id } })
  if (!author) notFound()
  const posts = await publishedPosts({ where: { authorId: author.id }, take: 100 })

  return (
    <>
      <PageHead title={author.name} description={author.bio || 'ত্রৈমাসিক প্রতিচ্ছবির লেখক।'} />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {author.avatarUrl && (
          <img src={publicUrl(author.avatarUrl)} alt={author.name} style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover' }} />
        )}
        {posts.length ? posts.map((post) => <PostRow post={post} key={post.id} />) : <div className="pc-empty">এই লেখকের এখনো কোনো প্রকাশিত লেখা নেই।</div>}
      </section>
    </>
  )
}

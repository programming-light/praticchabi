import Link from 'next/link'
import { prisma } from '@/lib/db'
import { bn } from '@/lib/config'
import { PageHead } from '@/components/ui'
import { publicUrl } from '@/lib/storage'

export default async function AuthorsPage() {
  const authors = await prisma.user.findMany({
    where: { posts: { some: { status: 'PUBLISHED' } } },
    include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
    orderBy: { name: 'asc' },
    take: 300,
  })

  return (
    <>
      <PageHead title="লেখকবৃন্দ" description="প্রতিচ্ছবিতে লেখা প্রকাশ করা লেখকদের সাথে পরিচিত হোন।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        {authors.length ? (
          <div className="pc-grid pc-grid--people">
            {authors.map((author) => (
              <Link className="pc-person" href={`/author/${author.id}`} key={author.id}>
                {author.avatarUrl
                  ? <img src={publicUrl(author.avatarUrl)} alt="" style={{ width: 96, height: 96 }} />
                  : <span className="pc-noimg" style={{ width: 96, height: 96, borderRadius: '50%' }} />}
                <h2>{author.name}</h2>
                <span className="pc-meta">{bn(author._count.posts)}টি লেখা</span>
              </Link>
            ))}
          </div>
        ) : <div className="pc-empty">এখনো কোনো লেখক যোগ করা হয়নি।</div>}
      </section>
    </>
  )
}

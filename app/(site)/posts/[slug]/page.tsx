import Link from 'next/link'
import { notFound } from 'next/navigation'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { bn, formatDate, readingMinutes } from '@/lib/config'
import { getPostBySlug, publishedPosts } from '@/lib/queries'
import { publicUrl } from '@/lib/storage'
import { PostCard } from '@/components/ui'
import SaveButton from '@/components/forms/SaveButton'
import CommentForm from '@/components/forms/CommentForm'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [user, comments, related] = await Promise.all([
    currentUser(),
    prisma.comment.findMany({
      where: { postId: post.id, approved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    publishedPosts({ where: { categoryId: post.categoryId || '__none__' }, take: 4 }),
  ])
  const saved = user
    ? Boolean(await prisma.savedArticle.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } } }))
    : false
  const others = related.filter((item) => item.id !== post.id).slice(0, 3)
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/posts/${post.slug}`

  return (
    <article>
      <div className="pc-article">
        {post.category && <Link className="pc-chip" href={`/category/${post.category.slug}`}>{post.category.name}</Link>}
        <h1>{post.title}</h1>
        <div className="pc-article__meta">
          <Link href={`/author/${post.author.id}`}><strong>{post.byline || post.author.name}</strong></Link>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          {post.issue && <Link href={`/issues/${post.issue.slug}`}>{post.issue.title}</Link>}
        </div>
        <div className="pc-article__bar">
          <span>পড়তে সময় লাগবে প্রায় {bn(readingMinutes(post.content))} মিনিট</span>
          <SaveButton
            postId={post.id}
            saved={saved}
            loggedIn={Boolean(user)}
            loginUrl={`/login?next=${encodeURIComponent(`/posts/${post.slug}`)}`}
          />
        </div>
        {post.coverUrl && (
          <div className="pc-article__hero"><img src={publicUrl(post.coverUrl)} alt={post.title} /></div>
        )}
        <div className="pc-prose" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="pc-share">
          <strong>লেখাটি শেয়ার করুন:</strong>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`} target="_blank" rel="noopener">ফেসবুক</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}`} target="_blank" rel="noopener">হোয়াটসঅ্যাপ</a>
        </div>

        <div className="pc-authorbox">
          {post.author.avatarUrl
            ? <img src={publicUrl(post.author.avatarUrl)} alt="" width={72} height={72} style={{ borderRadius: '50%' }} />
            : <span className="pc-noimg" style={{ width: 72, height: 72, borderRadius: '50%' }} />}
          <div className="pc-authorbox__text">
            <span className="pc-label">লেখক পরিচিতি</span>
            <h3><Link href={`/author/${post.author.id}`}>{post.byline || post.author.name}</Link></h3>
            {post.author.bio && <p>{post.author.bio}</p>}
          </div>
        </div>
      </div>

      <section className="pc-comments">
        <h2>মন্তব্য ({bn(comments.length)})</h2>
        {comments.length ? (
          <ol>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{comment.user.name}</strong>
                <span className="pc-meta"> · {formatDate(comment.createdAt, true)}</span>
                <p>{comment.body}</p>
              </li>
            ))}
          </ol>
        ) : <p className="pc-muted">এখনো কোনো মন্তব্য নেই।</p>}
        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="pc-login-note">মন্তব্য করতে <Link href={`/login?next=${encodeURIComponent(`/posts/${post.slug}`)}`}>লগইন</Link> করুন।</p>
        )}
      </section>

      {others.length > 0 && (
        <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
          <div className="pc-sechead"><h2 className="pc-h2">আরও পড়ুন</h2><Link href="/search">সব লেখা</Link></div>
          <div className="pc-grid">{others.map((item) => <PostCard post={item} key={item.id} />)}</div>
        </section>
      )}
    </article>
  )
}

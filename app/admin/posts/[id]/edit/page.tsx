import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import PostForm from '@/components/admin/PostForm'
import { publicUrl } from '@/lib/storage'
import { formatDate } from '@/lib/config'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories, issues, authors] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } }),
    prisma.issue.findMany({ orderBy: { publishedAt: 'desc' }, select: { id: true, slug: true, title: true, period: true } }),
    prisma.user.findMany({ where: { role: { in: ['ADMIN', 'EDITOR', 'AUTHOR'] } }, orderBy: { name: 'asc' }, select: { id: true, name: true, email: true } }),
  ])
  if (!post) notFound()

  return (
    <>
      <p className="pc-mb">
        <Link href="/admin/posts">← সব লেখা</Link> · <Link href={`/posts/${post.slug}`} target="_blank">সাইটে দেখুন ↗</Link>
      </p>
      <div className="admin-grid2">
        <div className="admin-panel">
          <h2>লেখা সম্পাদনা</h2>
          <p className="admin-note">হালনাগাদ: {formatDate(post.updatedAt, true)} · {post.views} বার পড়া</p>
          <div className="pc-mt">
            <PostForm post={post} action={`/api/admin/posts/${id}`} categories={categories} issues={issues} authors={authors} />
          </div>
        </div>
        {post.coverUrl && (
          <div className="admin-panel">
            <h2>বর্তমান প্রচ্ছদ</h2>
            <img className="admin-preview" src={publicUrl(post.coverUrl)} alt={post.title} />
          </div>
        )}
      </div>
    </>
  )
}

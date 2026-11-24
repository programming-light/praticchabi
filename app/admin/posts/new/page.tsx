import Link from 'next/link'
import { prisma } from '@/lib/db'
import PostForm from '@/components/admin/PostForm'

export default async function NewPostPage() {
  const [categories, issues, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } }),
    prisma.issue.findMany({ orderBy: { publishedAt: 'desc' }, select: { id: true, slug: true, title: true, period: true } }),
    prisma.user.findMany({ where: { role: { in: ['ADMIN', 'EDITOR', 'AUTHOR'] } }, orderBy: { name: 'asc' }, select: { id: true, name: true, email: true } }),
  ])

  return (
    <>
      <p className="pc-mb"><Link href="/admin/posts">← সব লেখা</Link></p>
      <div className="admin-panel">
        <h2>নতুন লেখা</h2>
        <PostForm action="/api/admin/posts" categories={categories} issues={issues} authors={authors} />
      </div>
    </>
  )
}

import type { Prisma } from '../generated/prisma-pg'
import { prisma } from './db'

export const postInclude = {
  author: { select: { id: true, name: true, avatarUrl: true, bio: true, email: true } },
  category: { select: { id: true, slug: true, name: true } },
  issue: { select: { id: true, slug: true, title: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude

export type PublicPost = Prisma.PostGetPayload<{ include: typeof postInclude }>

export async function publishedPosts(options: {
  where?: Prisma.PostWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[]
} = {}) {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED', ...options.where },
    include: postInclude,
    orderBy: options.orderBy || [{ publishedAt: 'desc' }],
    take: options.take ?? 10,
    skip: options.skip ?? 0,
  })
}

export async function publishedPostCount(where: Prisma.PostWhereInput = {}) {
  return prisma.post.count({ where: { status: 'PUBLISHED', ...where } })
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
}

export async function getIssues(take = 50) {
  return prisma.issue.findMany({ orderBy: { publishedAt: 'desc' }, take })
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: postInclude,
  })
}

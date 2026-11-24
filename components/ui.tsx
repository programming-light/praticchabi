import Link from 'next/link'
import { Fragment } from 'react'
import { MESSAGES, bn, excerpt, formatDate, STATUS_LABELS, statusClass } from '@/lib/config'
import type { PublicPost } from '@/lib/queries'
import { publicUrl } from '@/lib/storage'

export function Notice({ code }: { code?: string }) {
  if (!code || !MESSAGES[code]) return null
  const message = MESSAGES[code]
  return <div className={`pc-notice pc-notice--${message.type}`} role="status">{message.text}</div>
}

export function PageHead({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="pc-pagehead">
      <div className="pc-wrap">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </section>
  )
}

export function SectionHead({ title, href, linkText }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="pc-sechead">
      <h2 className="pc-h2">{title}</h2>
      {href && <Link href={href}>{linkText || 'সব লেখা'}</Link>}
    </div>
  )
}

export function PostImage({ url, alt }: { url?: string | null; alt: string }) {
  // Every post thumbnail falls back to the Protichobi wordmark when no cover is set.
  const src = publicUrl(url) || '/images/logo-left.png'
  return <img src={src} alt={alt} loading="lazy" />
}

export function PostCard({ post }: { post: PublicPost }) {
  return (
    <Link className="pc-card" href={`/posts/${post.slug}`}>
      <div className="pc-card__img"><PostImage url={post.coverUrl} alt={post.title} /></div>
      <div className="pc-card__body">
        <span className="pc-cat">{post.category?.name}</span>
        <h3 className="pc-card__title">{post.title}</h3>
        <span className="pc-meta">{post.author.name} · {formatDate(post.publishedAt || post.createdAt)}</span>
      </div>
    </Link>
  )
}

/** Modern editorial card used on the home page and archive grids. */
export function StoryCard({ post }: { post: PublicPost }) {
  return (
    <Link className="pc-story" href={`/posts/${post.slug}`}>
      <div className="pc-story__img"><PostImage url={post.coverUrl} alt={post.title} /></div>
      <div className="pc-story__body">
        <span className="pc-cat">{post.category?.name}</span>
        <h3 className="pc-story__title">{post.title}</h3>
        <p className="pc-story__excerpt">{excerpt(post.content, 22)}</p>
        <span className="pc-story__foot">
          <span className="pc-meta">{post.author.name} · {formatDate(post.publishedAt || post.createdAt)}</span>
          <span className="pc-story__go" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </span>
        </span>
      </div>
    </Link>
  )
}

export function PostRow({ post }: { post: PublicPost }) {
  return (
    <Link className="pc-row" href={`/posts/${post.slug}`}>
      <div className="pc-row__body">
        <div className="pc-row__by">
          {post.author.avatarUrl && <img src={publicUrl(post.author.avatarUrl)} alt="" />}
          <span>{post.author.name}</span>
          <span className="pc-meta">· {post.category?.name}</span>
        </div>
        <h2 className="pc-row__title">{post.title}</h2>
        <p className="pc-row__excerpt">{excerpt(post.content, 28)}</p>
        <span className="pc-meta">{formatDate(post.publishedAt || post.createdAt)}</span>
      </div>
      <div className="pc-row__img"><PostImage url={post.coverUrl} alt={post.title} /></div>
    </Link>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <em className={statusClass(status)}>{STATUS_LABELS[status] || status}</em>
}

export function Pagination({ page, pages, path, query }: { page: number; pages: number; path: string; query?: Record<string, string> }) {
  if (pages <= 1) return null
  const href = (n: number) => {
    const params = new URLSearchParams(query || {})
    params.set('page', String(n))
    return `${path}?${params.toString()}`
  }
  return (
    <nav className="pc-pagination" aria-label="পাতা নির্বাচন">
      {page > 1 && <Link href={href(page - 1)}>আগের</Link>}
      {Array.from({ length: pages }, (_, index) => index + 1)
        .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
        .map((n, index, list) => (
          <Fragment key={n}>
            {index > 0 && n - list[index - 1] > 1 && <span className="pc-pagination__dots" aria-hidden="true">…</span>}
            {n === page ? <span aria-current="page">{bn(n)}</span> : <Link href={href(n)}>{bn(n)}</Link>}
          </Fragment>
        ))}
      {page < pages && <Link href={href(page + 1)}>পরের</Link>}
    </nav>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="pc-empty">{children}</div>
}

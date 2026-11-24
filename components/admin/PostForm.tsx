import AdminForm from './AdminForm'
import type { Category, Issue, User } from '@/lib/types'

type Post = {
  id: string
  title: string
  slug: string
  byline: string | null
  excerpt: string | null
  content: string
  coverUrl: string | null
  authorId: string
  categoryId: string | null
  issueId: string | null
  featured: boolean
  status: string
}

export default function PostForm({
  post, action, categories, issues, authors,
}: {
  post?: Post
  action: string
  categories: Category[]
  issues: Issue[]
  authors: User[]
}) {
  return (
    <AdminForm action={action} button={post ? 'সংরক্ষণ করুন' : 'লেখা তৈরি করুন'} redirect={post ? undefined : '/admin/posts'}>
      <label>
        শিরোনাম *
        <input type="text" name="title" required defaultValue={post?.title || ''} />
      </label>
      <div className="admin-form__row">
        <label>
          স্লাগ (URL)
          <input type="text" name="slug" defaultValue={post?.slug || ''} placeholder="খালি রাখলে শিরোনাম থেকে তৈরি হবে" />
        </label>
        <label>
          লেখকের নাম (বাইলাইন)
          <input type="text" name="byline" defaultValue={post?.byline || ''} placeholder="খালি রাখলে অ্যাকাউন্টের নাম দেখাবে" />
        </label>
      </div>
      <div className="admin-form__row">
        <label>
          বিভাগ
          <select name="categoryId" defaultValue={post?.categoryId || ''}>
            <option value="">কোনো বিভাগ নয়</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          সংখ্যা
          <select name="issueId" defaultValue={post?.issueId || ''}>
            <option value="">কোনো সংখ্যা নয়</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>{issue.title} — {issue.period || ''}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        লেখক অ্যাকাউন্ট
        <select name="authorId" defaultValue={post?.authorId || authors[0]?.id || ''}>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>{author.name} ({author.email})</option>
          ))}
        </select>
      </label>
      <label>
        সারাংশ
        <textarea name="excerpt" rows={2} defaultValue={post?.excerpt || ''} />
      </label>
      <label>
        লেখা *
        <textarea name="content" rows={14} required defaultValue={post?.content || ''} />
        <small>সাধারণ পাঠ্য বা HTML—দুটোই চলে।</small>
      </label>
      <label>
        প্রচ্ছদ ছবি
        <input type="file" name="cover" accept="image/*" />
        <small>সর্বোচ্চ ১০ এমবি। {post?.coverUrl ? 'নতুন ছবি দিলেই শুধু বদলাবে।' : ''}</small>
      </label>
      {post?.coverUrl && (
        <label className="check">
          <input type="checkbox" name="removeCover" value="1" />
          বর্তমান প্রচ্ছদ ছবি সরান
        </label>
      )}
      <div className="admin-form__row">
        <label>
          অবস্থা
          <select name="status" defaultValue={post?.status || 'DRAFT'}>
            <option value="PUBLISHED">প্রকাশিত</option>
            <option value="DRAFT">খসড়া</option>
          </select>
        </label>
        <label className="check" style={{ alignSelf: 'end' }}>
          <input type="checkbox" name="featured" value="1" defaultChecked={post?.featured || false} />
          নির্বাচিত লেখা হিসেবে চিহ্নিত করুন
        </label>
      </div>
    </AdminForm>
  )
}

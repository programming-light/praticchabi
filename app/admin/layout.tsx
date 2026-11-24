import Link from 'next/link'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLE_LABELS } from '@/lib/config'
import AdminNav from '@/components/admin/AdminNav'
import LogoutButton from '@/components/forms/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const [newSubmissions, unreadMessages, subscribers] = await Promise.all([
    prisma.submission.count({ where: { status: 'NEW' } }),
    prisma.message.count({ where: { isRead: false } }),
    prisma.subscriber.count(),
  ])

  return (
    <div className="admin-shell">
      <AdminNav
        role={user?.role || 'READER'}
        newSubmissions={newSubmissions}
        unreadMessages={unreadMessages}
        subscribers={subscribers}
      />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1>প্রতিচ্ছবি প্যানেল</h1>
          <div className="admin-topbar__user">
            <Link href="/" target="_blank">সাইট দেখুন ↗</Link>
            <span>{user?.name} · {ROLE_LABELS[user?.role || 'READER']}</span>
            <LogoutButton />
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

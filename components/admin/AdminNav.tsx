'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROLE_LABELS } from '@/lib/config'

type Props = { role: string; newSubmissions: number; unreadMessages: number; subscribers: number }

export default function AdminNav({ role, newSubmissions, unreadMessages, subscribers }: Props) {
  const pathname = usePathname()
  const link = (href: string, label: string, count?: number) => (
    <Link className={pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'is-active' : ''} href={href}>
      <span>{label}</span>
      {Boolean(count) && <span className="admin-sidebar__count">{count}</span>}
    </Link>
  )

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">প্রতিচ্ছবি</div>
      <div className="admin-sidebar__sub">প্যানেল · {ROLE_LABELS[role] || role}</div>
      <nav>
        {link('/admin', 'ড্যাশবোর্ড')}
        <div className="admin-sidebar__group">পর্যালোচনা</div>
        {link('/admin/submissions', 'লেখা জমা', newSubmissions)}
        {link('/admin/messages', 'বার্তা', unreadMessages)}
        {link('/admin/subscribers', 'নিউজলেটার', subscribers)}
        {link('/admin/comments', 'মন্তব্য')}
        <div className="admin-sidebar__group">বিষয়বস্তু</div>
        {link('/admin/activities', 'কার্যক্রম গ্যালারি')}
        {link('/admin/issues', 'সংখ্যা')}
        {link('/admin/posts', 'সব লেখা')}
        {role === 'ADMIN' && <div className="admin-sidebar__group">ব্যবস্থাপনা</div>}
        {role === 'ADMIN' && link('/admin/users', 'ব্যবহারকারী')}
        {role === 'ADMIN' && link('/admin/settings', 'সেটিংস')}
      </nav>
      <div className="admin-sidebar__foot">
        <Link href="/">← সাইটে যান</Link>
      </div>
    </aside>
  )
}

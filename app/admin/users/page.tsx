import { prisma } from '@/lib/db'
import { bn, formatDate, ROLE_LABELS } from '@/lib/config'
import AdminForm from '@/components/admin/AdminForm'

const ROLES = ['READER', 'AUTHOR', 'EDITOR', 'ADMIN']

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { submissions: true, posts: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  return (
    <>
      <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24, marginBottom: 18 }}>ব্যবহারকারী ({bn(users.length)})</h2>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>নাম</th><th>ইমেইল</th><th>ভূমিকা</th><th>লেখা জমা</th><th>প্রকাশিত লেখা</th><th>যোগদান</th><th></th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <AdminForm action={`/api/admin/users/${user.id}`} button="বদলান">
                      <select name="role" defaultValue={user.role} aria-label="ভূমিকা">
                        {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                      </select>
                    </AdminForm>
                  </td>
                  <td className="num">{bn(user._count.submissions)}</td>
                  <td className="num">{bn(user._count.posts)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <AdminForm
                      action={`/api/admin/users/${user.id}`}
                      method="DELETE"
                      button="মুছুন"
                      buttonClass="admin-btn-link admin-btn-link--danger"
                      confirmMessage={`${user.name} কে মুছে ফেলবেন? এর লেখা/মন্তব্যও মুছে যাবে।`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

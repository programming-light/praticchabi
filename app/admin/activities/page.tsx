import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/config'
import { publicUrl } from '@/lib/storage'
import AdminForm from '@/components/admin/AdminForm'

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <>
      <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24, marginBottom: 18 }}>কার্যক্রম গ্যালারি</h2>
      <div className="admin-grid2">
        <div className="admin-panel">
          <h2>নতুন ছবি যোগ করুন</h2>
          <AdminForm action="/api/admin/activities" button="ছবি যোগ করুন" reset>
            <label>
              ক্যাপশন *
              <input type="text" name="caption" required placeholder="যেমন: সাহিত্য অনুষ্ঠান" />
            </label>
            <label>
              তারিখ (লেখা)
              <input type="text" name="dateLabel" placeholder="যেমন: ১৫ অক্টোবর ২০২৫" />
            </label>
            <label>
              ছবি
              <input type="file" name="image" accept="image/*" />
              <small>সর্বোচ্চ ১০ এমবি। PNG/JPG/WebP।</small>
            </label>
          </AdminForm>
        </div>

        <div className="admin-panel">
          <h2>বিদ্যমান ছবি ({activities.length})</h2>
          {activities.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ছবি</th><th>ক্যাপশন</th><th>তারিখ</th><th></th></tr></thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        {activity.imageUrl
                          ? <img className="admin-thumb" src={publicUrl(activity.imageUrl)} alt="" />
                          : <span className="pc-noimg admin-thumb" />}
                      </td>
                      <td>{activity.caption}</td>
                      <td>{activity.dateLabel || formatDate(activity.createdAt)}</td>
                      <td>
                        <AdminForm
                          action={`/api/admin/activities?id=${activity.id}`}
                          method="DELETE"
                          button="মুছুন"
                          buttonClass="admin-btn-link admin-btn-link--danger"
                          confirmMessage="এই ছবিটি মুছে ফেলবেন?"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">এখনো কোনো ছবি যোগ করা হয়নি।</div>
          )}
        </div>
      </div>
    </>
  )
}

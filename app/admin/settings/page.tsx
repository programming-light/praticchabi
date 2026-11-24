import { prisma } from '@/lib/db'
import { SETTING_DEFAULTS } from '@/lib/settings'
import AdminForm from '@/components/admin/AdminForm'

export default async function SettingsPage() {
  const rows = await prisma.setting.findMany()
  const values = { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) }

  return (
    <>
      <h2 style={{ fontFamily: 'var(--pc-serif)', fontSize: 24, marginBottom: 18 }}>সেটিংস</h2>
      <div className="admin-panel">
        <h2>সাধারণ</h2>
        <AdminForm action="/api/admin/settings" button="সেটিংস সংরক্ষণ করুন">
          <div className="admin-form__row">
            <label>
              বিজ্ঞপ্তি ইমেইল
              <input type="email" name="notify_email" defaultValue={values.notify_email} />
              <small>নতুন লেখা জমা ও বার্তা কোথায় পাঠানো হবে।</small>
            </label>
            <label>
              যোগাযোগ ইমেইল
              <input type="email" name="contact_email" defaultValue={values.contact_email} />
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              হোয়াটসঅ্যাপ নম্বর
              <input type="text" name="whatsapp" defaultValue={values.whatsapp} />
            </label>
            <label>
              হোয়াটসঅ্যাপ লেবেল
              <input type="text" name="whatsapp_label" defaultValue={values.whatsapp_label} />
            </label>
          </div>
          <label>
            ফেসবুক URL
            <input type="url" name="facebook" defaultValue={values.facebook} />
          </label>
          <label>
            ঠিকানা
            <textarea name="address" rows={2} defaultValue={values.address} />
          </label>
          <div className="admin-form__row">
            <label>
              ফাইলের সর্বোচ্চ আকার (এমবি)
              <input type="number" name="max_mb" min={1} max={50} defaultValue={values.max_mb} />
            </label>
            <label>
              ন্যূনতম শব্দসংখ্যা
              <input type="number" name="min_words" min={0} defaultValue={values.min_words} />
            </label>
            <label>
              সর্বোচ্চ শব্দসংখ্যা
              <input type="number" name="max_words" min={0} defaultValue={values.max_words} />
            </label>
          </div>
          <label>
            আমাদের কথা (পাতার পাঠ্য)
            <textarea name="about_text" rows={10} defaultValue={values.about_text} />
          </label>
        </AdminForm>
      </div>
    </>
  )
}

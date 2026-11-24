import { currentUser } from '@/lib/auth'
import { settings } from '@/lib/settings'
import { Notice, PageHead } from '@/components/ui'
import ContactForm from '@/components/forms/ContactForm'

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const code = Array.isArray(params.pcp) ? params.pcp[0] : params.pcp
  const [config, user] = await Promise.all([settings(), currentUser()])

  return (
    <>
      <PageHead title="যোগাযোগ" description="পত্রিকা বা লেখা সম্পর্কে যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন।" />
      <Notice code={code} />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 12 }}>
        <div className="pc-contactcard"><strong>ইমেইল</strong><a href={`mailto:${config.contact_email}`}>{config.contact_email}</a></div>
        <div className="pc-contactcard"><strong>হোয়াটসঅ্যাপ</strong><a href={`https://wa.me/${config.whatsapp}`}>{config.whatsapp_label}</a></div>
        <div className="pc-contactcard"><strong>ফেসবুক পেজ</strong><a href={config.facebook}>facebook.com/praticchabiiiuc</a></div>
        <div className="pc-contactcard"><strong>ঠিকানা</strong><span>{config.address}</span></div>
      </section>
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        <div className="pc-formbox" style={{ maxWidth: 760 }}>
          <h2>আমাদের বার্তা পাঠান</h2>
          <ContactForm defaultName={user?.name || ''} defaultEmail={user?.email || ''} />
        </div>
      </section>
    </>
  )
}

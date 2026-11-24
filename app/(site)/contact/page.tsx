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
      <section className="pc-wrap pcx-contactpage">
        <div className="pcx-formcard">
          <span className="pcx-formcard__eyebrow">যোগাযোগ</span>
          <h2>আমাদের বার্তা পাঠান</h2>
          <p className="pcx-formcard__lead">আপনার প্রশ্ন, পরামর্শ বা লেখা নিয়ে আমাদের সাথে ভাগ করুন।</p>
          <ContactForm defaultName={user?.name || ''} defaultEmail={user?.email || ''} />
        </div>
        <aside className="pcx-contactpage__info">
          <span className="pcx-formcard__eyebrow">যোগাযোগের ঠিকানা</span>
          <h2>আমরা এখানে আছি</h2>
          <p className="pcx-formcard__lead">ইমেইল, হোয়াটসঅ্যাপ বা ফেসবুক—যেকোনো মাধ্যমে যোগাযোগ করুন।</p>
          <div className="pcx-contactgrid">
            <div className="pc-contactcard"><strong>ইমেইল</strong><a href={`mailto:${config.contact_email}`}>{config.contact_email}</a></div>
            <div className="pc-contactcard"><strong>হোয়াটসঅ্যাপ</strong><a href={`https://wa.me/${config.whatsapp}`}>{config.whatsapp_label}</a></div>
            <div className="pc-contactcard"><strong>ফেসবুক পেজ</strong><a href={config.facebook}>facebook.com/praticchabiiiuc</a></div>
            <div className="pc-contactcard"><strong>ঠিকানা</strong><span>{config.address}</span></div>
          </div>
        </aside>
      </section>
    </>
  )
}

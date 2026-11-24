import { SITE, bn } from '@/lib/config'
import { currentUser } from '@/lib/auth'
import { getCategories } from '@/lib/queries'
import { maxUploadBytes, settings } from '@/lib/settings'
import { Notice, PageHead } from '@/components/ui'
import SubmitForm from '@/components/forms/SubmitForm'

export default async function SubmitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const code = Array.isArray(params.pcp) ? params.pcp[0] : params.pcp
  const [categories, user, config, maxBytes] = await Promise.all([
    getCategories(), currentUser(), settings(), maxUploadBytes(),
  ])

  return (
    <>
      <PageHead title="লেখা পাঠান" description="নিচের নিয়মাবলি পড়ে ফর্মের মাধ্যমে আপনার লেখা জমা দিন।" />
      <Notice code={code} />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        <div className="pc-submit">
          <div className="pc-rules">
            <h2>নিয়মাবলি</h2>
            <ul>{SITE.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            <div className="pc-rules__alt">
              <strong>ফর্ম ছাড়াও লেখা পাঠানো যাবে</strong>
              <a href={`mailto:${config.contact_email}`}>{config.contact_email}</a>
              <a href={`https://wa.me/${config.whatsapp}`}>হোয়াটসঅ্যাপ: {config.whatsapp_label}</a>
            </div>
          </div>
          <div className="pc-formbox">
            <h2>লেখা জমা দেওয়ার ফর্ম</h2>
            <p className="pc-form-hint">সর্বোচ্চ ফাইল আকার {bn(Math.round(maxBytes / 1024 / 1024))} এমবি।</p>
            <SubmitForm
              categories={categories}
              maxMb={Math.round(maxBytes / 1024 / 1024)}
              defaultName={user?.name || ''}
              defaultEmail={user?.email || ''}
            />
          </div>
        </div>
      </section>
    </>
  )
}

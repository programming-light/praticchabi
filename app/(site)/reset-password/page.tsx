import { PageHead } from '@/components/ui'
import { ResetForm } from '@/components/forms/AuthForms'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return (
    <>
      <PageHead title="নতুন পাসওয়ার্ড" description="কমপক্ষে ৮ অক্ষরের একটি পাসওয়ার্ড বেছে নিন।" />
      <section className="pc-wrap pcx-formpage">
        <div className="pcx-formcard">
          <span className="pcx-formcard__eyebrow">নতুন পাসওয়ার্ড</span>
          <h2>পাসওয়ার্ড পরিবর্তন করুন</h2>
          <p className="pcx-formcard__lead">কমপক্ষে ৮ অক্ষরের একটি পাসওয়ার্ড বেছে নিন।</p>
          {token ? <ResetForm token={token} /> : <div className="pc-notice pc-notice--err">রিসেট টোকন পাওয়া যায়নি।</div>}
        </div>
      </section>
    </>
  )
}

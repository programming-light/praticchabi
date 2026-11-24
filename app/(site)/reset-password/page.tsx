import { PageHead } from '@/components/ui'
import { ResetForm } from '@/components/forms/AuthForms'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return (
    <>
      <PageHead title="নতুন পাসওয়ার্ড" description="কমপক্ষে ৮ অক্ষরের একটি পাসওয়ার্ড বেছে নিন।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72, maxWidth: 760 }}>
        {token ? <ResetForm token={token} /> : <div className="pc-notice pc-notice--err">রিসেট টোকন পাওয়া যায়নি।</div>}
      </section>
    </>
  )
}

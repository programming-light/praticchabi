import Link from 'next/link'
import { PageHead } from '@/components/ui'
import { ForgotForm } from '@/components/forms/AuthForms'

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHead title="পাসওয়ার্ড ভুলে গেছেন?" description="আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হবে।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72, maxWidth: 760 }}>
        <ForgotForm />
        <p className="pc-mt"><Link href="/login">← লগইনে ফিরে যান</Link></p>
      </section>
    </>
  )
}

import Link from 'next/link'
import { PageHead } from '@/components/ui'
import { ForgotForm } from '@/components/forms/AuthForms'

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHead title="পাসওয়ার্ড ভুলে গেছেন?" description="আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হবে।" />
      <section className="pc-wrap pcx-formpage">
        <div className="pcx-formcard">
          <span className="pcx-formcard__eyebrow">অ্যাকাউন্ট</span>
          <h2>পাসওয়ার্ড ভুলে গেছেন?</h2>
          <p className="pcx-formcard__lead">আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হবে।</p>
          <ForgotForm />
          <p className="pcx-formcard__foot"><Link href="/login">← লগইনে ফিরে যান</Link></p>
        </div>
      </section>
    </>
  )
}

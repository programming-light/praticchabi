import Link from 'next/link'
import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/auth'
import { PageHead, Notice } from '@/components/ui'
import { LoginForm, RegisterForm } from '@/components/forms/AuthForms'

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const user = await currentUser()
  if (user) redirect('/account')

  const next = Array.isArray(params.next) ? params.next[0] : params.next || ''
  const code = Array.isArray(params.pcp) ? params.pcp[0] : params.pcp

  return (
    <>
      <PageHead title="লগইন ও নিবন্ধন" description="পাঠক হিসেবে লগইন করে লেখা সংরক্ষণ ও মন্তব্য করুন।" />
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        <Notice code={code} />
        <div className="pc-auth">
          <div className="pc-auth__col">
            <h2>লগইন</h2>
            <LoginForm nextUrl={next} />
          </div>
          <div className="pc-auth__col pc-auth__col--tint" id="register">
            <h2>নতুন নিবন্ধন</h2>
            <RegisterForm />
            <ul className="pc-auth__perks">
              <li>পছন্দের লেখা সংরক্ষণ ও লেখায় মন্তব্য</li>
              <li>নিজের লেখার অবস্থা দেখা</li>
            </ul>
            <p className="pc-form-hint">ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href="/login">লগইন করুন</Link></p>
          </div>
        </div>
      </section>
    </>
  )
}

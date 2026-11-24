import Link from 'next/link'
import { SITE, bn } from '@/lib/config'
import { settings } from '@/lib/settings'
import NewsletterForm from './forms/NewsletterForm'

export default async function SiteFooter() {
  const config = await settings()

  return (
    <>
      <div className="pc-newsband">
        <div className="pc-wrap">
          <div>
            <h2>নতুন সংখ্যার খবর ইমেইলে পান</h2>
            <p>শুধু নতুন সংখ্যা ও নতুন লেখার বিজ্ঞপ্তি।</p>
          </div>
          <NewsletterForm />
        </div>
      </div>
      <footer className="pc-footer">
        <div className="pc-wrap pc-footer__cols">
          <div>
            <span className="pc-footer__brand">প্রতিচ্ছবি</span>
            <span>{SITE.tagline}</span>
            <span>{config.address}</span>
          </div>
          <div>
            <strong>পত্রিকা</strong>
            <Link href="/issues">সংখ্যা আর্কাইভ</Link>
            <Link href="/authors">লেখকবৃন্দ</Link>
            <Link href="/about">আমাদের কথা</Link>
            <Link href="/submit">লেখা পাঠান</Link>
            <Link href="/login">লগইন / নিবন্ধন</Link>
          </div>
          <div>
            <strong>যোগাযোগ</strong>
            <a href={`mailto:${config.contact_email}`}>{config.contact_email}</a>
            <a href={`https://wa.me/${config.whatsapp}`}>হোয়াটসঅ্যাপ: {config.whatsapp_label}</a>
            <a href={config.facebook}>ফেসবুক পেজ</a>
          </div>
        </div>
        <div className="pc-wrap pc-footer__copy">
          © {bn(new Date().getFullYear())} প্রতিচ্ছবি। পাঠপ্রাঙ্গন, আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম।
        </div>
      </footer>
    </>
  )
}

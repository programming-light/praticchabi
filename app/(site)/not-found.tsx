import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="pc-wrap pc-center" style={{ paddingTop: 100, paddingBottom: 120 }}>
      <h1 style={{ fontFamily: 'var(--pc-serif)', fontSize: 48 }}>পাতাটি পাওয়া যায়নি</h1>
      <p className="pc-muted">আপনি যে পাতাটি খুঁজছেন তা সরানো বা পরিবর্তন করা হয়েছে।</p>
      <Link className="pc-btn" href="/">মূলপাতায় ফিরে যান</Link>
    </section>
  )
}

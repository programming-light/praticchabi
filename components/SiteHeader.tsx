import Link from 'next/link'
import { currentUser, isEditor } from '@/lib/auth'
import { getCategories } from '@/lib/queries'
import LogoutButton from './forms/LogoutButton'

export default async function SiteHeader() {
  const [categories, user] = await Promise.all([getCategories(), currentUser()])

  return (
    <>
      <header className="pc-header">
        <div className="pc-wrap pc-header__logos">
          <Link className="pc-logo" href="/" aria-label="প্রতিচ্ছবি হোমপেজ">
            <img src="/images/logo-left.png" alt="ত্রৈমাসিক প্রতিচ্ছবি" />
          </Link>
          <span className="pc-header__line" aria-hidden="true" />
          <img src="/images/logo-right.png" alt="পাঠপ্রাঙ্গন, আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম" />
        </div>
      </header>
      <div className="pc-navbar">
        <nav className="pc-wrap pc-nav" aria-label="প্রধান মেনু">
          <div className="pc-nav__links">
            <Link href="/">মূলপাতা</Link>
            <Link href="/issues">সংখ্যা</Link>
            <details className="pc-dd">
              <summary>বিভাগসমূহ</summary>
              <ul>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </details>
            <Link href="/authors">লেখকবৃন্দ</Link>
            <Link href="/about">আমাদের কথা</Link>
            <Link href="/submit">লেখা পাঠান</Link>
            <Link href="/contact">যোগাযোগ</Link>
          </div>
          <div className="pc-nav__auth">
            <Link href="/search">খুঁজুন</Link>
            {user ? (
              <>
                {isEditor(user.role) && <Link href="/admin">প্যানেল</Link>}
                <Link href="/account">আমার অ্যাকাউন্ট</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login">লগইন</Link>
                <Link className="pc-pill" href="/login#register">নিবন্ধন করুন</Link>
              </>
            )}
          </div>
        </nav>
      </div>
      <div id="content" />
    </>
  )
}

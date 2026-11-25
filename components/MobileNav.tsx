'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LogoutButton from './forms/LogoutButton'

type CategoryOption = { id: string; slug: string; name: string }

type Props = {
  categories: CategoryOption[]
  signedIn: boolean
  canAdmin: boolean
  displayName: string
}

/** Compact mobile menu for the public header. */
export default function MobileNav({ categories, signedIn, canAdmin, displayName }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className={`pc-mobilenav${open ? ' is-open' : ''}`}>
      <button
        className="pc-mobilenav__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="pc-mobilenav-panel"
        aria-label={open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="pc-mobilenav__bars" aria-hidden="true"><i /><i /><i /></span>
        <span>মেনু</span>
      </button>

      <div className="pc-mobilenav__panel" id="pc-mobilenav-panel" hidden={!open}>
        <nav aria-label="মোবাইল মেনু">
          <div className="pc-mobilenav__grid">
            <Link href="/" onClick={close}>মূলপাতা</Link>
            <Link href="/issues" onClick={close}>সংখ্যা</Link>
            <Link href="/authors" onClick={close}>লেখকবৃন্দ</Link>
            <Link href="/about" onClick={close}>আমাদের কথা</Link>
            <Link href="/submit" onClick={close}>লেখা পাঠান</Link>
            <Link href="/contact" onClick={close}>যোগাযোগ</Link>
          </div>

          <section className="pc-mobilenav__group">
            <h2>বিভাগসমূহ</h2>
            <div className="pc-mobilenav__cats">
              {categories.map((category) => (
                <Link href={`/category/${category.slug}`} key={category.id} onClick={close}>
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="pc-mobilenav__group pc-mobilenav__group--auth">
            <h2>{signedIn ? `স্বাগতম, ${displayName}` : 'অ্যাকাউন্ট'}</h2>
            <div className="pc-mobilenav__grid">
              <Link href="/search" onClick={close}>খুঁজুন</Link>
              {signedIn ? (
                <>
                  {canAdmin && <Link href="/admin" onClick={close}>প্যানেল</Link>}
                  <Link href="/account" onClick={close}>আমার অ্যাকাউন্ট</Link>
                  <span className="pc-mobilenav__logout"><LogoutButton /></span>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={close}>লগইন</Link>
                  <Link className="is-pill" href="/login#register" onClick={close}>নিবন্ধন করুন</Link>
                </>
              )}
            </div>
          </section>
        </nav>
      </div>
    </div>
  )
}

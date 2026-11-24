'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

export type AuthorSlide = {
  id: string
  href: string
  name: string
  image: string
  postsLabel: string
  bio?: string
}

const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const toBn = (value: number) => String(value).replace(/[0-9]/g, (d) => digits[Number(d)])

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left' ? <path d="M15 18 9 12l6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

function visibleCount(width: number) {
  if (width <= 620) return 1
  if (width <= 900) return 2
  if (width <= 1180) return 3
  return 4
}

/** Auto-rotating “আমাদের লেখক” strip with arrows, dots and reduced-motion support. */
export default function AuthorCarousel({ authors }: { authors: AuthorSlide[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [perView, setPerView] = useState(4)
  const [paused, setPaused] = useState(false)
  const count = authors.length
  const pages = Math.max(1, count - perView + 1)

  useEffect(() => {
    const update = () => setPerView(visibleCount(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    setActive((current) => Math.min(current, pages - 1))
  }, [pages])

  const go = useCallback((next: number) => {
    setActive(((next % pages) + pages) % pages)
  }, [pages])

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const first = track.children[0] as HTMLElement | undefined
    const second = track.children[1] as HTMLElement | undefined
    if (!first) return
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    viewport.scrollTo({ left: active * step, behavior: reduced ? 'auto' : 'smooth' })
  }, [active, perView])

  useEffect(() => {
    if (paused || pages < 2) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % pages), 5000)
    return () => window.clearInterval(timer)
  }, [paused, pages])

  if (!count) return null

  return (
    <section
      className={`pc-authorcarousel${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="আমাদের লেখক"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1) }
      }}
    >
      <div className="pc-authorcarousel__viewport" ref={viewportRef}>
        <div className="pc-authorcarousel__track" ref={trackRef}>
          {authors.map((author) => (
            <Link className="pc-person pc-authorcarousel__card" href={author.href} key={author.id}>
              <span className="pc-person__avatar">
                {author.image
                  ? <img src={author.image} alt="" loading="lazy" />
                  : <span className="pc-noimg" />}
              </span>
              <h3>{author.name}</h3>
              {author.bio && <span className="pc-authorcarousel__bio">{author.bio}</span>}
              <span className="pc-meta">{author.postsLabel}</span>
            </Link>
          ))}
        </div>
      </div>

      {pages > 1 && (
        <div className="pc-authorcarousel__controls">
          <button className="pcx-arrow pcx-arrow--prev" type="button" onClick={() => go(active - 1)} aria-label="আগের লেখক">
            <Chevron direction="left" />
          </button>
          <div className="pcx-dots" role="group" aria-label="লেখক নির্বাচন">
            {Array.from({ length: pages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`pcx-dot${index === active ? ' is-active' : ''}`}
                onClick={() => go(index)}
                aria-label={`${toBn(index + 1)} নম্বর লেখক গ্রুপ`}
                aria-current={index === active ? 'true' : undefined}
              >
                <span />
              </button>
            ))}
          </div>
          <button className="pcx-arrow pcx-arrow--next" type="button" onClick={() => go(active + 1)} aria-label="পরের লেখক">
            <Chevron direction="right" />
          </button>
          <span className="pcx-counter" aria-hidden="true"><b>{toBn(active + 1)}</b><i />{toBn(pages)}</span>
        </div>
      )}
      <span className="screen-reader-text" aria-live="polite">
        {toBn(active + 1)} / {toBn(pages)} — {authors[active]?.name}
      </span>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export type FeaturedSlide = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  image: string
  hasCover: boolean
}

const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const toBn = (value: number) => String(value).replace(/[0-9]/g, (d) => digits[Number(d)])

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left' ? <path d="M15 18 9 12l6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

export default function FeaturedCarousel({ slides }: { slides: FeaturedSlide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const go = useCallback((next: number) => {
    setActive(((next % count) + count) % count)
  }, [count])

  useEffect(() => {
    if (paused || count < 2) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % count), 6500)
    return () => window.clearInterval(timer)
  }, [paused, count])

  if (!count) return null

  return (
    <section
      className={`pcx-carousel${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="নির্বাচিত লেখা"
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
      <div className="pcx-carousel__track">
        {slides.map((slide, index) => (
          <div
            className={`pcx-slide${index === active ? ' is-active' : ''}${slide.hasCover ? '' : ' pcx-slide--plain'}`}
            key={slide.id}
            aria-hidden={index !== active}
          >
            <Link className="pcx-slide__link" href={`/posts/${slide.slug}`} tabIndex={index === active ? 0 : -1}>
              <img className="pcx-slide__img" src={slide.image} alt="" />
              <span className="pcx-slide__shade" aria-hidden="true" />
              <span className="pcx-slide__glow" aria-hidden="true" />
              <span className="pcx-slide__body">
                <span className="pcx-slide__eyebrow">
                  <span className="pcx-slide__spark" aria-hidden="true" />
                  নির্বাচিত · {slide.category}
                </span>
                <span className="pcx-slide__title">{slide.title}</span>
                <span className="pcx-slide__excerpt">{slide.excerpt}</span>
                <span className="pcx-slide__foot">
                  <span className="pcx-slide__meta">{slide.author} · {slide.date}</span>
                  <span className="pcx-slide__read">এখন পড়ুন <Chevron direction="right" /></span>
                </span>
              </span>
            </Link>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button className="pcx-arrow pcx-arrow--prev" type="button" onClick={() => go(active - 1)} aria-label="আগের লেখা">
            <Chevron direction="left" />
          </button>
          <button className="pcx-arrow pcx-arrow--next" type="button" onClick={() => go(active + 1)} aria-label="পরের লেখা">
            <Chevron direction="right" />
          </button>
          <div className="pcx-carousel__foot">
            <div className="pcx-dots" role="group" aria-label="স্লাইড নির্বাচন">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`pcx-dot${index === active ? ' is-active' : ''}`}
                  onClick={() => go(index)}
                  aria-label={`${toBn(index + 1)} নম্বর লেখা: ${slide.title}`}
                  aria-current={index === active ? 'true' : undefined}
                >
                  <span />
                </button>
              ))}
            </div>
            <span className="pcx-counter" aria-hidden="true">
              <b>{toBn(active + 1)}</b><i />{toBn(count)}
            </span>
          </div>
        </>
      )}
      <span className="screen-reader-text" aria-live="polite">
        {toBn(active + 1)} / {toBn(count)} — {slides[active]?.title}
      </span>
    </section>
  )
}

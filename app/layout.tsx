import type { Metadata } from 'next'
import './globals.css'
import './extra.css'

export const metadata: Metadata = {
  title: { default: 'ত্রৈমাসিক প্রতিচ্ছবি', template: '%s | ত্রৈমাসিক প্রতিচ্ছবি' },
  description: 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম-এর সাহিত্য সাময়িকী ত্রৈমাসিক প্রতিচ্ছবি।',
  icons: { icon: '/images/logo-left.png' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="pc">{children}</body>
    </html>
  )
}

/** Brevo (Sendinblue) in production; console + EmailLog when no API key is set. */
import { prisma } from './db'
import { SITE } from './config'

type MailInput = { to: string; subject: string; html: string; replyTo?: string }

function sender() {
  const raw = process.env.EMAIL_FROM || 'Praticchabi <noreply@praticchabi.local>'
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  return match
    ? { name: match[1].trim() || SITE.name, email: match[2].trim() }
    : { name: SITE.name, email: raw.trim() }
}

export async function sendEmail(input: MailInput): Promise<{ delivered: boolean; provider: string }> {
  const apiKey = process.env.BREVO_API_KEY
  let provider = 'dev-log'
  let delivered = false

  if (apiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: sender(),
          to: [{ email: input.to }],
          subject: input.subject,
          htmlContent: input.html,
          ...(input.replyTo ? { replyTo: { email: input.replyTo } } : {}),
        }),
      })
      if (!response.ok) {
        console.error('[mail] Brevo error', response.status, await response.text())
      } else {
        delivered = true
        provider = 'brevo'
      }
    } catch (error) {
      console.error('[mail] Brevo failed', error)
    }
  } else {
    console.log(`\n[mail:dev] → ${input.to}\n[mail:dev] ${input.subject}\n${input.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n`)
  }

  try {
    await prisma.emailLog.create({
      data: { toAddress: input.to, subject: input.subject, body: input.html, provider },
    })
  } catch (error) {
    console.error('[mail] could not persist log', error)
  }
  return { delivered, provider }
}

function wrap(title: string, body: string) {
  return `<div style="font-family:sans-serif;line-height:1.7;color:#0f1a14"><h2 style="color:#0c4a2c">${title}</h2>${body}<hr style="border:0;border-top:1px solid #d3dccf" /><small>${SITE.name} — ${SITE.address}</small></div>`
}

export async function mailNewSubmission(data: {
  to: string; title: string; name: string; email: string; phone?: string | null
  category: string; words: number; adminUrl: string
}) {
  return sendEmail({
    to: data.to,
    subject: `[প্রতিচ্ছবি] নতুন লেখা জমা: ${data.title}`,
    replyTo: data.email,
    html: wrap('নতুন লেখা জমা হয়েছে', `<p><b>শিরোনাম:</b> ${data.title}</p><p><b>লেখক:</b> ${data.name}</p><p><b>ইমেইল:</b> ${data.email}</p><p><b>ফোন:</b> ${data.phone || '—'}</p><p><b>বিভাগ:</b> ${data.category}</p><p><b>শব্দসংখ্যা:</b> ${data.words}</p><p><a href="${data.adminUrl}">প্যানেলে দেখুন</a></p>`),
  })
}

export async function mailSubmissionReceived(to: string, title: string) {
  return sendEmail({
    to,
    subject: 'আপনার লেখা পেয়েছি — ত্রৈমাসিক প্রতিচ্ছবি',
    html: wrap('লেখা পেয়েছি', `<p>আপনার "<b>${title}</b>" লেখাটি আমরা পেয়েছি। পর্যালোচনার পর ইমেইলে জানানো হবে।</p><p>ধন্যবাদ,<br>${SITE.name}</p>`),
  })
}

export async function mailStatus(to: string, title: string, status: string, note?: string | null) {
  return sendEmail({
    to,
    subject: 'আপনার লেখার অবস্থা — ত্রৈমাসিক প্রতিচ্ছবি',
    html: wrap('লেখার অবস্থা', `<p>আপনার "<b>${title}</b>" লেখার বর্তমান অবস্থা: <b>${status}</b></p>${note ? `<p><b>সম্পাদকের নোট:</b> ${note}</p>` : ''}`),
  })
}

export async function mailContact(data: { to: string; name: string; email: string; subject: string; body: string }) {
  return sendEmail({
    to: data.to,
    subject: `[প্রতিচ্ছবি] বার্তা: ${data.subject}`,
    replyTo: data.email,
    html: wrap('নতুন বার্তা', `<p><b>নাম:</b> ${data.name}</p><p><b>ইমেইল:</b> ${data.email}</p><p><b>বিষয়:</b> ${data.subject}</p><p>${data.body.replace(/\n/g, '<br />')}</p>`),
  })
}

export async function mailPasswordReset(to: string, name: string, url: string) {
  return sendEmail({
    to,
    subject: 'পাসওয়ার্ড রিসেট — ত্রৈমাসিক প্রতিচ্ছবি',
    html: wrap('পাসওয়ার্ড রিসেট', `<p>আসসালামু আলাইকুম ${name},</p><p>আপনার পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন (১ ঘণ্টা বৈধ):</p><p><a href="${url}">${url}</a></p><p>যদি আপনি অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।</p>`),
  })
}

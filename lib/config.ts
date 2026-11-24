/** Everything that used to live in pc_config() / pc_category_map() in the WordPress theme. */

export const SITE = {
  name: 'ত্রৈমাসিক প্রতিচ্ছবি',
  shortName: 'প্রতিচ্ছবি',
  tagline: 'কলমে ফোটে চিন্তার প্রতিচ্ছবি',
  intro: 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম-এর একমাত্র সাহিত্য সাময়িকী "ত্রৈমাসিক প্রতিচ্ছবি"।',
  email: 'praticchabi.iiuc@gmail.com',
  whatsapp: '8801632043011',
  whatsappLabel: '০১৬৩২০৪৩০১১',
  facebook: 'https://www.facebook.com/praticchabiiiuc',
  address: 'আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম, কুমিরা, সীতাকুণ্ড, চট্টগ্রাম',
  board: [
    { role: 'সম্পাদক', name: 'ড. মুহাম্মদ কাউসার আহমেদ' },
    { role: 'নির্বাহী সম্পাদক', name: 'মুহাম্মদ তানযীম উদ্দিন' },
  ],
  rules: [
    'AI দিয়ে নির্মিত লেখা, অন্যের থেকে কপি করা লেখা ও পূর্বে প্রকাশিত লেখা গ্রহণযোগ্য হবে না।',
    'লেখা পাঠাতে হবে .docx (MS Word) ফরম্যাটে।',
    'লেখার ভাষা: বাংলা।',
    'লেখা ১৫০০-৩০০০ শব্দের মধ্যে হতে হবে।',
  ],
} as const

export const CATEGORIES = [
  { slug: 'editorial', name: 'সম্পাদকীয়' },
  { slug: 'essay', name: 'প্রবন্ধ' },
  { slug: 'short-story', name: 'ছোটগল্প' },
  { slug: 'poetry', name: 'কবিতা' },
  { slug: 'interview', name: 'সাক্ষাৎকার' },
  { slug: 'memoir', name: 'স্মৃতিচারণ' },
  { slug: 'travel', name: 'ভ্রমণকাহিনী' },
  { slug: 'history-heritage', name: 'ইতিহাস ঐতিহ্য' },
  { slug: 'criticism', name: 'সাহিত্য সমালোচনা' },
  { slug: 'philosophers', name: 'দার্শনিক পরিচিতি' },
  { slug: 'detective', name: 'অনুসন্ধানী গল্প/গোয়েন্দা কাহিনী' },
  { slug: 'miscellaneous', name: 'বিবিধ' },
] as const

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'নতুন',
  REVIEWING: 'পর্যালোচনায়',
  ACCEPTED: 'গৃহীত',
  REJECTED: 'প্রত্যাখ্যাত',
  PUBLISHED: 'প্রকাশিত',
}

export const ROLE_LABELS: Record<string, string> = {
  READER: 'পাঠক',
  AUTHOR: 'লেখক',
  EDITOR: 'সম্পাদক',
  ADMIN: 'প্রশাসক',
}

export const MESSAGES: Record<string, { type: 'ok' | 'err'; text: string }> = {
  submit_ok: { type: 'ok', text: 'আপনার লেখা জমা হয়েছে। ধন্যবাদ! পর্যালোচনার পর আমরা ইমেইলে যোগাযোগ করব।' },
  contact_ok: { type: 'ok', text: 'আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!' },
  sub_ok: { type: 'ok', text: 'সাবস্ক্রাইব করার জন্য ধন্যবাদ।' },
  sub_dup: { type: 'ok', text: 'এই ইমেইল আগেই সাবস্ক্রাইব করা আছে।' },
  reg_ok: { type: 'ok', text: 'অ্যাকাউন্ট তৈরি হয়েছে। স্বাগতম!' },
  login_ok: { type: 'ok', text: 'স্বাগতম! আপনি লগইন করেছেন।' },
  logout_ok: { type: 'ok', text: 'আপনি লগআউট করেছেন।' },
  saved: { type: 'ok', text: 'লেখাটি সংরক্ষিত হয়েছে।' },
  unsaved: { type: 'ok', text: 'সংরক্ষণ বাতিল করা হয়েছে।' },
  pass_mail: { type: 'ok', text: 'পাসওয়ার্ড রিসেট-linking ইমেইল পাঠানো হয়েছে (ডেভ মোডে ইমেইল লগ দেখুন)।' },
  pass_reset: { type: 'ok', text: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে। এখন লগইন করুন।' },
  err_required: { type: 'err', text: 'অনুগ্রহ করে সব প্রয়োজনীয় ঘর পূরণ করুন।' },
  err_email: { type: 'err', text: 'ইমেইল ঠিকানাটি সঠিক নয়।' },
  err_nonce: { type: 'err', text: 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। পাতাটি রিফ্রেশ করে আবার চেষ্টা করুন।' },
  err_file: { type: 'err', text: 'শুধু .docx (MS Word) ফাইল গ্রহণযোগ্য, এবং আকার নির্ধারিত সীমার মধ্যে হতে হবে।' },
  err_upload: { type: 'err', text: 'ফাইল আপলোড করা যায়নি। আবার চেষ্টা করুন।' },
  err_agree: { type: 'err', text: 'ঘোষণাটিতে সম্মতি দিতে হবে।' },
  err_rate: { type: 'err', text: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
  err_login: { type: 'err', text: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' },
  err_exists: { type: 'err', text: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।' },
  err_password: { type: 'err', text: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' },
  err_terms: { type: 'err', text: 'শর্তাবলিতে সম্মতি দিতে হবে।' },
  err_token: { type: 'err', text: 'রিসেট লিংকটি বৈধ নয় বা মেয়াদ শেষ হয়ে গেছে।' },
  err_unknown: { type: 'err', text: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
  err_unauthorized: { type: 'err', text: 'এই কাজের অনুমতি আপনার নেই।' },
}

const bnDigits: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
}

export function bn(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => bnDigits[d])
}

export function formatDate(value: Date | string | null | undefined, withTime = false): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    }).format(date)
  } catch {
    return bn(date.toLocaleDateString('en-GB'))
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function excerpt(text: string, words = 28): string {
  const clean = stripHtml(text)
  const parts = clean.split(/\s+/u).filter(Boolean)
  return parts.length > words ? `${parts.slice(0, words).join(' ')}…` : clean
}

export function readingMinutes(content: string): number {
  return Math.max(1, Math.ceil(stripHtml(content).split(/\s+/u).filter(Boolean).length / 160))
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `lekh${Date.now().toString(36)}`
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
}

export function issueOrderUrl(issue: { title: string; orderUrl?: string | null }): string {
  return issue.orderUrl || whatsappLink(`আমি ${issue.title} এর হার্ডকপি অর্ডার করতে চাই।`)
}

export function statusClass(status: string): string {
  return `pc-status pc-status--${status.toLowerCase()}`
}

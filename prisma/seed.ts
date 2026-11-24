import { prisma } from '../lib/db'
import { hashPassword } from '../lib/auth'
import { CATEGORIES, SITE } from '../lib/config'
import { SETTING_DEFAULTS } from '../lib/settings'

const ABOUT_TEXT = `সময়ের স্রোত কখনো মৃদু, কখনো অশান্ত—তবু সে থেমে থাকে না। মানুষের সৃজনশীলতা, ভাষার অন্তর্গত দীপ্তি এবং সাহিত্যিক চেতনার নিরন্তর অভিযাত্রাও তেমনই—বাধা পেরিয়ে, বিরতি অতিক্রম করে, আবার নতুন আলোয় ফিরে আসে। প্রতিচ্ছবি সেই অবিচল যাত্রারই একটি অংশ।

২০১৮ সালের জানুয়ারি–মার্চ সংখ্যায় (চতুর্থ সংখ্যা) পৌঁছে আমাদের পথচলা অনাকাঙ্ক্ষিতভাবে থেমে গিয়েছিল। সেই থেমে যাওয়া ছিল কোনো সমাপ্তি নয়; বরং ছিল এক গভীর অন্তর্বিরতি—অপ্রকাশের অন্তরালে জমে ওঠা ভাষা, ভাবনা ও স্বপ্নের নীরব সঞ্চয়।

আজ ২০২৬ সালের জানুয়ারি–মার্চ সংখ্যার (পঞ্চম সংখ্যা) মাধ্যমে প্রতিচ্ছবি আবার তার স্বাভাবিক প্রকাশনায় প্রত্যাবর্তন করেছে। এই প্রত্যাবর্তন কেবল একটি পত্রিকার পুনরারম্ভ নয়; এটি শব্দের প্রতি এবং সৃজনশীলতার প্রতি আমাদের অঙ্গীকারের পুনঃপ্রতিষ্ঠা।

আমরা বিশ্বাস করি, সাহিত্য কেবল বিনোদন নয়—এটি সময়ের দলিল, মানবচেতনার গভীরতম অনুরণন, এবং সমাজ-সংস্কৃতির এক সূক্ষ্ম প্রতিবিম্ব। প্রবন্ধ, ছোটগল্প, কবিতা, সাক্ষাৎকার, স্মৃতিচারণ, ভ্রমণকাহিনী, ইতিহাস ঐতিহ্য, সাহিত্য সমালোচনা ও দার্শনিক পরিচিতি-র মাধ্যমে আমরা তুলে ধরতে চাই আমাদের সময়ের ভাষা, আমাদের মানুষের অভিজ্ঞতা, এবং আমাদের স্বপ্নের বহুবর্ণতা।

আসুন, আমরা আবার শব্দের কাছে ফিরি—নতুন করে, নবপ্রাণে। প্রতিচ্ছবি হোক আমাদের সম্মিলিত কণ্ঠস্বর, আমাদের সময়ের এক জীবন্ত দলিল।`

async function main() {
  console.log('Seeding Praticchabi…')

  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value: key === 'about_text' ? ABOUT_TEXT : value }, update: {} })
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@praticchabi.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: 'প্রধান সম্পাদক',
      passwordHash: await hashPassword(adminPassword),
      role: 'ADMIN',
      bio: 'ত্রৈমাসিক প্রতিচ্ছবির প্রশাসক।',
    },
    update: { role: 'ADMIN' },
  })

  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, name: category.name, sortOrder: index },
      update: { name: category.name, sortOrder: index },
    })
  }

  if (process.env.SKIP_DEMO === '1') {
    console.log('Done (demo content skipped).')
    return
  }

  const writers = [
    { email: 'writer1@praticchabi.local', name: 'মুহাম্মদ তানযীম উদ্দিন', bio: 'সাহিত্যিক ও সম্পাদক। ত্রৈমাসিক প্রতিচ্ছবির নিয়মিত লেখক।' },
    { email: 'writer2@praticchabi.local', name: 'আয়েশা সিদ্দিকা', bio: 'কবি ও গল্পকার। পাঠপ্রাঙ্গনের সাহিত্য আন্দোলনের সক্রিয় সদস্য।' },
    { email: 'writer3@praticchabi.local', name: 'আব্দুল্লাহ আল-ফারুক', bio: 'ইতিহাস ও দর্শন বিষয়ে লেখেন।' },
  ]
  const authorRecords = []
  for (const writer of writers) {
    authorRecords.push(await prisma.user.upsert({
      where: { email: writer.email },
      create: { ...writer, passwordHash: await hashPassword('writer123'), role: 'AUTHOR' },
      update: {},
    }))
  }

  const issue = await prisma.issue.upsert({
    where: { slug: 'pancham-sankhya-2026' },
    create: {
      slug: 'pancham-sankhya-2026',
      title: 'পঞ্চম সংখ্যা',
      period: 'জানুয়ারি–মার্চ ২০২৬',
      price: '২০০ টাকা',
      coverUrl: '/images/logo-inline.png',
      description: 'দীর্ঘ বিরতির পর প্রতিচ্ছবির নতুন যাত্রা।',
    },
    update: {},
  })

  const demoPosts = [
    {
      slug: 'shabder-pratibimba',
      title: 'শব্দের প্রতিবিম্ব: সাহিত্যের সামাজিক দায়বদ্ধতা',
      category: 'essay', author: 0, featured: true, issue: true,
      content: '<p>সাহিত্য কেবল শব্দের খেলা নয়; এটি সমাজের আয়না। প্রতিটি যুগের লেখক তাঁর সময়ের যন্ত্রণা, আশা ও সংশয়কে শব্দে রূপ দিয়েছেন।</p><p>বাংলা সাহিত্যের ধারা সমৃদ্ধ হয়েছে মানবিক চেতনায়। আজ আমাদের দায়িত্ব সেই ঐতিহ্যকে নতুন প্রজন্মের হাতে তুলে দেওয়া।</p><blockquote>শব্দ আছে বলেই অন্ধকারে আলোর খোঁজ পাই।</blockquote><p>প্রতিচ্ছবি সেই চেতনারই একটি ছোট প্রয়াস—লেখক ও পাঠকের মিলনস্থল।</p>',
    },
    {
      slug: 'nodir-name-jibon',
      title: 'নদীর নাম জীবন',
      category: 'essay', author: 1, featured: true, issue: true,
      content: '<p>নদী শুধু জলের প্রবাহ নয়; এটা আমাদের স্মৃতির ধারা। শৈশবের ঘাট, মাছ ধরার আড্ডা, নৌকার মাঝি—সব মিলিয়ে	নদী আমাদের ভেতরে বয়ে চলে।</p><p>আজ নদী দূষিত, কিন্তু তার স্বর আমাদের ভুলতে দেয় না।</p>',
    },
    {
      slug: 'ekla-manush',
      title: 'একা মানুষ',
      category: 'short-story', author: 1, featured: false, issue: true,
      content: '<p>রাত্রি নামলে শহর নীরব হয়। সেই নীরবতায় করিম সাহেবের ছোট দোকানের আলো জ্বলে থাকে। তিনি বলতেন, “একা হওয়া মানে ভুলে যাওয়া নয়, নিজের কাছে ফিরে আসা।”</p><p>সেই কথা আজও মনে পড়ে。</p>',
    },
    {
      slug: 'chander-kabitra',
      title: 'চাঁদের কবিতা',
      category: 'poetry', author: 1, featured: false, issue: true,
      content: '<p>চাঁদ আজ কাঁচা হলুদের মতো\nওঠে পূব আকাশে।\nআমার ছোট ঘরে\nএসে পড়ে তার আলো।</p><p>তুমি কি দেখেছ একা চাঁদকে\nনামে হাত দিয়ে?</p>',
    },
    {
      slug: 'pather-smarak',
      title: 'পথের স্মারক',
      category: 'memoir', author: 0, featured: false, issue: false,
      content: '<p>কুমিরার সেই ছোট রাস্তা এখনও আছে। যেখানে দাঁড়িয়ে আমরা ভবিষ্যৎ নিয়ে স্বপ্ন দেখেছিলাম।</p><p>সময় গড়িয়েছে, কিন্তু সেই পথের ধুলো আজও চেনা।</p>',
    },
    {
      slug: 'itihaser-dhwan',
      title: 'ইতিহাসের ধ্বনি',
      category: 'history-heritage', author: 2, featured: false, issue: false,
      content: '<p>সীতাকুণ্ডের পাহাড়ে প্রাচীন মন্দির ও মসজিদের অবশেষ আমাদের অতীতের সাক্ষী। ইতিহাস শুধু বইয়ের পাতায় নয়, মাটিতেও লেখা থাকে।</p>',
    },
    {
      slug: 'darshan-o-jibon',
      title: 'দর্শন ও জীবন: একটি আলোচনা',
      category: 'philosophers', author: 2, featured: false, issue: false,
      content: '<p>দার্শনিকদের কথা আমাদের কাছে অনেক দূরের মনে হলেও, তাঁদের প্রশ্ন আজও আমাদের ভেতরে বাস করে। “আমি কে?”—এই প্রশ্নই দর্শনের জন্ম।</p>',
    },
    {
      slug: 'ya-trab tang',
      title: 'নতুন কর্মের সন্ধানে',
      category: 'editorial', author: 0, featured: false, issue: true,
      content: '<p>প্রতিচ্ছবি ফিরে এসেছে নতুন উদ্যমে। এই সংখ্যায় আমরা তুলে ধরেছি তরুণ লেখকদের কণ্ঠস্বর, যারা শব্দ দিয়ে গড়ে তুলছেন নতুন সংস্কৃতি।</p>',
    },
  ]

  for (const [index, post] of demoPosts.entries()) {
    const category = await prisma.category.findUnique({ where: { slug: post.category } })
    await prisma.post.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.content.replace(/<[^>]+>/g, ' ').slice(0, 160),
        coverUrl: index % 2 === 0 ? '/images/logo-inline.png' : null,
        authorId: authorRecords[post.author].id,
        categoryId: category?.id ?? null,
        issueId: post.issue ? issue.id : null,
        featured: post.featured,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.UTC(2026, 0, 20 - index)),
      },
      update: {},
    })
  }

  for (const [index, activity] of [
    { caption: 'পাঠপ্রাঙ্গনে সাহিত্য অনুষ্ঠান', dateLabel: '১৫ অক্টোবর ২০২৫' },
    { caption: 'লেখকদের সাথে মতবিনিময়', dateLabel: '২২ নভেম্বর ২০২৫' },
    { caption: 'নতুন সংখ্যার প্রকাশনা উদযাপন', dateLabel: '১০ জানুয়ারি ২০২৬' },
  ].entries()) {
    await prisma.activity.create({
      data: { ...activity, imageUrl: '/images/logo-inline.png', createdAt: new Date(Date.UTC(2026, 0, 10 - index)) },
    })
  }

  console.log(`Seeded admin: ${adminEmail}, ${CATEGORIES.length} categories, ${demoPosts.length} posts.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

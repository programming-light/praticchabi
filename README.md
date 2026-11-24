# ত্রৈমাসিক প্রতিচ্ছবি — Next.js Full-Stack App

WordPress (Astra child theme + “প্রতিচ্ছবি প্যানেল” plugin) থেকে **Next.js 16 + PostgreSQL** তে সম্পূর্ণ রূপান্তর। মূল ওয়ার্ডপ্রেস ফোল্ডারগুলো স্পর্শ বা পরিবর্তন করা হয়নি—নতুন প্রকল্পটি `praticchabi-next/` ফোল্ডারে আছে।

সব ফিচার কাজ করে:

- পাবলিক সাইট: হোমপেজ, সংখ্যা আর্কাইভ, বিভাগ, লেখক, লেখা, অনুসন্ধান, নির্বাচিত লেখা, আমাদের কথা, যোগাযোগ
- লেখা জমা: যেকোনো ব্যবহারকারী `.docx` আপলোড করতে পারেন (ওয়ার্ড কাউন্টসহ)
- অ্যাডমিন প্যানেল: জমা লেখা পর্যালোচনা, অবস্থা বদল, ইমেইল বিজ্ঞপ্তি, **প্রাইভেট `.docx` ডাউনলোড**, ডক্স থেকে খসড়া তৈরি, CSV এক্সপোর্ট
- কনটেন্ট ম্যানেজমেন্ট: সংখ্যা, লেখা, কার্যক্রম গ্যালারি, মন্তব্য, বার্তা, নিউজলেটার, ব্যবহারকারী, সেটিংস
- অ্যাকাউন্ট: নিবন্ধন/লগইন/পাসওয়ার্ড রিসেট, লেখা সংরক্ষণ, মন্তব্য, নিজের জমা লেখার অবস্থা
- নিরাপত্তা: JWT session (httpOnly cookie), CSRF/origin চেক, ভূমিকা-ভিত্তিক অ্যাক্সেস, রেট লিমিট, হানিপট

---

## ১. লোকালে চালানো (এখনই কাজ করবে)

প্রয়োজন: **Node.js 20.9+** (পরীক্ষায় Node 26 ব্যবহার করা হয়েছে)।

```bash
cd praticchabi-next
npm install
npm run dev
```

খুলুন: **http://localhost:3000**

> **এখন থেকে লাইভ DB সংযুক্ত:** `.env`-এ Neon PostgreSQL `DATABASE_URL` সেট করা আছে, তাই `npm run dev` সরাসরি লাইভ ডাটাবেস ব্যবহার করে। টেবিল ইতিমধ্যে `npm run db:push:pg` দিয়ে তৈরি এবং `npm run db:seed` দিয়ে populate করা হয়েছে। SQLite-এ ফিরে যেতে `.env`-এ `DATABASE_URL="file:./dev.db"` বসান—তখন `npm run db:push` ও `npm run db:seed` আবার লোকাল ফাইলে কাজ করবে।

### ডেমো লগইন

| ভূমিকা | ইমেইল | পাসওয়ার্ড |
|---|---|---|
| অ্যাডমিন | `admin@praticchabi.local` | `admin123` |
| লেখক | `writer1@praticchabi.local` | `writer123` |
| লেখক | `writer2@praticchabi.local` | `writer123` |
| লেখক | `writer3@praticchabi.local` | `writer123` |

অ্যাডমিন প্যানেল: **http://localhost:3000/admin**

`npm run db:seed` ১২টি বিভাগ, ৮টি নমুনা লেখা, ১টি সংখ্যা, ৩টি কার্যক্রম ছবি এবং সেটিংস তৈরি করে। ডেমো লেখা ছাড়া শুধু কাঠামো চাইলে:

```bash
SKIP_DEMO=1 npm run db:seed
```

### অন্যান্য কমান্ড

```bash
npm run typecheck     # TypeScript চেক
npm run build         # প্রোডাকশন বিল্ড
npm run start         # বিল্ড করা সার্ভার (port 3000)
npm run db:studio     # SQLite DB ব্রাউজার
```

---

## ২. ফাইল কোথায় থাকে (development)

| ধরন | লোকাল | প্রোডাকশন |
|---|---|---|
| ডাটাবেস | `prisma/dev.db` (SQLite) | PostgreSQL (`DATABASE_URL`) |
| `.docx` জমা | `.data/uploads/submissions/` | Vercel Blob (private) বা S3 |
| ছবি (কভার/গ্যালারি) | `.data/uploads/` | **ImgBB** (public URL) |
| ইমেইল | কনসোল + `EmailLog` টেবিল | **Brevo** API |

`.data/` এবং `.env` Git-এ যাবে না (`.gitignore` আছে)।

---

## ৩. Environment Variables

`.env.example` থেকে `.env` তৈরি করা হয়েছে। প্রোডাকশনে Vercel Dashboard → Settings → Environment Variables এ নিচেরগুলো দিন:

| Variable | কী | উদাহরণ |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (পরে দেবেন) | `postgresql://user:pass@host:5432/praticchabi?sslmode=require` |
| `SESSION_SECRET` | দীর্ঘ র্যান্ডম স্ট্রিং | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | প্রথম অ্যাডমিন ইমেইল | `admin@praticchabi.local` |
| `ADMIN_PASSWORD` | প্রথম অ্যাডমিন পাসওয়ার্ড | শক্তিশালী পাসওয়ার্ড |
| `NEXT_PUBLIC_SITE_URL` | সাইটের URL | `https://your-app.vercel.app` |
| `IMGBB_API_KEY` | ImgBB API key (public images) | 32-hex key from imgbb.com/api |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (private `.docx` only) | `vercel_blob_rw_...` |
| `BREVO_API_KEY` | Brevo API key | `xkeysib-...` |
| `EMAIL_FROM` | Brevo-verified sender | `Praticchabi <mail@yourdomain.com>` |
| `NOTIFY_EMAIL` | বিজ্ঞপ্তি ইমেইল | `praticchabi.iiuc@gmail.com` |

ঐচ্ছিক S3 (Blob-এর বদলে): `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_BASE_URL`।

> **`SESSION_SECRET` অবশ্যই বদলান।** ডিফল্ট শুধু লোকাল ডেভেলপমেন্টের জন্য।

---

## ৪. PostgreSQL সংযোগ (Neon — সংযুক্ত)

কোড দুটি Prisma schema ব্যবহার করে:

- `prisma/schema.prisma` → SQLite (লোকাল)
- `prisma/schema.postgresql.prisma` → PostgreSQL (প্রোডাকশন)

`lib/db.ts` স্বয়ংক্রিয়ভাবে `DATABASE_URL` দেখে ক্লায়েন্ট বাছাই করে (`file:` দিলে SQLite, নাহলে PostgreSQL)। **দুটি schema-র মডেল একই—শুধু provider ও generated output আলাদা।** নতুন ফিল্ড যোগ করলে দুটোতেই যোগ করুন।

Neon (`ep-polished-art-bioac658-pooler.c-5.ap-southeast-1.aws.neon.tech`) ডাটাবেস already সংযুক্ত এবং initialize করা হয়েছে। নতুন করে সেট করতে হলে:

```bash
# 1) .env / Vercel-এ Neon connection string বসান (sslmode=require&channel_binding=require)
# 2) Prisma Postgres client generate (build-এ automatic, তবু নিশ্চিত করতে)
npx prisma generate --schema prisma/schema.postgresql.prisma

# 3) টেবিল তৈরি করুন
npm run db:push:pg

# 4) প্রথম অ্যাডমিন + ১২ বিভাগ + সেটিংস + ডেমো কনটেন্ট
npm run db:seed
```

> `db:push:pg` ডাটাবেসে টেবিল তৈরি/হালনাগাদ করে। লাইভ ডাটাবেসে চালানোর আগে ব্যাকআপ নিন। `SKIP_DEMO=1 npm run db:seed` দিলে শুধু অ্যাডমিন ও কনফিগ তৈরি হবে।

---

## ৫. Vercel-এ ডিপ্লয়

Laravel/Vercel-এ চলে না (Vercel-এ PHP runtime নেই)—তাই Next.js বেছে নেওয়া হয়েছে। Netlify-ও PHP চালায় না।

1. GitHub/GitLab-এ `praticchabi-next` ফোল্ডারটি push করুন (বা Vercel CLI ব্যবহার করুন)।
2. [vercel.com/new](https://vercel.com/new) → repo import → **Framework: Next.js** (auto-detect) → Deploy।
3. Settings → Environment Variables-এ উপরের টেবিলের সব ভ্যারিয়েবল (**Production + Preview**) যোগ করুন।
4. ImgBB: [imgbb.com/api](https://imgbb.com/api) থেকে key নিয়ে `IMGBB_API_KEY` দিন—কভার ও গ্যালারির ছবি এখানে আপলোড হয় এবং সরাসরি URL দিয়ে দেখানো হয়।
5. Brevo: API key দিন; `EMAIL_FROM`-এ দেওয়া sender-কে Brevo-তে verify করুন। না দিলে ইমেইল কনসোলে লগ হবে + `EmailLog` টেবিলে সংরক্ষিত হবে।
6. `.docx` জমার জন্য Vercel Blob store তৈরি করে `BLOB_READ_WRITE_TOKEN` দিন (প্রাইভেট ফাইল ImgBB-এ যায় না)।
7. Vercel-এ `DATABASE_URL`-এ সেই Neon connection string দিন। টেবিল ও সিড ইতিমধ্যে করা হয়েছে, তাই আবার `db:push:pg`/`db:seed` চালানোর দরকার নেই (নতুন কোনো DB ব্যবহার করলে একবার স্থানীয়ভাবে চালিয়ে নিন)।
8. Redeploy করুন। `NEXT_PUBLIC_SITE_URL` আপনার Vercel URL দিয়ে আপডেট করতে ভুলবেন না।

Hobby (free) plan-এই সব কাজ করে। Vercel Blob Hobby-তে প্রায় **1 GB storage / 10 GB transfer / 10K reads / 2K writes per month**—DOCX জমার জন্য যথেষ্ট।

### `.docx` নিরাপত্তা

- জমা দেওয়া ফাইল random key দিয়ে private Blob-এ রাখা হয় (`submissions/<uuid>.docx`)।
- ফাইলের URL কখনো পাবলিক পাতায় দেখানো হয় না। শুধু `/api/admin/download/[id]` দিয়ে **অ্যাডমিন/এডিটর** ডাউনলোড করতে পারেন; anonymous অনুরোধে 403।

---

## ৬. প্রজেক্ট স্ট্রাকচার (সংক্ষেপ)

```
praticchabi-next/
├── app/
│   ├── (site)/              # পাবলিক পাতাসমূহ
│   │   ├── page.tsx         # হোমপেজ (মূল থিমের সব সেকশন)
│   │   ├── issues/, category/, posts/, author/, authors/
│   │   ├── submit/, contact/, search/, about/, tag/featured/
│   │   └── login/, account/, forgot-password/, reset-password/
│   ├── admin/               # অ্যাডমিন প্যানেল (সব CRUD পাতা)
│   ├── api/                 # Route handlers (auth, submit, admin actions…)
│   ├── globals.css          # মূল style.css (অপরিবর্তিত)
│   └── extra.css            # নতুন ফর্ম/panel styles
├── components/              # Header, Footer, forms, cards, admin forms
├── lib/                     # db, auth, storage, docx, mail, queries, config…
├── prisma/                  # SQLite + PostgreSQL schemas, seed
├── public/images/           # মূল লোগো PNG файল
├── proxy.ts                 # CSRF origin check + route protection (Next 16)
├── .env.example
└── package.json
```

---

## ৭. সমস্যা হলে

| সমস্যা | সমাধান |
|---|---|
| `PrismaClient initialization failed` | `npm run db:push` (লোকাল) বা `npm run db:push:pg` (প্রোডাকশন) চালান |
| লগইন করে `/admin`-এ 307 | ভূমিকা `ADMIN`/`EDITOR` কি না দেখুন; `npm run db:seed` চালান |
| `.docx` আপলোড ব্যর্থ | `max_mb` সেটিংস দেখুন, ফাইলের extension `.docx` কি না দেখুন |
| ইমেইল না যাচ্ছে | `BREVO_API_KEY` দেওয়া আছে কি না ও `EMAIL_FROM` sender Brevo-তে verify কি না দেখুন; না থাকলে কনসোল/EmailLog দেখুন |
| ছবি দেখা যাচ্ছে না | `IMGBB_API_KEY` দেখুন; ImgBB-এ আপলোড ব্যর্থ হলে কনসোল.errors দেখুন |
| `npm audit` high severity | Prisma/Next-এর transitive warnings; কোড কাজ করে। `npm audit fix --force` করার আগে ব্যাকআপ নিন |

---

## ৮. মূল ওয়ার্ডপ্রেস থেকে কী নেওয়া হয়েছে

- সম্পূর্ণ বাংলা কপি, ১২টি বিভাগ, “নির্বাচিত” ট্যাগ, সম্পাদনা পর্ষদ, নিয়মাবলি, হোয়াটসঅ্যাপ অর্ডার লিংক
- মূল `style.css` ও তিনটি লোগো PNG অপরিবর্তিতভাবে ব্যবহার করা হয়েছে
- জমা লেখার ৫টি অবস্থা: নতুন → পর্যালোচনায় → গৃহীত/প্রত্যাখ্যাত → প্রকাশিত

প্রশ্ন বা পরিবর্তনের অনুরোধ হলে জানাতে ভুলবেন না।

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { bn, formatDate, STATUS_LABELS } from '@/lib/config'
import { getFile } from '@/lib/storage'
import AdminForm from '@/components/admin/AdminForm'
import { StatusBadge } from '@/components/ui'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  })
  if (!submission) notFound()

  let hasFile = true
  try {
    hasFile = Boolean(await getFile(submission.fileKey))
  } catch {
    hasFile = false
  }

  const wordHint =
    submission.words > 0 && (submission.words < 1500 || submission.words > 3300)
      ? 'সতর্কতা: শব্দসংখ্যা নির্ধারিত ১৫০০–৩০০০ সীমার বাইরে।'
      : ''

  return (
    <>
      <p className="pc-mb"><Link href="/admin/submissions">← সব লেখা জমা</Link></p>
      <div className="admin-grid2">
        <div className="admin-panel">
          <h2>{submission.title}</h2>
          <dl className="admin-dl">
            <dt>অবস্থা</dt><dd><StatusBadge status={submission.status} /></dd>
            <dt>লেখক</dt><dd>{submission.name}</dd>
            <dt>ইমেইল</dt><dd><a href={`mailto:${submission.email}`}>{submission.email}</a></dd>
            <dt>মোবাইল</dt><dd>{submission.phone || '—'}</dd>
            <dt>বিভাগ</dt><dd>{submission.category?.name || '—'}</dd>
            <dt>শব্দসংখ্যা</dt><dd>{bn(submission.words)} {wordHint && <strong className="warn">{wordHint}</strong>}</dd>
            <dt>জমার তারিখ</dt><dd>{formatDate(submission.createdAt, true)}</dd>
            <dt>ফাইল</dt><dd>{submission.originalName}</dd>
            <dt>সম্পাদকের নোট</dt><dd>{submission.editorNote || '—'}</dd>
            {submission.user && (
              <>
                <dt>অ্যাকাউন্ট</dt>
                <dd><Link href={`/admin/users`}>{submission.user.name} ({submission.user.email})</Link></dd>
              </>
            )}
          </dl>
          {submission.note && (
            <div className="admin-note pc-mt"><strong>লেখকের বার্তা:</strong><br />{submission.note}</div>
          )}
        </div>

        <div>
          <div className="admin-panel">
            <h2>অবস্থা হালনাগাদ</h2>
            <AdminForm action={`/api/admin/submissions/${id}`} button="অবস্থা সংরক্ষণ করুন">
              <label>
                অবস্থা
                <select name="status" defaultValue={submission.status}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                সম্পাদকের নোট
                <textarea name="editorNote" rows={4} defaultValue={submission.editorNote || ''} />
              </label>
              <label className="check">
                <input type="checkbox" name="emailAuthor" defaultChecked />
                অবস্থা বদলালে লেখককে ইমেইল করুন
              </label>
            </AdminForm>
          </div>

          <div className="admin-panel">
            <h2>ফাইল ও খসড়া</h2>
            <div className="pc-actions">
              {hasFile ? (
                <a className="admin-btn-link" href={`/api/admin/download/${id}`} target="_blank" rel="noopener">
                  .docx ডাউনলোড করুন
                </a>
              ) : (
                <span className="warn">ফাইলটি পাওয়া যায়নি।</span>
              )}
              {submission.postId ? (
                <Link className="admin-btn-link admin-btn-link--ghost" href={`/admin/posts/${submission.postId}/edit`}>
                  খসড়া সম্পাদনা করুন
                </Link>
              ) : (
                <AdminForm
                  action={`/api/admin/submissions/${id}/draft`}
                  button=".docx থেকে খসড়া তৈরি করুন"
                  buttonClass="admin-btn-link admin-btn-link--ghost"
                  confirmMessage="docx ফাইলের পাঠ্য থেকে খসড়া পোস্ট তৈরি করবেন?"
                  redirect={undefined}
                />
              )}
            </div>
            <p className="admin-note pc-mt">
              ডাউনলোড লিংকটি শুধু সম্পাদক/প্রশাসকের জন্য। খসড়া তৈরি করলে পোস্টটি DRAFT অবস্থায় যাবে—প্রকাশের আগে সম্পাদনা করুন।
            </p>
          </div>

          <div className="admin-panel">
            <h2>মুছুন</h2>
            <AdminForm
              action={`/api/admin/submissions/${id}`}
              method="DELETE"
              button="জমা দেওয়া লেখা মুছুন"
              buttonClass="admin-btn-link admin-btn-link--danger"
              confirmMessage="এই লেখা জমা এবং তার .docx ফাইল স্থায়ীভাবে মুছে ফেলবেন?"
              redirect="/admin/submissions"
            />
          </div>
        </div>
      </div>
    </>
  )
}

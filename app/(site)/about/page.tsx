import { SITE } from '@/lib/config'
import { settings } from '@/lib/settings'
import { PageHead } from '@/components/ui'

export default async function AboutPage() {
  const config = await settings()
  const paragraphs = (config.about_text || '').split(/\n\s*\n/).filter(Boolean)

  return (
    <>
      <PageHead title="আমাদের কথা">
        <p style={{ fontFamily: 'var(--pc-serif)', fontSize: 22, color: 'var(--pc-green)' }}>{SITE.tagline}</p>
      </PageHead>
      <div className="pc-prose pc-prose--page">
        {paragraphs.length
          ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          : <p>{SITE.intro}</p>}
      </div>
      <section className="pc-wrap pc-section" style={{ paddingBottom: 72 }}>
        <div className="pc-sechead"><h2 className="pc-h2">সম্পাদনা পর্ষদ</h2></div>
        <div className="pc-grid pc-grid--people">
          {SITE.board.map((member) => (
            <div className="pc-person" key={member.role}>
              <span className="pc-label">{member.role}</span>
              <h3>{member.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

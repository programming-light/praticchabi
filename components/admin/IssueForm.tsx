import AdminForm from './AdminForm'

type Issue = {
  id: string
  title: string
  slug: string
  period: string | null
  price: string | null
  orderUrl: string | null
  description: string | null
  coverUrl: string | null
}

export default function IssueForm({ issue, action }: { issue?: Issue; action: string }) {
  return (
    <AdminForm action={action} button={issue ? 'সংরক্ষণ করুন' : 'সংখ্যা যোগ করুন'} redirect={issue ? undefined : '/admin/issues'}>
      <label>
        শিরোনাম *
        <input type="text" name="title" required defaultValue={issue?.title || ''} placeholder="যেমন: পঞ্চম সংখ্যা" />
      </label>
      <label>
        স্লাগ (URL)
        <input type="text" name="slug" defaultValue={issue?.slug || ''} placeholder="খালি রাখলে শিরোনাম থেকে তৈরি হবে" />
      </label>
      <div className="admin-form__row">
        <label>
          সময়কাল
          <input type="text" name="period" defaultValue={issue?.period || ''} placeholder="যেমন: জানুয়ারি–মার্চ ২০২৬" />
        </label>
        <label>
          মূল্য
          <input type="text" name="price" defaultValue={issue?.price || ''} placeholder="যেমন: ২০০ টাকা" />
        </label>
      </div>
      <label>
        কাস্টম অর্ডার লিংক
        <input type="url" name="orderUrl" defaultValue={issue?.orderUrl || ''} placeholder="খালি রাখলে WhatsApp লিংক ব্যবহার হবে" />
      </label>
      <label>
        বিবরণ
        <textarea name="description" rows={3} defaultValue={issue?.description || ''} />
      </label>
      <label>
        প্রচ্ছদ ছবি
        <input type="file" name="cover" accept="image/*" />
        <small>সর্বোচ্চ ১০ এমবি। {issue?.coverUrl ? 'নতুন ছবি দিলেই শুধু বদলাবে।' : ''}</small>
      </label>
    </AdminForm>
  )
}

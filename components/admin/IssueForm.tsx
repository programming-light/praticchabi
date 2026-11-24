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
  isCurrent: boolean
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
      <label className="check">
        <input type="checkbox" name="release" defaultChecked={issue?.isCurrent} />
        এই সংখ্যাটি বর্তমান হার্ডকপি হিসেবে প্রকাশ করুন
      </label>
      <p className="admin-note">শিরোনাম, সময়কাল, মূল্য, অর্ডার লিংক ও প্রচ্ছদ — এই তথ্যগুলোই হোমপেজের হার্ডকপি কার্ডে দেখা যায়। চেকবক্সটি বাছাই করলে বা ড্যাশবোর্ড থেকে “প্রকাশ” করলে পুরোনো সংখ্যার বর্তমান মার্কা স্বয়ংক্রিয়ভাবে সরানো হবে।</p>
    </AdminForm>
  )
}

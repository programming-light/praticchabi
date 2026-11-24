'use client'

import { useRouter } from 'next/navigation'
import { postForm } from './request'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <a
      className="pc-pill"
      href="#"
      onClick={async (event) => {
        event.preventDefault()
        await postForm('/api/auth/logout', new FormData())
        router.push('/?pcp=logout_ok')
        router.refresh()
      }}
    >
      লগআউট
    </a>
  )
}

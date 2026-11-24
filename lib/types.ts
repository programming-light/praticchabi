export type Category = { id: string; slug: string; name: string; description?: string | null }
export type Issue = { id: string; slug: string; title: string; period?: string | null }
export type User = { id: string; name: string; email: string; role?: string }

import { spawnSync } from 'node:child_process'
import path from 'node:path'

// Prisma validates the datasource URL even for `generate`. Use throwaway URLs so
// installs and Vercel builds work before the real DATABASE_URL is configured.
// Runtime code still reads the real environment variable in lib/db.ts.
const schemas = [
  { schema: 'prisma/schema.prisma', url: 'file:./prisma-generate-placeholder.db' },
  { schema: 'prisma/schema.postgresql.prisma', url: 'postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder' },
]

const prismaCli = path.join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')

for (const { schema, url } of schemas) {
  const env = { ...process.env, DATABASE_URL: url }
  const result = spawnSync(process.execPath, [prismaCli, 'generate', '--schema', schema], {
    stdio: 'inherit',
    env,
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

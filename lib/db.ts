import { PrismaClient as PgPrismaClient } from '../generated/prisma-pg'
import { PrismaClient as SQLitePrismaClient } from '../generated/prisma-sqlite'

type Client = PgPrismaClient
const globalForPrisma = globalThis as unknown as { prisma?: Client }

/** Build can finish without a database; requests get a clear message instead of a cryptic Prisma error. */
function createClient(): Client {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is missing. Add your Neon PostgreSQL connection string in Vercel → Project Settings → Environment Variables (Production, Preview, Development), then redeploy.',
    )
  }

  if (url.startsWith('file:')) {
    return new SQLitePrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }) as unknown as Client
  }

  return new PgPrismaClient({
    log: ['error'],
    datasources: { db: { url } },
  })
}

function getClient(): Client {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient()
  return globalForPrisma.prisma
}

export const isSqlite = Boolean(process.env.DATABASE_URL?.startsWith('file:'))

/** Lazy proxy so importing this module never needs DATABASE_URL during `next build`. */
export const prisma = new Proxy({} as Client, {
  get(_target, property) {
    const client = getClient()
    const value = Reflect.get(client, property)
    return typeof value === 'function' ? value.bind(client) : value
  },
  has(_target, property) {
    return property in getClient()
  },
}) as Client

export type DbClient = Client

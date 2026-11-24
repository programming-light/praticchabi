import { PrismaClient as PgPrismaClient } from '../generated/prisma-pg'
import { PrismaClient as SQLitePrismaClient } from '../generated/prisma-sqlite'

export const isSqlite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')

function createClient() {
  if (isSqlite) {
    return new SQLitePrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })
  }
  return new PgPrismaClient({
    log: ['error'],
    datasources: { db: { url: process.env.DATABASE_URL } },
  })
}

const globalForPrisma = globalThis as unknown as { prisma?: unknown }

/** One shared client. Types come from the Postgres client; both schemas have identical models. */
export const prisma = (globalForPrisma.prisma ?? createClient()) as PgPrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type DbClient = PgPrismaClient

import { db } from '@/lib/db'

export type DbState = {
  ok: boolean
  ready: boolean
  tables: Record<string, boolean>
  error?: string
}

/**
 * Lightweight DB readiness check.
 *
 * We intentionally use information_schema here so we can distinguish:
 *  - "DB is unreachable" (credentials/network)
 *  - "DB reachable but tables missing" (migrations not applied / wrong DB)
 */
export async function getDbState(requiredTables: string[] = ['Offer', 'OfferPriceSnapshot', 'Category']): Promise<DbState> {
  const tables: Record<string, boolean> = Object.fromEntries(requiredTables.map((t) => [t, false]))

  try {
    // Simple ping
    await db.$queryRaw`SELECT 1`

    // Check tables exist
    const rows = await db.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY(${requiredTables}::text[])
    `

    for (const r of rows) tables[r.table_name] = true

    const ready = requiredTables.every((t) => tables[t])
    return { ok: true, ready, tables }
  } catch (e: any) {
    return { ok: false, ready: false, tables, error: e?.message ?? 'DB check failed' }
  }
}

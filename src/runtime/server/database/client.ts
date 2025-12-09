import { initSqliteDatabase, getSqliteDatabase, type SqliteDatabase } from './sqlite'
import { initPostgresDatabase, getPostgresDatabase, type PostgresDatabase } from './postgres'

export type CmsDatabase = SqliteDatabase | PostgresDatabase

let initialized = false
let databaseType: 'sqlite' | 'postgresql' = 'sqlite'

/**
 * Initialize the CMS database based on configuration
 */
export async function initCmsDatabase(config: {
  provider: 'sqlite' | 'postgresql'
  url?: string
  filename?: string
}) {
  if (initialized) return

  databaseType = config.provider

  if (config.provider === 'postgresql') {
    if (!config.url) {
      throw new Error('[CMS] PostgreSQL requires a connection URL')
    }
    await initPostgresDatabase(config.url)
  } else {
    const filename = config.filename || '.cms/data.db'
    initSqliteDatabase(filename)
  }

  initialized = true
  console.log(`[CMS] Database initialized (${config.provider})`)
}

/**
 * Get the CMS database instance
 */
export function useCmsDatabase(): CmsDatabase {
  if (!initialized) {
    throw new Error('[CMS] Database not initialized. Make sure the CMS module is properly configured.')
  }

  if (databaseType === 'postgresql') {
    return getPostgresDatabase()
  }

  return getSqliteDatabase()
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return initialized
}

/**
 * Get database type
 */
export function getDatabaseType(): 'sqlite' | 'postgresql' {
  return databaseType
}

// Re-export schemas
export * from './schema'

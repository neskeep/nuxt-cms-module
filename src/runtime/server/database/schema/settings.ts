import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { pgTable, text as pgText, timestamp, serial } from 'drizzle-orm/pg-core'

// SQLite Schema
export const settingsSQLite = sqliteTable('cms_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// PostgreSQL Schema
export const settingsPostgres = pgTable('cms_settings', {
  id: serial('id').primaryKey(),
  key: pgText('key').notNull().unique(),
  value: pgText('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type Setting = typeof settingsSQLite.$inferSelect
export type NewSetting = typeof settingsSQLite.$inferInsert

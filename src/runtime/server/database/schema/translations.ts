import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { pgTable, varchar, timestamp, jsonb, unique } from 'drizzle-orm/pg-core'
import { contentSqlite, contentPostgres } from './content'

/**
 * SQLite schema for content translations
 */
export const translationsSqlite = sqliteTable('cms_content_translations', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => contentSqlite.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull(),
  data: text('data', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
}, (table) => [
  uniqueIndex('content_locale_idx').on(table.contentId, table.locale)
])

/**
 * PostgreSQL schema for content translations
 */
export const translationsPostgres = pgTable('cms_content_translations', {
  id: varchar('id', { length: 21 }).primaryKey(),
  contentId: varchar('content_id', { length: 21 }).notNull().references(() => contentPostgres.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  data: jsonb('data').notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  unique('pg_content_locale_idx').on(table.contentId, table.locale)
])

export type TranslationSqlite = typeof translationsSqlite.$inferSelect
export type TranslationPostgres = typeof translationsPostgres.$inferSelect
export type NewTranslationSqlite = typeof translationsSqlite.$inferInsert
export type NewTranslationPostgres = typeof translationsPostgres.$inferInsert

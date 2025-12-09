import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { pgTable, varchar, integer as pgInteger, timestamp, jsonb } from 'drizzle-orm/pg-core'

/**
 * SQLite schema for media
 */
export const mediaSqlite = sqliteTable('cms_media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url'),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  createdBy: text('created_by')
})

/**
 * PostgreSQL schema for media
 */
export const mediaPostgres = pgTable('cms_media', {
  id: varchar('id', { length: 21 }).primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: pgInteger('size').notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  url: varchar('url', { length: 500 }),
  width: pgInteger('width'),
  height: pgInteger('height'),
  alt: varchar('alt', { length: 255 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 21 })
})

export type MediaSqlite = typeof mediaSqlite.$inferSelect
export type MediaPostgres = typeof mediaPostgres.$inferSelect
export type NewMediaSqlite = typeof mediaSqlite.$inferInsert
export type NewMediaPostgres = typeof mediaPostgres.$inferInsert

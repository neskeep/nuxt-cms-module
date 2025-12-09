import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { pgTable, varchar, integer as pgInteger, timestamp, jsonb } from 'drizzle-orm/pg-core'

/**
 * SQLite schema for content
 */
export const contentSqlite = sqliteTable('cms_content', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['collection', 'singleton'] }).notNull(),
  collection: text('collection').notNull(),
  data: text('data', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdBy: text('created_by')
})

/**
 * PostgreSQL schema for content
 */
export const contentPostgres = pgTable('cms_content', {
  id: varchar('id', { length: 21 }).primaryKey(),
  type: varchar('type', { length: 20 }).notNull(),
  collection: varchar('collection', { length: 100 }).notNull(),
  data: jsonb('data').notNull().$type<Record<string, unknown>>(),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  sortOrder: pgInteger('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
  createdBy: varchar('created_by', { length: 21 })
})

export type ContentSqlite = typeof contentSqlite.$inferSelect
export type ContentPostgres = typeof contentPostgres.$inferSelect
export type NewContentSqlite = typeof contentSqlite.$inferInsert
export type NewContentPostgres = typeof contentPostgres.$inferInsert

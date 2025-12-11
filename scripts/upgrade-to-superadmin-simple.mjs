#!/usr/bin/env node

/**
 * Simple script to upgrade admin user to super_admin
 * Usage: node upgrade-to-superadmin-simple.mjs <db-path> [username]
 * Example: node upgrade-to-superadmin-simple.mjs ./.cms/data.db admin
 */

import Database from 'better-sqlite3'

const dbPath = process.argv[2]
const targetUsername = process.argv[3] || null

if (!dbPath) {
  console.error('Usage: node upgrade-to-superadmin-simple.mjs <db-path> [username]')
  console.error('Example: node upgrade-to-superadmin-simple.mjs ./.cms/data.db admin')
  process.exit(1)
}

console.log(`📊 Using database: ${dbPath}\n`)

try {
  const db = new Database(dbPath)

  // Find or create super_admin role
  let superAdminRole = db.prepare('SELECT * FROM cms_roles WHERE name = ?').get('super_admin')

  if (!superAdminRole) {
    console.log('🔧 Creating super_admin role...')
    const now = new Date().toISOString()
    const roleId = generateId()

    db.prepare(`
      INSERT INTO cms_roles (id, name, display_name, description, permissions, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roleId,
      'super_admin',
      'Super Administrator',
      'Full system access with all permissions',
      JSON.stringify({
        content: { create: true, read: true, update: true, delete: true },
        media: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
        roles: { create: true, read: true, update: true, delete: true },
        settings: { read: true, update: true }
      }),
      1,
      now,
      now
    )

    superAdminRole = db.prepare('SELECT * FROM cms_roles WHERE name = ?').get('super_admin')
    console.log('✅ Super admin role created\n')
  }

  // Find user to upgrade
  let user
  if (targetUsername) {
    user = db.prepare('SELECT * FROM cms_users WHERE username = ?').get(targetUsername)
    if (!user) {
      console.error(`❌ User "${targetUsername}" not found`)
      process.exit(1)
    }
  } else {
    user = db.prepare('SELECT * FROM cms_users WHERE role = ?').get('admin')
    if (!user) {
      console.error('❌ No admin users found')
      process.exit(1)
    }
  }

  console.log(`👤 Found user: ${user.username}`)
  console.log(`   Current role: ${user.role}`)
  console.log(`   Current role_id: ${user.role_id || 'null'}\n`)

  // Update user
  db.prepare('UPDATE cms_users SET role_id = ?, updated_at = ? WHERE id = ?')
    .run(superAdminRole.id, new Date().toISOString(), user.id)

  console.log('✅ User upgraded to super_admin!')
  console.log(`   Username: ${user.username}`)
  console.log(`   New role_id: ${superAdminRole.id}`)
  console.log(`   Role: ${superAdminRole.display_name}`)

  db.close()
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}

function generateId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let id = ''
  for (let i = 0; i < 21; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

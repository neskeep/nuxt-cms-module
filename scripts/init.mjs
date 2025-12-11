#!/usr/bin/env node

/**
 * CLI init script for @neskeep/nuxt-cms
 * Run with: npx nuxt-cms-init or pnpm exec nuxt-cms-init
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Default CMS configuration
const DEFAULT_CMS_CONFIG = `
  cms: {
    database: {
      provider: 'sqlite',
      filename: '.cms/data.db'
    },
    admin: {
      enabled: true,
      path: '/admin',
      credentials: {
        username: 'superadmin',
        password: 'superadmin123'
      }
    }
  }`

// Default cms.config.ts content
const CMS_CONFIG_TEMPLATE = `import { defineCmsConfig } from '@neskeep/nuxt-cms'

export default defineCmsConfig({
  locales: ['en'],
  defaultLocale: 'en',

  collections: {
    // Example collection - customize as needed
    posts: {
      label: 'Post',
      labelPlural: 'Posts',
      icon: 'DocumentTextIcon',
      titleField: 'title',
      slugField: 'slug',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          required: true,
          translatable: true
        },
        slug: {
          type: 'slug',
          label: 'Slug',
          from: 'title'
        },
        content: {
          type: 'richtext',
          label: 'Content',
          translatable: true
        },
        featuredImage: {
          type: 'image',
          label: 'Featured Image'
        },
        publishedAt: {
          type: 'datetime',
          label: 'Publish Date'
        }
      }
    }
  },

  singletons: {
    // Example singleton - customize as needed
    settings: {
      label: 'Site Settings',
      icon: 'CogIcon',
      fields: {
        siteName: {
          type: 'text',
          label: 'Site Name',
          required: true
        },
        description: {
          type: 'textarea',
          label: 'Site Description',
          translatable: true
        }
      }
    }
  }
})
`

function main() {
  const projectRoot = process.cwd()

  console.log('')
  console.log('[@neskeep/nuxt-cms] Initializing CMS...')
  console.log('')

  // Check if this is a Nuxt project
  const nuxtConfigTs = join(projectRoot, 'nuxt.config.ts')
  const nuxtConfigJs = join(projectRoot, 'nuxt.config.js')
  const hasNuxtConfig = existsSync(nuxtConfigTs) || existsSync(nuxtConfigJs)

  if (!hasNuxtConfig) {
    console.log('  Error: No nuxt.config.ts or nuxt.config.js found.')
    console.log('  Make sure you run this command from your Nuxt project root.')
    console.log('')
    process.exit(1)
  }

  const configPath = existsSync(nuxtConfigTs) ? nuxtConfigTs : nuxtConfigJs
  let configContent = readFileSync(configPath, 'utf-8')
  let configUpdated = false

  // Check if module is already in modules array
  if (!configContent.includes('@neskeep/nuxt-cms') && !configContent.includes("'@neskeep/nuxt-cms'")) {
    // Add module to modules array
    if (configContent.includes('modules:')) {
      // Modules array exists - add to it
      configContent = configContent.replace(
        /modules:\s*\[/,
        "modules: [\n    '@neskeep/nuxt-cms',"
      )
      configUpdated = true
      console.log('  ✓ Added @neskeep/nuxt-cms to modules array')
    } else if (configContent.includes('defineNuxtConfig')) {
      // No modules array - add it
      configContent = configContent.replace(
        /defineNuxtConfig\s*\(\s*\{/,
        "defineNuxtConfig({\n  modules: ['@neskeep/nuxt-cms'],\n"
      )
      configUpdated = true
      console.log('  ✓ Added modules array with @neskeep/nuxt-cms')
    }
  } else {
    console.log('  ✓ Module already in nuxt.config')
  }

  // Add cms configuration if not present
  if (!configContent.includes('cms:')) {
    // Find a good place to add the cms config
    const insertPosition = configContent.lastIndexOf('})')
    if (insertPosition > 0) {
      // Check if we need a comma before
      const beforeInsert = configContent.substring(0, insertPosition).trim()
      const needsComma = !beforeInsert.endsWith(',') && !beforeInsert.endsWith('{')

      configContent = configContent.substring(0, insertPosition) +
        (needsComma ? ',' : '') +
        DEFAULT_CMS_CONFIG + '\n' +
        configContent.substring(insertPosition)
      configUpdated = true
      console.log('  ✓ Added CMS configuration')
    }
  } else {
    console.log('  ✓ CMS configuration already exists')
  }

  if (configUpdated) {
    writeFileSync(configPath, configContent)
    console.log('  ✓ Updated ' + (existsSync(nuxtConfigTs) ? 'nuxt.config.ts' : 'nuxt.config.js'))
  }

  // Create cms.config.ts if it doesn't exist
  const cmsConfigPath = join(projectRoot, 'cms.config.ts')
  if (!existsSync(cmsConfigPath)) {
    writeFileSync(cmsConfigPath, CMS_CONFIG_TEMPLATE)
    console.log('  ✓ Created cms.config.ts with example configuration')
  } else {
    console.log('  ✓ cms.config.ts already exists')
  }

  console.log('')
  console.log('[@neskeep/nuxt-cms] Setup complete!')
  console.log('')
  console.log('  Next steps:')
  console.log('  1. Review and customize cms.config.ts')
  console.log('  2. Update admin credentials in nuxt.config.ts (change default password!)')
  console.log('  3. Run your Nuxt app: pnpm dev')
  console.log('  4. Go to /admin to access the CMS panel')
  console.log('')
  console.log('  Default credentials: superadmin / superadmin123')
  console.log('')
  console.log('  Docs: https://github.com/IsraSenior/nuxt-cms-module')
  console.log('')
}

main()

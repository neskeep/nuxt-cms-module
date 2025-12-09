#!/usr/bin/env node

/**
 * CLI uninstall script for @neskeep/nuxt-cms
 * Run with: npx nuxt-cms-uninstall or pnpm exec nuxt-cms-uninstall
 *
 * This script:
 * - Removes the cms config from nuxt.config.ts/js
 * - Removes the module from modules array
 * - Optionally deletes cms.config.ts
 * - Optionally deletes .cms folder (database and uploads)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync, rmSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  const projectRoot = process.cwd()

  console.log('')
  console.log('[@neskeep/nuxt-cms] Uninstalling CMS...')
  console.log('')

  // Check if this is a Nuxt project
  const nuxtConfigTs = join(projectRoot, 'nuxt.config.ts')
  const nuxtConfigJs = join(projectRoot, 'nuxt.config.js')
  const hasNuxtConfig = existsSync(nuxtConfigTs) || existsSync(nuxtConfigJs)

  if (!hasNuxtConfig) {
    console.log('  Error: No nuxt.config.ts or nuxt.config.js found.')
    console.log('  Make sure you run this command from your Nuxt project root.')
    console.log('')
    rl.close()
    process.exit(1)
  }

  const configPath = existsSync(nuxtConfigTs) ? nuxtConfigTs : nuxtConfigJs
  let configContent = readFileSync(configPath, 'utf-8')
  let configUpdated = false

  // Remove module from modules array
  if (configContent.includes('@neskeep/nuxt-cms')) {
    // Remove various patterns of the module inclusion
    configContent = configContent.replace(
      /\s*['"]@neskeep\/nuxt-cms['"],?\s*/g,
      ''
    )
    configUpdated = true
    console.log('  ✓ Removed @neskeep/nuxt-cms from modules array')
  }

  // Remove cms configuration block
  // This regex matches the cms: { ... } block with any level of nesting
  const cmsConfigRegex = /,?\s*cms:\s*\{[\s\S]*?(?:\{[\s\S]*?\}[\s\S]*?)*?\}/g
  if (cmsConfigRegex.test(configContent)) {
    configContent = configContent.replace(cmsConfigRegex, '')
    configUpdated = true
    console.log('  ✓ Removed CMS configuration from nuxt.config')
  }

  // Clean up empty modules array if present
  configContent = configContent.replace(/modules:\s*\[\s*\],?\n?/g, '')

  // Clean up multiple empty lines
  configContent = configContent.replace(/\n{3,}/g, '\n\n')

  if (configUpdated) {
    writeFileSync(configPath, configContent)
    console.log('  ✓ Updated ' + (existsSync(nuxtConfigTs) ? 'nuxt.config.ts' : 'nuxt.config.js'))
  }

  // Ask about cms.config.ts
  const cmsConfigPath = join(projectRoot, 'cms.config.ts')
  if (existsSync(cmsConfigPath)) {
    const answer = await question('  Delete cms.config.ts? (y/N): ')
    if (answer.toLowerCase() === 'y') {
      unlinkSync(cmsConfigPath)
      console.log('  ✓ Deleted cms.config.ts')
    } else {
      console.log('  ⊘ Keeping cms.config.ts')
    }
  }

  // Ask about .cms folder (database and uploads)
  const cmsFolderPath = join(projectRoot, '.cms')
  if (existsSync(cmsFolderPath)) {
    console.log('')
    console.log('  ⚠️  Warning: The .cms folder contains your database and uploaded files.')
    const answer = await question('  Delete .cms folder (database + uploads)? This cannot be undone! (y/N): ')
    if (answer.toLowerCase() === 'y') {
      rmSync(cmsFolderPath, { recursive: true, force: true })
      console.log('  ✓ Deleted .cms folder')
    } else {
      console.log('  ⊘ Keeping .cms folder')
    }
  }

  rl.close()

  console.log('')
  console.log('[@neskeep/nuxt-cms] Uninstall complete!')
  console.log('')
  console.log('  Next steps:')
  console.log('  1. Remove the package: pnpm remove @neskeep/nuxt-cms')
  console.log('  2. Clean and restart: rm -rf .nuxt && pnpm dev')
  console.log('')
}

main().catch(err => {
  console.error(err)
  rl.close()
  process.exit(1)
})

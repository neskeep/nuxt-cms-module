import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/module', name: 'module' }
  ],
  externals: [
    'nuxt',
    'vue',
    '@nuxt/kit',
    '@nuxt/ui',
    'drizzle-orm',
    'better-sqlite3',
    'postgres'
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
})

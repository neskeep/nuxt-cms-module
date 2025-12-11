export default defineNuxtConfig({
  modules: ['../src/module'],

  cms: {
    database: {
      provider: 'sqlite',
      filename: '.cms/data.db'
    },
    admin: {
      path: '/admin',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    },
    jwt: {
      secret: 'playground-secret-change-in-production-32chars!'
    },
    locales: ['en', 'es'],
    defaultLocale: 'en',
    collections: {
      posts: {
        label: 'Posts',
        slug: 'posts',
        fields: [
          { name: 'title', type: 'text', label: 'Title', required: true, translatable: true },
          { name: 'slug', type: 'slug', label: 'Slug', from: 'title' },
          { name: 'content', type: 'richtext', label: 'Content', translatable: true },
          { name: 'excerpt', type: 'textarea', label: 'Excerpt', translatable: true },
          { name: 'featured_image', type: 'image', label: 'Featured Image' },
          { name: 'published', type: 'boolean', label: 'Published', default: false },
          { name: 'publishedAt', type: 'datetime', label: 'Publish Date' }
        ]
      },
      categories: {
        label: 'Categories',
        slug: 'categories',
        fields: [
          { name: 'name', type: 'text', label: 'Name', required: true, translatable: true },
          { name: 'slug', type: 'slug', label: 'Slug', from: 'name' },
          { name: 'description', type: 'textarea', label: 'Description', translatable: true }
        ]
      }
    },
    singletons: {
      settings: {
        label: 'Site Settings',
        slug: 'settings',
        fields: [
          { name: 'siteName', type: 'text', label: 'Site Name', translatable: true },
          { name: 'tagline', type: 'text', label: 'Tagline', translatable: true },
          { name: 'logo', type: 'image', label: 'Logo' },
          { name: 'socialLinks', type: 'repeater', label: 'Social Links', fields: [
            { name: 'platform', type: 'text', label: 'Platform' },
            { name: 'url', type: 'url', label: 'URL' }
          ]}
        ]
      }
    }
  },

  devtools: { enabled: true },
  compatibilityDate: '2024-12-01'
})

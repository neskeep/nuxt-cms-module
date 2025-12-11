<script setup lang="ts">
const { data: posts } = await useFetch('/api/cms/public/collections/posts')
const { data: settings } = await useFetch('/api/cms/public/singletons/settings')
</script>

<template>
  <div class="container">
    <header>
      <h1>{{ settings?.data?.siteName || 'CMS Playground' }}</h1>
      <p>{{ settings?.data?.tagline || 'Testing the Nuxt CMS Module' }}</p>
      <nav>
        <NuxtLink to="/admin">Go to Admin Panel</NuxtLink>
      </nav>
    </header>

    <main>
      <h2>Posts</h2>
      <div v-if="posts?.data?.length" class="posts-grid">
        <article v-for="post in posts.data" :key="post.id" class="post-card">
          <h3>{{ post.data?.title || 'Untitled' }}</h3>
          <p>{{ post.data?.excerpt || 'No excerpt available' }}</p>
          <small>Status: {{ post.status }}</small>
        </article>
      </div>
      <p v-else class="empty">
        No posts yet. <NuxtLink to="/admin/collections/posts">Create your first post</NuxtLink>
      </p>
    </main>

    <footer>
      <p>Nuxt CMS Module Playground</p>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

header h1 {
  font-size: 2.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

header p {
  color: #6b7280;
  font-size: 1.1rem;
}

header nav {
  margin-top: 1.5rem;
}

header nav a {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

header nav a:hover {
  background: #1d4ed8;
}

main h2 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 1.5rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.post-card h3 {
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.post-card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.post-card small {
  color: #9ca3af;
  font-size: 0.875rem;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 12px;
}

.empty a {
  color: #2563eb;
}

footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  color: #9ca3af;
}
</style>

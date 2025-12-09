<script setup lang="ts">
const { user, logout } = useCmsAdmin()
const config = useRuntimeConfig()
const route = useRoute()

// Mobile sidebar state
const sidebarOpen = ref(false)

const navigation = computed(() => [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-squares-2x2',
    to: config.public.cms.adminPath
  },
  {
    label: 'Collections',
    icon: 'i-heroicons-rectangle-stack',
    to: `${config.public.cms.adminPath}/collections`
  },
  {
    label: 'Singletons',
    icon: 'i-heroicons-document-text',
    to: `${config.public.cms.adminPath}/singletons`
  },
  {
    label: 'Media',
    icon: 'i-heroicons-photo',
    to: `${config.public.cms.adminPath}/media`
  }
])

const userMenuItems = [
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    disabled: true
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => logout()
  }]
]

function isActive(path: string): boolean {
  if (path === config.public.cms.adminPath) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="cms-layout">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="cms-overlay"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside class="cms-sidebar" :class="{ 'cms-sidebar--open': sidebarOpen }">
      <!-- Logo -->
      <div class="cms-sidebar__header">
        <div class="cms-logo">
          <div class="cms-logo__icon">
            <UIcon name="i-heroicons-cube" class="cms-logo__svg" />
          </div>
          <span class="cms-logo__text">CMS</span>
        </div>
        <!-- Mobile close button -->
        <button class="cms-sidebar__close" @click="sidebarOpen = false">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="cms-nav">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="cms-nav__item"
          :class="{ 'cms-nav__item--active': isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="cms-nav__icon" />
          <span class="cms-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User section -->
      <div class="cms-user">
        <UDropdownMenu v-if="user" :items="userMenuItems">
          <button class="cms-user__button">
            <UAvatar :alt="user.username" size="sm" class="cms-user__avatar" />
            <div class="cms-user__info">
              <span class="cms-user__name">{{ user.username }}</span>
              <span class="cms-user__role">{{ user.role }}</span>
            </div>
            <UIcon name="i-heroicons-chevron-up-down" class="cms-user__chevron" />
          </button>
        </UDropdownMenu>
      </div>
    </aside>

    <!-- Main area -->
    <div class="cms-main">
      <!-- Top bar (mobile) -->
      <header class="cms-topbar">
        <button class="cms-topbar__menu" @click="sidebarOpen = true">
          <UIcon name="i-heroicons-bars-3" class="w-6 h-6" />
        </button>
        <div class="cms-topbar__logo">
          <div class="cms-logo__icon cms-logo__icon--small">
            <UIcon name="i-heroicons-cube" class="w-4 h-4 text-white" />
          </div>
          <span class="cms-logo__text">CMS</span>
        </div>
        <div class="cms-topbar__spacer" />
      </header>

      <!-- Content -->
      <main class="cms-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
/* ============================================
   CMS Admin Layout - Modern Minimal Design
   ============================================ */

/* CSS Variables for theming */
:root {
  --cms-sidebar-width: 260px;
  --cms-topbar-height: 64px;
  --cms-primary: #2563eb;
  --cms-primary-light: #eff6ff;
  --cms-primary-dark: #1d4ed8;
  --cms-gray-50: #f9fafb;
  --cms-gray-100: #f3f4f6;
  --cms-gray-200: #e5e7eb;
  --cms-gray-300: #d1d5db;
  --cms-gray-400: #9ca3af;
  --cms-gray-500: #6b7280;
  --cms-gray-600: #4b5563;
  --cms-gray-700: #374151;
  --cms-gray-800: #1f2937;
  --cms-gray-900: #111827;
  --cms-gray-950: #030712;
}

/* Layout Container */
.cms-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--cms-gray-50);
}

:root.dark .cms-layout {
  background-color: var(--cms-gray-950);
}

/* Mobile Overlay */
.cms-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  backdrop-filter: blur(4px);
}

@media (min-width: 1024px) {
  .cms-overlay {
    display: none;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================
   Sidebar
   ============================================ */
.cms-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--cms-sidebar-width);
  background-color: white;
  border-right: 1px solid var(--cms-gray-200);
  display: flex;
  flex-direction: column;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cms-sidebar--open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .cms-sidebar {
    transform: translateX(0);
  }
}

:root.dark .cms-sidebar {
  background-color: var(--cms-gray-900);
  border-right-color: var(--cms-gray-800);
}

/* Sidebar Header */
.cms-sidebar__header {
  height: var(--cms-topbar-height);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--cms-gray-200);
  flex-shrink: 0;
}

:root.dark .cms-sidebar__header {
  border-bottom-color: var(--cms-gray-800);
}

.cms-sidebar__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--cms-gray-500);
  transition: all 0.15s ease;
}

.cms-sidebar__close:hover {
  background-color: var(--cms-gray-100);
  color: var(--cms-gray-700);
}

@media (min-width: 1024px) {
  .cms-sidebar__close {
    display: none;
  }
}

:root.dark .cms-sidebar__close {
  color: var(--cms-gray-400);
}

:root.dark .cms-sidebar__close:hover {
  background-color: var(--cms-gray-800);
  color: var(--cms-gray-200);
}

/* Logo */
.cms-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cms-logo__icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--cms-primary) 0%, var(--cms-primary-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.cms-logo__icon--small {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.cms-logo__svg {
  width: 20px;
  height: 20px;
  color: white;
}

.cms-logo__text {
  font-size: 18px;
  font-weight: 700;
  color: var(--cms-gray-900);
  letter-spacing: -0.02em;
}

:root.dark .cms-logo__text {
  color: white;
}

/* Navigation */
.cms-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.cms-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--cms-gray-600);
  text-decoration: none;
  transition: all 0.15s ease;
}

.cms-nav__item:hover {
  background-color: var(--cms-gray-100);
  color: var(--cms-gray-900);
}

.cms-nav__item--active {
  background-color: var(--cms-primary-light);
  color: var(--cms-primary);
}

.cms-nav__item--active:hover {
  background-color: var(--cms-primary-light);
  color: var(--cms-primary);
}

:root.dark .cms-nav__item {
  color: var(--cms-gray-400);
}

:root.dark .cms-nav__item:hover {
  background-color: var(--cms-gray-800);
  color: white;
}

:root.dark .cms-nav__item--active {
  background-color: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
}

:root.dark .cms-nav__item--active:hover {
  background-color: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
}

.cms-nav__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.cms-nav__label {
  flex: 1;
}

/* User Section */
.cms-user {
  padding: 12px;
  border-top: 1px solid var(--cms-gray-200);
  flex-shrink: 0;
}

:root.dark .cms-user {
  border-top-color: var(--cms-gray-800);
}

.cms-user__button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-align: left;
}

.cms-user__button:hover {
  background-color: var(--cms-gray-100);
}

:root.dark .cms-user__button:hover {
  background-color: var(--cms-gray-800);
}

.cms-user__avatar {
  flex-shrink: 0;
}

.cms-user__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cms-user__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--cms-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root.dark .cms-user__name {
  color: white;
}

.cms-user__role {
  font-size: 12px;
  color: var(--cms-gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:root.dark .cms-user__role {
  color: var(--cms-gray-400);
}

.cms-user__chevron {
  width: 16px;
  height: 16px;
  color: var(--cms-gray-400);
  flex-shrink: 0;
}

/* ============================================
   Main Content Area
   ============================================ */
.cms-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .cms-main {
    margin-left: var(--cms-sidebar-width);
  }
}

/* Top Bar (Mobile) */
.cms-topbar {
  height: var(--cms-topbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: white;
  border-bottom: 1px solid var(--cms-gray-200);
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .cms-topbar {
    display: none;
  }
}

:root.dark .cms-topbar {
  background-color: var(--cms-gray-900);
  border-bottom-color: var(--cms-gray-800);
}

.cms-topbar__menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: var(--cms-gray-600);
  transition: all 0.15s ease;
}

.cms-topbar__menu:hover {
  background-color: var(--cms-gray-100);
  color: var(--cms-gray-900);
}

:root.dark .cms-topbar__menu {
  color: var(--cms-gray-400);
}

:root.dark .cms-topbar__menu:hover {
  background-color: var(--cms-gray-800);
  color: white;
}

.cms-topbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cms-topbar__spacer {
  flex: 1;
}

/* Content */
.cms-content {
  flex: 1;
  padding: 24px 16px;
}

@media (min-width: 640px) {
  .cms-content {
    padding: 32px 24px;
  }
}

@media (min-width: 1024px) {
  .cms-content {
    padding: 32px 40px;
  }
}

@media (min-width: 1280px) {
  .cms-content {
    padding: 40px 48px;
    max-width: 1400px;
  }
}
</style>

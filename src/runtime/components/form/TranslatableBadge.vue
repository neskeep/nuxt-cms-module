<script setup lang="ts">
interface Props {
  locale?: string
  inline?: boolean
}

withDefaults(defineProps<Props>(), {
  inline: false
})
</script>

<template>
  <span
    class="cms-translatable-badge"
    :class="{ 'cms-translatable-badge--inline': inline }"
    :title="locale ? `This field can be translated (editing ${locale.toUpperCase()})` : 'This field can be translated'"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="cms-translatable-badge__icon">
      <path d="M6.2 2.2a.75.75 0 0 0-1.4.6l.7 1.6a22.3 22.3 0 0 0-2.4.2.75.75 0 1 0 .2 1.5h.1l.9-.1A13 13 0 0 1 3 9.5a13.2 13.2 0 0 1-.7-1.4.75.75 0 0 0-1.4.6c.3.7.6 1.4 1 2a13.2 13.2 0 0 1-2.6 2.8.75.75 0 1 0 1 1.1 14.5 14.5 0 0 0 2.8-3l.2.2a.75.75 0 0 0 1-.7l-.4-.6a14.2 14.2 0 0 0 1.6-3.6h.1a.75.75 0 0 0 .2-1.5 22.1 22.1 0 0 0-2.4-.2l-.7-1.6ZM11 6a.75.75 0 0 1 .7.4l2.8 5.7a.75.75 0 1 1-1.4.7l-.5-1h-3.7l-.5 1a.75.75 0 1 1-1.4-.7l2.9-5.7A.75.75 0 0 1 11 6Zm1.3 4.3L11 7.6l-1.3 2.7h2.6Z"/>
    </svg>
  </span>
</template>

<style scoped>
.cms-translatable-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--cms-primary, #2563eb);
  color: white;
  border-radius: 4px;
  cursor: help;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}

.cms-translatable-badge:hover {
  background-color: var(--cms-primary-hover, #1d4ed8);
}

.cms-translatable-badge__icon {
  width: 12px;
  height: 12px;
  color: inherit;
}

/* Inline variant for text */
.cms-translatable-badge--inline {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin: 0 2px;
}

.cms-translatable-badge--inline .cms-translatable-badge__icon {
  width: 10px;
  height: 10px;
}
</style>

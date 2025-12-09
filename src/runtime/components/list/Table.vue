<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  columns: Column[]
  items: Record<string, unknown>[]
  loading?: boolean
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'row-click': [item: Record<string, unknown>]
  'sort': [key: string]
}>()

function getValue(item: Record<string, unknown>, key: string): unknown {
  // Support nested keys like "data.title"
  const keys = key.split('.')
  let value: unknown = item

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }

  return value
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<template>
  <div class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              :class="{ 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700': col.sortable }"
              @click="col.sortable && $emit('sort', col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <UIcon
                  v-if="col.sortable && sortBy === col.key"
                  :name="sortDir === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="w-4 h-4 text-primary-500"
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td :colspan="columns.length" class="px-4 py-8 text-center">
              <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length === 0">
          <tr>
            <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No items found
            </td>
          </tr>
        </tbody>

        <tbody v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="item in items"
            :key="String(item.id)"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
            @click="$emit('row-click', item)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-sm text-gray-900 dark:text-white"
            >
              <slot :name="`cell-${col.key}`" :item="item" :value="getValue(item, col.key)">
                {{ formatValue(getValue(item, col.key)) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

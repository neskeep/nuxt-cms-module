<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SlugFieldDefinition } from '../../types'

interface Props {
  modelValue: string | null
  field: SlugFieldDefinition
  fieldName: string
  formData: Record<string, unknown>
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const value = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val || null)
})

const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || `Auto-generated from "${props.field.from}"`)
const required = computed(() => props.field.required || false)

const isLocked = ref(!!props.modelValue)
const separator = computed(() => props.field.separator || '-')
const prefix = computed(() => props.field.prefix || '')

// Watch source field and auto-generate slug
const sourceValue = computed(() => {
  return props.formData[props.field.from] as string | undefined
})

watch(sourceValue, (newValue) => {
  if (!isLocked.value && newValue) {
    value.value = slugify(newValue)
  }
})

function slugify(text: string): string {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
    .replace(/\s+/g, separator.value) // Replace spaces
    .replace(new RegExp(`${separator.value}+`, 'g'), separator.value) // Remove consecutive separators

  if (prefix.value) {
    slug = prefix.value + separator.value + slug
  }

  return slug
}

function regenerate() {
  if (sourceValue.value) {
    value.value = slugify(sourceValue.value)
  }
}

function toggleLock() {
  isLocked.value = !isLocked.value
}
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>
    <div class="cms-slug">
      <input
        v-model="value"
        type="text"
        class="cms-slug__input"
        :class="{ 'cms-slug__input--disabled': disabled || isLocked }"
        :disabled="disabled || isLocked"
        :placeholder="`auto-generated${separator}slug`"
      />
      <button
        type="button"
        class="cms-slug__btn"
        :disabled="disabled"
        @click="toggleLock"
      >
        {{ isLocked ? '🔒' : '🔓' }}
      </button>
      <button
        type="button"
        class="cms-slug__btn"
        :disabled="disabled || !sourceValue"
        @click="regenerate"
      >
        ↻
      </button>
    </div>
    <p class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style>
.cms-slug {
  display: flex;
  gap: 8px;
}

.cms-slug__input {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  font-family: monospace;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #111827;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.cms-slug__input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.cms-slug__input--disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

:root.dark .cms-slug__input {
  background-color: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}

:root.dark .cms-slug__input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

:root.dark .cms-slug__input--disabled {
  background-color: #111827;
}

.cms-slug__btn {
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.cms-slug__btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.cms-slug__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:root.dark .cms-slug__btn {
  background-color: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

:root.dark .cms-slug__btn:hover:not(:disabled) {
  background-color: #374151;
}
</style>

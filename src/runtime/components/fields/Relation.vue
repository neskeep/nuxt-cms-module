<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData } from '#imports'
import type { RelationFieldDefinition } from '../../types'

interface Props {
  modelValue: string | string[] | null
  field: RelationFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || `Select from ${props.field.collection}`)
const required = computed(() => props.field.required || false)
const isMultiple = computed(() =>
  props.field.relationship === 'one-to-many' ||
  props.field.relationship === 'many-to-many'
)

// Fetch related collection items
const { data: options, pending } = useAsyncData(
  `relation-${props.field.collection}`,
  () => $fetch(`/api/cms/collections/${props.field.collection}`, {
    params: { perPage: 100 }
  }),
  { lazy: true }
)

const selectOptions = computed(() => {
  if (!options.value?.data) return []

  const displayField = props.field.displayField || 'title'

  return options.value.data.map((item: any) => ({
    label: item.data?.[displayField] || item.id,
    value: item.id
  }))
})

// For search functionality
const searchQuery = ref('')
const filteredOptions = computed(() => {
  if (!searchQuery.value) return selectOptions.value

  const query = searchQuery.value.toLowerCase()
  return selectOptions.value.filter((opt: any) =>
    opt.label.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>

    <!-- Loading state -->
    <div v-if="pending" class="cms-field__input cms-field__input--loading">
      <svg class="cms-field__spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
      </svg>
      <span>Loading options...</span>
    </div>

    <!-- Select input -->
    <select
      v-else
      v-model="value"
      class="cms-field__input cms-field__select"
      :class="{
        'cms-field__input--error': error,
        'cms-field__input--disabled': disabled
      }"
      :disabled="disabled"
      :multiple="isMultiple"
    >
      <option v-if="!isMultiple" value="" disabled>Select {{ field.collection }}</option>
      <option
        v-for="option in filteredOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style>
/* Field container styles are inherited from cms-field */
.cms-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cms-field__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.cms-field__required {
  color: #dc2626;
  margin-left: 2px;
}

.cms-field__input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #111827;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.cms-field__input:focus {
  outline: none;
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.cms-field__input--disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.cms-field__input--error {
  border-color: #dc2626;
}

.cms-field__input--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.cms-field__input--loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  background-color: #f9fafb;
}

.cms-field__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 20px;
  padding-right: 36px;
}

.cms-field__select option {
  color: #111827;
  background-color: white;
}

.cms-field__spinner {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  animation: cms-spin 1s linear infinite;
}

@keyframes cms-spin {
  to {
    transform: rotate(360deg);
  }
}

.cms-field__help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.cms-field__error {
  font-size: 12px;
  color: #dc2626;
  margin: 0;
}
</style>

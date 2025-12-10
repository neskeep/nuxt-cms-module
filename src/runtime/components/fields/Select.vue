<script setup lang="ts">
import { computed } from 'vue'
import type { SelectFieldDefinition } from '../../types'

interface Props {
  modelValue: string | number | (string | number)[] | null
  field: SelectFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[] | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const label = computed(() => props.field.label || props.fieldName)
const placeholder = computed(() => props.field.placeholder || 'Select an option')
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)

const options = computed(() => props.field.options.map(opt => ({
  label: opt.label,
  value: opt.value,
  disabled: opt.disabled
})))
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>
    <select
      v-model="value"
      class="cms-field__select"
      :class="{
        'cms-field__select--error': error,
        'cms-field__select--disabled': disabled,
        'cms-field__select--placeholder': !value
      }"
      :disabled="disabled"
      :multiple="field.multiple"
    >
      <option v-if="!field.multiple" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style>
.cms-field__select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #111827;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 18px;
}

.cms-field__select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.cms-field__select--placeholder {
  color: #9ca3af;
}

.cms-field__select--disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.cms-field__select--error {
  border-color: #dc2626;
}

.cms-field__select--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.cms-field__select[multiple] {
  padding: 8px;
  background-image: none;
  height: auto;
  min-height: 100px;
}

.cms-field__select[multiple] option {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.cms-field__select[multiple] option:checked {
  background: linear-gradient(0deg, #2563eb 0%, #2563eb 100%);
  color: white;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { BooleanFieldDefinition } from '../../types'

interface Props {
  modelValue: boolean
  field: BooleanFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const value = computed({
  get: () => props.modelValue || false,
  set: (val) => emit('update:modelValue', val)
})

const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
const labelOn = computed(() => props.field.labelOn || 'Yes')
const labelOff = computed(() => props.field.labelOff || 'No')

function toggle() {
  if (!props.disabled) {
    value.value = !value.value
  }
}
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>
    <div
      class="cms-field__toggle-container"
      :class="{ 'cms-field__toggle-container--disabled': disabled }"
      @click="toggle"
    >
      <button
        type="button"
        role="switch"
        :aria-checked="value"
        class="cms-field__toggle"
        :class="{ 'cms-field__toggle--active': value }"
        :disabled="disabled"
      >
        <span class="cms-field__toggle-track">
          <span class="cms-field__toggle-thumb"></span>
        </span>
      </button>
      <span class="cms-field__toggle-label" :class="{ 'cms-field__toggle-label--active': value }">
        {{ value ? labelOn : labelOff }}
      </span>
    </div>
    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style>
.cms-field__toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 0;
}

.cms-field__toggle-container--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cms-field__toggle {
  position: relative;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.cms-field__toggle:disabled {
  cursor: not-allowed;
}

.cms-field__toggle-track {
  display: flex;
  align-items: center;
  width: 48px;
  height: 26px;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s ease;
  padding: 3px;
}

.cms-field__toggle--active .cms-field__toggle-track {
  background-color: #2563eb;
}

.cms-field__toggle-thumb {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.cms-field__toggle--active .cms-field__toggle-thumb {
  transform: translateX(22px);
}

.cms-field__toggle-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  user-select: none;
  transition: color 0.15s ease;
}

.cms-field__toggle-label--active {
  color: #2563eb;
}

.cms-field__toggle:focus-visible .cms-field__toggle-track {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
</style>

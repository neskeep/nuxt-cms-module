<script setup lang="ts">
import { computed } from 'vue'
import type { NumberFieldDefinition } from '../../types'

interface Props {
  modelValue: number | null
  field: NumberFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const label = computed(() => props.field.label || props.fieldName)
const placeholder = computed(() => props.field.placeholder || '')
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>
    <input
      v-model.number="value"
      type="number"
      class="cms-field__input"
      :class="{ 'cms-field__input--error': error, 'cms-field__input--disabled': disabled }"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
    />
    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DatetimeFieldDefinition } from '../../types'

interface Props {
  modelValue: string | null
  field: DatetimeFieldDefinition
  fieldName: string
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
      v-model="value"
      type="datetime-local"
      class="cms-field__input"
      :class="{ 'cms-field__input--error': error, 'cms-field__input--disabled': disabled }"
      :disabled="disabled"
      :min="field.min"
      :max="field.max"
    />
    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

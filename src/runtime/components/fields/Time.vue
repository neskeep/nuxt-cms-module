<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { TimeFieldDefinition } from '../../types'

interface Props {
  modelValue: string | null
  field: TimeFieldDefinition
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

// State
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Selected time parts
const selectedHour = ref(12)
const selectedMinute = ref(0)
const selectedPeriod = ref<'AM' | 'PM'>('AM')

// Computed
const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
const step = computed(() => props.field.step || 1) // Minute step

// Format displayed time
const displayValue = computed(() => {
  if (!props.modelValue) return ''

  const [hours, minutes] = props.modelValue.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
})

// Parse model value
function parseValue(value: string | null) {
  if (!value) {
    selectedHour.value = 12
    selectedMinute.value = 0
    selectedPeriod.value = 'AM'
    return
  }

  const [hours, minutes] = value.split(':').map(Number)
  selectedPeriod.value = hours >= 12 ? 'PM' : 'AM'
  selectedHour.value = hours % 12 || 12
  selectedMinute.value = minutes
}

// Generate formatted value (24h format for storage)
function generateValue(): string {
  let hour24 = selectedHour.value

  if (selectedPeriod.value === 'AM') {
    if (hour24 === 12) hour24 = 0
  } else {
    if (hour24 !== 12) hour24 += 12
  }

  return `${hour24.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
}

// Update and emit value
function updateValue() {
  const value = generateValue()

  // Check min/max constraints
  if (props.field.min && value < props.field.min) return
  if (props.field.max && value > props.field.max) return

  emit('update:modelValue', value)
}

// Hours array (1-12)
const hours = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i + 1)
})

// Minutes array based on step
const minutes = computed(() => {
  const result: number[] = []
  for (let i = 0; i < 60; i += step.value) {
    result.push(i)
  }
  return result
})

// Select hour
function selectHour(hour: number) {
  selectedHour.value = hour
  updateValue()
}

// Select minute
function selectMinute(minute: number) {
  selectedMinute.value = minute
  updateValue()
}

// Toggle period
function togglePeriod(period: 'AM' | 'PM') {
  selectedPeriod.value = period
  updateValue()
}

// Set current time
function setNow() {
  const now = new Date()
  selectedHour.value = now.getHours() % 12 || 12
  selectedMinute.value = Math.floor(now.getMinutes() / step.value) * step.value
  selectedPeriod.value = now.getHours() >= 12 ? 'PM' : 'AM'
  updateValue()
}

// Clear value
function clear() {
  emit('update:modelValue', null)
  isOpen.value = false
}

// Toggle picker
function togglePicker() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// Close on click outside
function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Watch for external value changes
watch(() => props.modelValue, (newVal) => {
  parseValue(newVal)
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="cms-field" ref="containerRef">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>

    <div class="cms-time" :class="{ 'cms-time--disabled': disabled, 'cms-time--error': error, 'cms-time--open': isOpen }">
      <!-- Input trigger -->
      <button
        type="button"
        class="cms-time__trigger"
        :disabled="disabled"
        @click="togglePicker"
      >
        <svg class="cms-time__icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd"/>
        </svg>
        <span class="cms-time__value" :class="{ 'cms-time__value--placeholder': !modelValue }">
          {{ displayValue || field.placeholder || 'Select time' }}
        </span>
        <svg v-if="modelValue && !disabled" class="cms-time__clear" viewBox="0 0 20 20" fill="currentColor" @click.stop="clear">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="cms-time__dropdown">
          <!-- Header -->
          <div class="cms-time__header">
            <span class="cms-time__preview">
              {{ selectedHour }}:{{ selectedMinute.toString().padStart(2, '0') }} {{ selectedPeriod }}
            </span>
            <button type="button" class="cms-time__now" @click="setNow">Now</button>
          </div>

          <!-- Time selectors -->
          <div class="cms-time__selectors">
            <!-- Hours -->
            <div class="cms-time__column">
              <div class="cms-time__column-header">Hour</div>
              <div class="cms-time__scroll">
                <button
                  v-for="hour in hours"
                  :key="hour"
                  type="button"
                  class="cms-time__option"
                  :class="{ 'cms-time__option--selected': hour === selectedHour }"
                  @click="selectHour(hour)"
                >
                  {{ hour }}
                </button>
              </div>
            </div>

            <!-- Minutes -->
            <div class="cms-time__column">
              <div class="cms-time__column-header">Min</div>
              <div class="cms-time__scroll">
                <button
                  v-for="minute in minutes"
                  :key="minute"
                  type="button"
                  class="cms-time__option"
                  :class="{ 'cms-time__option--selected': minute === selectedMinute }"
                  @click="selectMinute(minute)"
                >
                  {{ minute.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>

            <!-- AM/PM -->
            <div class="cms-time__column cms-time__column--period">
              <div class="cms-time__column-header">Period</div>
              <div class="cms-time__period-buttons">
                <button
                  type="button"
                  class="cms-time__period"
                  :class="{ 'cms-time__period--selected': selectedPeriod === 'AM' }"
                  @click="togglePeriod('AM')"
                >
                  AM
                </button>
                <button
                  type="button"
                  class="cms-time__period"
                  :class="{ 'cms-time__period--selected': selectedPeriod === 'PM' }"
                  @click="togglePeriod('PM')"
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style>
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

.cms-field__help {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.cms-field__error {
  font-size: 13px;
  color: #dc2626;
  margin: 0;
}

/* Time picker container */
.cms-time {
  position: relative;
}

.cms-time__trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #111827;
  transition: all 0.15s ease;
}

.cms-time__trigger:hover:not(:disabled) {
  border-color: #9ca3af;
}

.cms-time--open .cms-time__trigger {
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.cms-time--error .cms-time__trigger {
  border-color: #dc2626;
}

.cms-time--disabled .cms-time__trigger {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.cms-time__icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
}

.cms-time__value {
  flex: 1;
}

.cms-time__value--placeholder {
  color: #9ca3af;
}

.cms-time__clear {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  flex-shrink: 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.cms-time__clear:hover {
  color: #6b7280;
}

/* Dropdown */
.cms-time__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 280px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.cms-time__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cms-time__preview {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.cms-time__now {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cms-primary, #2563eb);
  background: var(--cms-primary-light, rgba(37, 99, 235, 0.1));
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-time__now:hover {
  background: var(--cms-primary, #2563eb);
  color: white;
}

/* Selectors */
.cms-time__selectors {
  display: flex;
  padding: 12px;
  gap: 8px;
}

.cms-time__column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cms-time__column--period {
  flex: 0 0 70px;
}

.cms-time__column-header {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  text-align: center;
  padding-bottom: 8px;
}

.cms-time__scroll {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 4px;
}

.cms-time__scroll::-webkit-scrollbar {
  width: 4px;
}

.cms-time__scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}

.cms-time__scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.cms-time__option {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.cms-time__option:hover {
  background: #f3f4f6;
}

.cms-time__option--selected {
  background: var(--cms-primary, #2563eb);
  color: white;
  font-weight: 500;
}

.cms-time__option--selected:hover {
  background: var(--cms-primary-hover, #1d4ed8);
}

/* Period buttons */
.cms-time__period-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cms-time__period {
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.cms-time__period:hover {
  background: #e5e7eb;
}

.cms-time__period--selected {
  background: var(--cms-primary, #2563eb);
  color: white;
}

.cms-time__period--selected:hover {
  background: var(--cms-primary-hover, #1d4ed8);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

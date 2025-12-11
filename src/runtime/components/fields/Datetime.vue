<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

// State
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const activeTab = ref<'date' | 'time'>('date')

// Calendar state
const viewMode = ref<'days' | 'months' | 'years'>('days')
const viewDate = ref(new Date())

// Time state
const selectedHour = ref(12)
const selectedMinute = ref(0)
const selectedPeriod = ref<'AM' | 'PM'>('AM')

// Computed
const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)

// Parse datetime value
function parseValue(value: string | null) {
  if (!value) {
    viewDate.value = new Date()
    selectedHour.value = 12
    selectedMinute.value = 0
    selectedPeriod.value = 'AM'
    return
  }

  const date = new Date(value)
  viewDate.value = date
  const hours = date.getHours()
  selectedPeriod.value = hours >= 12 ? 'PM' : 'AM'
  selectedHour.value = hours % 12 || 12
  selectedMinute.value = date.getMinutes()
}

// Get selected date from modelValue
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  return new Date(props.modelValue)
})

// Format display value
const displayValue = computed(() => {
  if (!props.modelValue) return ''

  const date = new Date(props.modelValue)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const hours = date.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${dateStr} at ${displayHour}:${minutes} ${period}`
})

// Days of week
const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Month names
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Current month/year display
const currentMonthYear = computed(() => {
  const month = monthNames[viewDate.value.getMonth()]
  const year = viewDate.value.getFullYear()
  return `${month} ${year}`
})

// Generate calendar days
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = []

  // Previous month days
  const startDayOfWeek = firstDay.getDay()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(date)
    })
  }

  // Current month days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const isToday = date.getTime() === today.getTime()
    const isSelected = selectedDate.value
      ? date.getFullYear() === selectedDate.value.getFullYear() &&
        date.getMonth() === selectedDate.value.getMonth() &&
        date.getDate() === selectedDate.value.getDate()
      : false

    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isDisabled: isDateDisabled(date)
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(date)
    })
  }

  return days
})

// Check if date is disabled
function isDateDisabled(date: Date): boolean {
  if (props.field.min) {
    const minDate = new Date(props.field.min)
    minDate.setHours(0, 0, 0, 0)
    if (date < minDate) return true
  }
  if (props.field.max) {
    const maxDate = new Date(props.field.max)
    maxDate.setHours(23, 59, 59, 999)
    if (date > maxDate) return true
  }
  return false
}

// Generate time value (24h format)
function generateTimeValue(): string {
  let hour24 = selectedHour.value

  if (selectedPeriod.value === 'AM') {
    if (hour24 === 12) hour24 = 0
  } else {
    if (hour24 !== 12) hour24 += 12
  }

  return `${hour24.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
}

// Update value with date and time
function updateValue(date: Date) {
  const timeStr = generateTimeValue()
  const [hours, minutes] = timeStr.split(':').map(Number)

  date.setHours(hours, minutes, 0, 0)

  emit('update:modelValue', date.toISOString())
}

// Select a day
function selectDay(day: { date: Date; isDisabled: boolean }) {
  if (day.isDisabled || props.disabled) return

  const newDate = new Date(day.date)
  updateValue(newDate)

  // Switch to time tab after selecting date
  activeTab.value = 'time'
}

// Navigate months
function prevMonth() {
  const newDate = new Date(viewDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  viewDate.value = newDate
}

function nextMonth() {
  const newDate = new Date(viewDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  viewDate.value = newDate
}

// Navigate years
function prevYear() {
  const newDate = new Date(viewDate.value)
  newDate.setFullYear(newDate.getFullYear() - 1)
  viewDate.value = newDate
}

function nextYear() {
  const newDate = new Date(viewDate.value)
  newDate.setFullYear(newDate.getFullYear() + 1)
  viewDate.value = newDate
}

// Hours array (1-12)
const hours = computed(() => Array.from({ length: 12 }, (_, i) => i + 1))

// Minutes array
const minutes = computed(() => {
  const result: number[] = []
  for (let i = 0; i < 60; i += 5) {
    result.push(i)
  }
  return result
})

// Select hour
function selectHour(hour: number) {
  selectedHour.value = hour
  if (selectedDate.value) {
    updateValue(new Date(selectedDate.value))
  }
}

// Select minute
function selectMinute(minute: number) {
  selectedMinute.value = minute
  if (selectedDate.value) {
    updateValue(new Date(selectedDate.value))
  }
}

// Toggle period
function togglePeriod(period: 'AM' | 'PM') {
  selectedPeriod.value = period
  if (selectedDate.value) {
    updateValue(new Date(selectedDate.value))
  }
}

// Set to now
function setNow() {
  const now = new Date()
  viewDate.value = now
  selectedHour.value = now.getHours() % 12 || 12
  selectedMinute.value = Math.floor(now.getMinutes() / 5) * 5
  selectedPeriod.value = now.getHours() >= 12 ? 'PM' : 'AM'
  updateValue(now)
}

// Go to today
function goToToday() {
  viewDate.value = new Date()
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
  if (isOpen.value) {
    activeTab.value = 'date'
    if (props.modelValue) {
      viewDate.value = new Date(props.modelValue)
    }
  }
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

    <div class="cms-datetime" :class="{ 'cms-datetime--disabled': disabled, 'cms-datetime--error': error, 'cms-datetime--open': isOpen }">
      <!-- Input trigger -->
      <button
        type="button"
        class="cms-datetime__trigger"
        :disabled="disabled"
        @click="togglePicker"
      >
        <svg class="cms-datetime__icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/>
        </svg>
        <span class="cms-datetime__value" :class="{ 'cms-datetime__value--placeholder': !modelValue }">
          {{ displayValue || field.placeholder || 'Select date and time' }}
        </span>
        <svg v-if="modelValue && !disabled" class="cms-datetime__clear" viewBox="0 0 20 20" fill="currentColor" @click.stop="clear">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="cms-datetime__dropdown">
          <!-- Tabs -->
          <div class="cms-datetime__tabs">
            <button
              type="button"
              class="cms-datetime__tab"
              :class="{ 'cms-datetime__tab--active': activeTab === 'date' }"
              @click="activeTab = 'date'"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" class="cms-datetime__tab-icon">
                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/>
              </svg>
              Date
            </button>
            <button
              type="button"
              class="cms-datetime__tab"
              :class="{ 'cms-datetime__tab--active': activeTab === 'time' }"
              @click="activeTab = 'time'"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" class="cms-datetime__tab-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd"/>
              </svg>
              Time
            </button>
          </div>

          <!-- Date Panel -->
          <div v-if="activeTab === 'date'" class="cms-datetime__panel">
            <!-- Calendar Header -->
            <div class="cms-datetime__header">
              <button type="button" class="cms-datetime__nav" @click="prevMonth">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
              </button>
              <span class="cms-datetime__title">{{ currentMonthYear }}</span>
              <button type="button" class="cms-datetime__nav" @click="nextMonth">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
              </button>
            </div>

            <!-- Days of week -->
            <div class="cms-datetime__weekdays">
              <span v-for="day in daysOfWeek" :key="day" class="cms-datetime__weekday">{{ day }}</span>
            </div>

            <!-- Calendar days -->
            <div class="cms-datetime__days">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                type="button"
                class="cms-datetime__day"
                :class="{
                  'cms-datetime__day--other-month': !day.isCurrentMonth,
                  'cms-datetime__day--today': day.isToday,
                  'cms-datetime__day--selected': day.isSelected,
                  'cms-datetime__day--disabled': day.isDisabled
                }"
                :disabled="day.isDisabled"
                @click="selectDay(day)"
              >
                {{ day.date.getDate() }}
              </button>
            </div>

            <!-- Today button -->
            <div class="cms-datetime__footer">
              <button type="button" class="cms-datetime__today" @click="goToToday">Today</button>
            </div>
          </div>

          <!-- Time Panel -->
          <div v-if="activeTab === 'time'" class="cms-datetime__panel">
            <!-- Time Header -->
            <div class="cms-datetime__time-header">
              <span class="cms-datetime__time-preview">
                {{ selectedHour }}:{{ selectedMinute.toString().padStart(2, '0') }} {{ selectedPeriod }}
              </span>
              <button type="button" class="cms-datetime__now" @click="setNow">Now</button>
            </div>

            <!-- Time selectors -->
            <div class="cms-datetime__time-selectors">
              <!-- Hours -->
              <div class="cms-datetime__time-column">
                <div class="cms-datetime__time-column-header">Hour</div>
                <div class="cms-datetime__time-scroll">
                  <button
                    v-for="hour in hours"
                    :key="hour"
                    type="button"
                    class="cms-datetime__time-option"
                    :class="{ 'cms-datetime__time-option--selected': hour === selectedHour }"
                    @click="selectHour(hour)"
                  >
                    {{ hour }}
                  </button>
                </div>
              </div>

              <!-- Minutes -->
              <div class="cms-datetime__time-column">
                <div class="cms-datetime__time-column-header">Min</div>
                <div class="cms-datetime__time-scroll">
                  <button
                    v-for="minute in minutes"
                    :key="minute"
                    type="button"
                    class="cms-datetime__time-option"
                    :class="{ 'cms-datetime__time-option--selected': minute === selectedMinute }"
                    @click="selectMinute(minute)"
                  >
                    {{ minute.toString().padStart(2, '0') }}
                  </button>
                </div>
              </div>

              <!-- AM/PM -->
              <div class="cms-datetime__time-column cms-datetime__time-column--period">
                <div class="cms-datetime__time-column-header">Period</div>
                <div class="cms-datetime__time-period-buttons">
                  <button
                    type="button"
                    class="cms-datetime__time-period"
                    :class="{ 'cms-datetime__time-period--selected': selectedPeriod === 'AM' }"
                    @click="togglePeriod('AM')"
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    class="cms-datetime__time-period"
                    :class="{ 'cms-datetime__time-period--selected': selectedPeriod === 'PM' }"
                    @click="togglePeriod('PM')"
                  >
                    PM
                  </button>
                </div>
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

/* Datetime container */
.cms-datetime {
  position: relative;
}

.cms-datetime__trigger {
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

.cms-datetime__trigger:hover:not(:disabled) {
  border-color: #9ca3af;
}

.cms-datetime--open .cms-datetime__trigger {
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.cms-datetime--error .cms-datetime__trigger {
  border-color: #dc2626;
}

.cms-datetime--disabled .cms-datetime__trigger {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.cms-datetime__icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
}

.cms-datetime__value {
  flex: 1;
}

.cms-datetime__value--placeholder {
  color: #9ca3af;
}

.cms-datetime__clear {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  flex-shrink: 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.cms-datetime__clear:hover {
  color: #6b7280;
}

/* Dropdown */
.cms-datetime__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Tabs */
.cms-datetime__tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cms-datetime__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datetime__tab:hover {
  color: #374151;
  background: #f3f4f6;
}

.cms-datetime__tab--active {
  color: var(--cms-primary, #2563eb);
  background: white;
  border-bottom: 2px solid var(--cms-primary, #2563eb);
  margin-bottom: -1px;
}

.cms-datetime__tab-icon {
  width: 16px;
  height: 16px;
}

/* Panel */
.cms-datetime__panel {
  padding: 12px;
}

/* Calendar Header */
.cms-datetime__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 12px;
}

.cms-datetime__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datetime__nav:hover {
  background: #f3f4f6;
  color: #374151;
}

.cms-datetime__nav svg {
  width: 20px;
  height: 20px;
}

.cms-datetime__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

/* Weekdays */
.cms-datetime__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.cms-datetime__weekday {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  padding: 6px 0;
}

/* Days grid */
.cms-datetime__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cms-datetime__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datetime__day:hover:not(:disabled) {
  background: #f3f4f6;
}

.cms-datetime__day--other-month {
  color: #d1d5db;
}

.cms-datetime__day--today {
  font-weight: 600;
  color: var(--cms-primary, #2563eb);
}

.cms-datetime__day--selected {
  background: var(--cms-primary, #2563eb);
  color: white;
  font-weight: 500;
}

.cms-datetime__day--selected:hover {
  background: var(--cms-primary-hover, #1d4ed8);
}

.cms-datetime__day--disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

/* Footer */
.cms-datetime__footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.cms-datetime__today {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cms-primary, #2563eb);
  background: var(--cms-primary-light, rgba(37, 99, 235, 0.1));
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datetime__today:hover {
  background: var(--cms-primary, #2563eb);
  color: white;
}

/* Time Panel */
.cms-datetime__time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.cms-datetime__time-preview {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.cms-datetime__now {
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

.cms-datetime__now:hover {
  background: var(--cms-primary, #2563eb);
  color: white;
}

/* Time selectors */
.cms-datetime__time-selectors {
  display: flex;
  gap: 8px;
}

.cms-datetime__time-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cms-datetime__time-column--period {
  flex: 0 0 70px;
}

.cms-datetime__time-column-header {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  text-align: center;
  padding-bottom: 8px;
}

.cms-datetime__time-scroll {
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 4px;
}

.cms-datetime__time-scroll::-webkit-scrollbar {
  width: 4px;
}

.cms-datetime__time-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}

.cms-datetime__time-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.cms-datetime__time-option {
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

.cms-datetime__time-option:hover {
  background: #f3f4f6;
}

.cms-datetime__time-option--selected {
  background: var(--cms-primary, #2563eb);
  color: white;
  font-weight: 500;
}

.cms-datetime__time-option--selected:hover {
  background: var(--cms-primary-hover, #1d4ed8);
}

/* Period buttons */
.cms-datetime__time-period-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cms-datetime__time-period {
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

.cms-datetime__time-period:hover {
  background: #e5e7eb;
}

.cms-datetime__time-period--selected {
  background: var(--cms-primary, #2563eb);
  color: white;
}

.cms-datetime__time-period--selected:hover {
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

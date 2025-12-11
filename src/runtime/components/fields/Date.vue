<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { DateFieldDefinition } from '../../types'

interface Props {
  modelValue: string | null
  field: DateFieldDefinition
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
const viewDate = ref(new Date())
const viewMode = ref<'days' | 'months' | 'years'>('days')

// Computed
const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
const placeholder = computed(() => props.field.placeholder || 'Pick a date')

// Parse current value
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  return new Date(props.modelValue + 'T00:00:00')
})

// Format for display
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

// Calendar data
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const headerText = computed(() => {
  if (viewMode.value === 'years') {
    const startYear = Math.floor(viewDate.value.getFullYear() / 12) * 12
    return `${startYear} - ${startYear + 11}`
  }
  if (viewMode.value === 'months') {
    return viewDate.value.getFullYear().toString()
  }
  return `${monthNames[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`
})

// Generate calendar days
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()

  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = []

  // Previous month days
  const prevMonth = new Date(year, month, 0)
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i)
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

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    const dateStr = formatDateValue(date)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isSelected: props.modelValue === dateStr,
      isDisabled: isDateDisabled(date)
    })
  }

  // Next month days (fill to 42 cells for 6 rows)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
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

// Generate months for month picker
const calendarMonths = computed(() => {
  const year = viewDate.value.getFullYear()
  return monthNamesShort.map((name, index) => ({
    name,
    month: index,
    isSelected: selectedDate.value?.getMonth() === index && selectedDate.value?.getFullYear() === year,
    isCurrent: new Date().getMonth() === index && new Date().getFullYear() === year
  }))
})

// Generate years for year picker
const calendarYears = computed(() => {
  const startYear = Math.floor(viewDate.value.getFullYear() / 12) * 12
  const years: { year: number; isSelected: boolean; isCurrent: boolean }[] = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i < 12; i++) {
    const year = startYear + i
    years.push({
      year,
      isSelected: selectedDate.value?.getFullYear() === year,
      isCurrent: currentYear === year
    })
  }
  return years
})

// Check if date is disabled
function isDateDisabled(date: Date): boolean {
  if (props.field.min) {
    const min = new Date(props.field.min + 'T00:00:00')
    if (date < min) return true
  }
  if (props.field.max) {
    const max = new Date(props.field.max + 'T23:59:59')
    if (date > max) return true
  }
  return false
}

// Format date for value (always YYYY-MM-DD)
function formatDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Navigation
function prev() {
  if (viewMode.value === 'years') {
    viewDate.value = new Date(viewDate.value.getFullYear() - 12, viewDate.value.getMonth(), 1)
  } else if (viewMode.value === 'months') {
    viewDate.value = new Date(viewDate.value.getFullYear() - 1, viewDate.value.getMonth(), 1)
  } else {
    viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
  }
}

function next() {
  if (viewMode.value === 'years') {
    viewDate.value = new Date(viewDate.value.getFullYear() + 12, viewDate.value.getMonth(), 1)
  } else if (viewMode.value === 'months') {
    viewDate.value = new Date(viewDate.value.getFullYear() + 1, viewDate.value.getMonth(), 1)
  } else {
    viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
  }
}

function toggleViewMode() {
  if (viewMode.value === 'days') {
    viewMode.value = 'months'
  } else if (viewMode.value === 'months') {
    viewMode.value = 'years'
  }
}

// Select handlers
function selectDate(date: Date) {
  if (isDateDisabled(date)) return
  emit('update:modelValue', formatDateValue(date))
  isOpen.value = false
}

function selectMonth(month: number) {
  viewDate.value = new Date(viewDate.value.getFullYear(), month, 1)
  viewMode.value = 'days'
}

function selectYear(year: number) {
  viewDate.value = new Date(year, viewDate.value.getMonth(), 1)
  viewMode.value = 'months'
}

function goToToday() {
  const today = new Date()
  viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectDate(today)
}

// Clear
function clear(event: Event) {
  event.stopPropagation()
  emit('update:modelValue', null)
}

// Toggle
function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    viewMode.value = 'days'
    if (selectedDate.value) {
      viewDate.value = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)
    } else {
      viewDate.value = new Date()
    }
  }
}

// Outside click
function handleOutsideClick(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>

    <div
      ref="containerRef"
      class="cms-datepicker"
      :class="{
        'cms-datepicker--open': isOpen,
        'cms-datepicker--disabled': disabled,
        'cms-datepicker--error': error
      }"
    >
      <!-- Trigger -->
      <button
        type="button"
        class="cms-datepicker__trigger"
        :disabled="disabled"
        @click="toggle"
      >
        <svg class="cms-datepicker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>

        <span
          class="cms-datepicker__value"
          :class="{ 'cms-datepicker__value--placeholder': !displayValue }"
        >
          {{ displayValue || placeholder }}
        </span>

        <div class="cms-datepicker__actions">
          <button
            v-if="modelValue && !disabled"
            type="button"
            class="cms-datepicker__clear"
            @click="clear"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="cms-datepicker__dropdown">
          <!-- Header -->
          <div class="cms-datepicker__header">
            <button type="button" class="cms-datepicker__nav" @click="prev" title="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <button type="button" class="cms-datepicker__title" @click="toggleViewMode">
              {{ headerText }}
            </button>

            <button type="button" class="cms-datepicker__nav" @click="next" title="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <!-- Days View -->
          <template v-if="viewMode === 'days'">
            <div class="cms-datepicker__weekdays">
              <span v-for="day in weekDays" :key="day" class="cms-datepicker__weekday">
                {{ day }}
              </span>
            </div>

            <div class="cms-datepicker__grid cms-datepicker__grid--days">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                type="button"
                class="cms-datepicker__day"
                :class="{
                  'cms-datepicker__day--other': !day.isCurrentMonth,
                  'cms-datepicker__day--today': day.isToday,
                  'cms-datepicker__day--selected': day.isSelected,
                  'cms-datepicker__day--disabled': day.isDisabled
                }"
                :disabled="day.isDisabled"
                @click="selectDate(day.date)"
              >
                {{ day.date.getDate() }}
              </button>
            </div>
          </template>

          <!-- Months View -->
          <template v-else-if="viewMode === 'months'">
            <div class="cms-datepicker__grid cms-datepicker__grid--months">
              <button
                v-for="item in calendarMonths"
                :key="item.month"
                type="button"
                class="cms-datepicker__month"
                :class="{
                  'cms-datepicker__month--current': item.isCurrent,
                  'cms-datepicker__month--selected': item.isSelected
                }"
                @click="selectMonth(item.month)"
              >
                {{ item.name }}
              </button>
            </div>
          </template>

          <!-- Years View -->
          <template v-else>
            <div class="cms-datepicker__grid cms-datepicker__grid--years">
              <button
                v-for="item in calendarYears"
                :key="item.year"
                type="button"
                class="cms-datepicker__year"
                :class="{
                  'cms-datepicker__year--current': item.isCurrent,
                  'cms-datepicker__year--selected': item.isSelected
                }"
                @click="selectYear(item.year)"
              >
                {{ item.year }}
              </button>
            </div>
          </template>

          <!-- Footer -->
          <div class="cms-datepicker__footer">
            <button type="button" class="cms-datepicker__today" @click="goToToday">
              Today
            </button>
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

/* Datepicker Container */
.cms-datepicker {
  position: relative;
}

.cms-datepicker--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Trigger */
.cms-datepicker__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.cms-datepicker__trigger:hover:not(:disabled) {
  border-color: #9ca3af;
}

.cms-datepicker--open .cms-datepicker__trigger {
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.cms-datepicker--error .cms-datepicker__trigger {
  border-color: #dc2626;
}

.cms-datepicker__icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
}

.cms-datepicker__value {
  flex: 1;
  font-size: 14px;
  color: #111827;
}

.cms-datepicker__value--placeholder {
  color: #9ca3af;
}

.cms-datepicker__actions {
  display: flex;
  align-items: center;
}

.cms-datepicker__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datepicker__clear:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.cms-datepicker__clear svg {
  width: 14px;
  height: 14px;
}

/* Dropdown */
.cms-datepicker__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: 288px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Header */
.cms-datepicker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
}

.cms-datepicker__title {
  flex: 1;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cms-datepicker__title:hover {
  background-color: #f3f4f6;
}

.cms-datepicker__nav {
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

.cms-datepicker__nav:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.cms-datepicker__nav svg {
  width: 16px;
  height: 16px;
}

/* Weekdays */
.cms-datepicker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 8px 8px;
}

.cms-datepicker__weekday {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
}

/* Grid */
.cms-datepicker__grid {
  padding: 0 8px 8px;
}

.cms-datepicker__grid--days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cms-datepicker__grid--months,
.cms-datepicker__grid--years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

/* Day Button */
.cms-datepicker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  font-size: 14px;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.cms-datepicker__day:hover:not(:disabled):not(.cms-datepicker__day--selected) {
  background-color: #f3f4f6;
}

.cms-datepicker__day--other {
  color: #d1d5db;
}

.cms-datepicker__day--today {
  font-weight: 600;
  background-color: #f3f4f6;
}

.cms-datepicker__day--selected {
  font-weight: 600;
  color: white;
  background-color: var(--cms-primary, #2563eb);
}

.cms-datepicker__day--selected:hover {
  background-color: var(--cms-primary-hover, #1d4ed8);
}

.cms-datepicker__day--disabled {
  color: #e5e7eb;
  cursor: not-allowed;
}

/* Month Button */
.cms-datepicker__month,
.cms-datepicker__year {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-size: 14px;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.cms-datepicker__month:hover,
.cms-datepicker__year:hover {
  background-color: #f3f4f6;
}

.cms-datepicker__month--current,
.cms-datepicker__year--current {
  font-weight: 600;
  background-color: #f3f4f6;
}

.cms-datepicker__month--selected,
.cms-datepicker__year--selected {
  font-weight: 600;
  color: white;
  background-color: var(--cms-primary, #2563eb);
}

.cms-datepicker__month--selected:hover,
.cms-datepicker__year--selected:hover {
  background-color: var(--cms-primary-hover, #1d4ed8);
}

/* Footer */
.cms-datepicker__footer {
  display: flex;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid #f3f4f6;
}

.cms-datepicker__today {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cms-primary, #2563eb);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-datepicker__today:hover {
  background-color: var(--cms-primary-light, #dbeafe);
}
</style>

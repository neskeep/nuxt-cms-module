<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { BaseFieldDefinition } from '../../types'

interface TagsFieldDefinition extends BaseFieldDefinition {
  type: 'tags'
  maxTags?: number
  minTags?: number
  allowDuplicates?: boolean
  suggestions?: string[]
  delimiter?: string
  validateTag?: (tag: string) => boolean | string
}

interface Props {
  modelValue: string[] | null
  field: TagsFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[] | null]
}>()

// State
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// Computed
const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
const placeholder = computed(() => props.field.placeholder || 'Type and press Enter')
const maxTags = computed(() => props.field.maxTags || Infinity)
const allowDuplicates = computed(() => props.field.allowDuplicates || false)
const delimiter = computed(() => props.field.delimiter || ',')

// Current tags
const tags = computed<string[]>(() => {
  return props.modelValue || []
})

// Can add more tags?
const canAddMore = computed(() => tags.value.length < maxTags.value)

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!props.field.suggestions || !inputValue.value) return []

  const query = inputValue.value.toLowerCase()
  return props.field.suggestions.filter(s => {
    const matchesQuery = s.toLowerCase().includes(query)
    const notAlreadyAdded = allowDuplicates.value || !tags.value.includes(s)
    return matchesQuery && notAlreadyAdded
  }).slice(0, 8)
})

// Add a tag
function addTag(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return

  // Validate
  if (props.field.validateTag) {
    const result = props.field.validateTag(trimmed)
    if (result !== true) {
      return
    }
  }

  // Check duplicates
  if (!allowDuplicates.value && tags.value.includes(trimmed)) {
    return
  }

  // Check max
  if (!canAddMore.value) {
    return
  }

  emit('update:modelValue', [...tags.value, trimmed])
  inputValue.value = ''
  showSuggestions.value = false
  highlightedIndex.value = -1
}

// Remove a tag
function removeTag(index: number) {
  if (props.disabled) return
  const newTags = [...tags.value]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags.length > 0 ? newTags : null)
}

// Remove last tag on backspace when input is empty
function handleBackspace() {
  if (inputValue.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

// Handle input
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Check for delimiter
  if (value.includes(delimiter.value)) {
    const parts = value.split(delimiter.value)
    parts.forEach((part, i) => {
      if (i < parts.length - 1) {
        addTag(part)
      } else {
        inputValue.value = part
      }
    })
  } else {
    inputValue.value = value
  }

  showSuggestions.value = filteredSuggestions.value.length > 0
  highlightedIndex.value = filteredSuggestions.value.length > 0 ? 0 : -1
}

// Handle keydown
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        addTag(filteredSuggestions.value[highlightedIndex.value])
      } else if (inputValue.value) {
        addTag(inputValue.value)
      }
      break
    case 'Backspace':
      handleBackspace()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (showSuggestions.value) {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredSuggestions.value.length - 1
        )
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (showSuggestions.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      }
      break
    case 'Escape':
      showSuggestions.value = false
      highlightedIndex.value = -1
      break
    case 'Tab':
      if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        event.preventDefault()
        addTag(filteredSuggestions.value[highlightedIndex.value])
      }
      break
  }
}

// Focus input when clicking container
function focusInput() {
  if (!props.disabled) {
    inputRef.value?.focus()
  }
}

// Select suggestion
function selectSuggestion(suggestion: string) {
  addTag(suggestion)
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Clear all
function clearAll() {
  if (props.disabled) return
  emit('update:modelValue', null)
}

// Hide suggestions on blur (with delay for click)
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

// Watch input to show/hide suggestions
watch(inputValue, (val) => {
  showSuggestions.value = val.length > 0 && filteredSuggestions.value.length > 0
})
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>

    <div
      class="cms-tags"
      :class="{
        'cms-tags--disabled': disabled,
        'cms-tags--error': error,
        'cms-tags--focused': showSuggestions
      }"
      @click="focusInput"
    >
      <div class="cms-tags__container">
        <!-- Tags -->
        <TransitionGroup name="tag" tag="div" class="cms-tags__list">
          <span
            v-for="(tag, index) in tags"
            :key="tag + index"
            class="cms-tags__tag"
          >
            <span class="cms-tags__tag-text">{{ tag }}</span>
            <button
              type="button"
              class="cms-tags__tag-remove"
              @click.stop="removeTag(index)"
              :disabled="disabled"
              tabindex="-1"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" class="cms-tags__tag-icon">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
              </svg>
            </button>
          </span>
        </TransitionGroup>

        <!-- Input -->
        <input
          ref="inputRef"
          :value="inputValue"
          type="text"
          class="cms-tags__input"
          :placeholder="tags.length === 0 ? placeholder : ''"
          :disabled="disabled || !canAddMore"
          @input="handleInput"
          @keydown="handleKeydown"
          @blur="handleBlur"
          @focus="showSuggestions = filteredSuggestions.length > 0"
        />
      </div>

      <!-- Clear button -->
      <button
        v-if="tags.length > 0 && !disabled"
        type="button"
        class="cms-tags__clear"
        @click.stop="clearAll"
        title="Clear all"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="cms-tags__clear-icon">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
        </svg>
      </button>

      <!-- Suggestions dropdown -->
      <Transition name="dropdown">
        <div v-if="showSuggestions && filteredSuggestions.length > 0" class="cms-tags__suggestions">
          <button
            v-for="(suggestion, index) in filteredSuggestions"
            :key="suggestion"
            type="button"
            class="cms-tags__suggestion"
            :class="{ 'cms-tags__suggestion--highlighted': index === highlightedIndex }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="highlightedIndex = index"
          >
            {{ suggestion }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Info -->
    <div class="cms-tags__info">
      <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
      <p v-if="error" class="cms-field__error">{{ error }}</p>
      <span v-if="maxTags !== Infinity" class="cms-tags__count">
        {{ tags.length }} / {{ maxTags }}
      </span>
    </div>
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

/* Tags Container */
.cms-tags {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 42px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: text;
  transition: all 0.15s ease;
}

.cms-tags:hover:not(.cms-tags--disabled) {
  border-color: #9ca3af;
}

.cms-tags--focused {
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.cms-tags--error {
  border-color: #dc2626;
}

.cms-tags--error.cms-tags--focused {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.cms-tags--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.cms-tags__container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.cms-tags__list {
  display: contents;
}

/* Tag */
.cms-tags__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 13px;
  background-color: var(--cms-primary-light, #dbeafe);
  color: var(--cms-primary, #2563eb);
  border-radius: 6px;
  font-weight: 500;
  animation: tag-in 0.2s ease;
}

@keyframes tag-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tag-enter-active {
  animation: tag-in 0.2s ease;
}

.tag-leave-active {
  animation: tag-in 0.15s ease reverse;
}

.cms-tags__tag-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cms-tags__tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.15s ease;
}

.cms-tags__tag-remove:hover:not(:disabled) {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.cms-tags__tag-icon {
  width: 12px;
  height: 12px;
}

/* Input */
.cms-tags__input {
  flex: 1;
  min-width: 120px;
  padding: 4px 0;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
  color: #111827;
}

.cms-tags__input::placeholder {
  color: #9ca3af;
}

.cms-tags__input:disabled {
  cursor: not-allowed;
}

/* Clear */
.cms-tags__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin-top: 5px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.cms-tags__clear:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.cms-tags__clear-icon {
  width: 16px;
  height: 16px;
}

/* Suggestions */
.cms-tags__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  padding: 4px;
}

.cms-tags__suggestion {
  display: block;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s ease;
}

.cms-tags__suggestion:hover,
.cms-tags__suggestion--highlighted {
  background-color: #f3f4f6;
}

.cms-tags__suggestion--highlighted {
  color: var(--cms-primary, #2563eb);
}

/* Info row */
.cms-tags__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.cms-tags__count {
  font-size: 12px;
  color: #9ca3af;
  margin-left: auto;
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

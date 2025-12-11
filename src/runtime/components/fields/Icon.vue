<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { IconFieldDefinition } from '../../types'

// Complete Heroicons icon list organized by category
const HEROICONS_DATA = {
  arrows: [
    'arrow-down', 'arrow-down-circle', 'arrow-down-left', 'arrow-down-on-square', 'arrow-down-on-square-stack',
    'arrow-down-right', 'arrow-down-tray', 'arrow-left', 'arrow-left-circle', 'arrow-left-end-on-rectangle',
    'arrow-left-on-rectangle', 'arrow-left-start-on-rectangle', 'arrow-long-down', 'arrow-long-left',
    'arrow-long-right', 'arrow-long-up', 'arrow-path', 'arrow-path-rounded-square', 'arrow-right',
    'arrow-right-circle', 'arrow-right-end-on-rectangle', 'arrow-right-on-rectangle', 'arrow-right-start-on-rectangle',
    'arrow-top-right-on-square', 'arrow-trending-down', 'arrow-trending-up', 'arrow-turn-down-left',
    'arrow-turn-down-right', 'arrow-turn-left-down', 'arrow-turn-left-up', 'arrow-turn-right-down',
    'arrow-turn-right-up', 'arrow-turn-up-left', 'arrow-turn-up-right', 'arrow-up', 'arrow-up-circle',
    'arrow-up-left', 'arrow-up-on-square', 'arrow-up-on-square-stack', 'arrow-up-right', 'arrow-up-tray',
    'arrow-uturn-down', 'arrow-uturn-left', 'arrow-uturn-right', 'arrow-uturn-up', 'arrows-pointing-in',
    'arrows-pointing-out', 'arrows-right-left', 'arrows-up-down'
  ],
  actions: [
    'adjustments-horizontal', 'adjustments-vertical', 'archive-box', 'archive-box-arrow-down',
    'archive-box-x-mark', 'backspace', 'bolt', 'bolt-slash', 'bookmark', 'bookmark-slash', 'bookmark-square',
    'check', 'check-badge', 'check-circle', 'clipboard', 'clipboard-document', 'clipboard-document-check',
    'clipboard-document-list', 'cog', 'cog-6-tooth', 'cog-8-tooth', 'command-line', 'cursor-arrow-rays',
    'cursor-arrow-ripple', 'document-duplicate', 'ellipsis-horizontal', 'ellipsis-horizontal-circle',
    'ellipsis-vertical', 'finger-print', 'fire', 'flag', 'funnel', 'hand-raised', 'hand-thumb-down',
    'hand-thumb-up', 'hashtag', 'heart', 'home', 'home-modern', 'identification', 'inbox', 'inbox-arrow-down',
    'inbox-stack', 'key', 'lifebuoy', 'light-bulb', 'link', 'lock-closed', 'lock-open', 'magnifying-glass',
    'magnifying-glass-circle', 'magnifying-glass-minus', 'magnifying-glass-plus', 'minus', 'minus-circle',
    'pencil', 'pencil-square', 'plus', 'plus-circle', 'power', 'printer', 'puzzle-piece', 'qr-code',
    'queue-list', 'receipt-percent', 'receipt-refund', 'rocket-launch', 'rss', 'scale', 'scissors',
    'share', 'shield-check', 'shield-exclamation', 'sparkles', 'star', 'stop', 'stop-circle', 'swatch',
    'tag', 'trash', 'trophy', 'variable', 'wrench', 'wrench-screwdriver', 'x-circle', 'x-mark'
  ],
  media: [
    'camera', 'film', 'folder', 'folder-arrow-down', 'folder-minus', 'folder-open', 'folder-plus',
    'gif', 'microphone', 'musical-note', 'paint-brush', 'paper-clip', 'photo', 'play', 'play-circle',
    'play-pause', 'pause', 'pause-circle', 'speaker-wave', 'speaker-x-mark', 'video-camera', 'video-camera-slash'
  ],
  communication: [
    'at-symbol', 'bell', 'bell-alert', 'bell-slash', 'bell-snooze', 'chat-bubble-bottom-center',
    'chat-bubble-bottom-center-text', 'chat-bubble-left', 'chat-bubble-left-ellipsis', 'chat-bubble-left-right',
    'chat-bubble-oval-left', 'chat-bubble-oval-left-ellipsis', 'envelope', 'envelope-open', 'inbox',
    'megaphone', 'paper-airplane', 'phone', 'phone-arrow-down-left', 'phone-arrow-up-right', 'phone-x-mark'
  ],
  documents: [
    'book-open', 'bookmark', 'clipboard', 'document', 'document-arrow-down', 'document-arrow-up',
    'document-chart-bar', 'document-check', 'document-currency-bangladeshi', 'document-currency-dollar',
    'document-currency-euro', 'document-currency-pound', 'document-currency-rupee', 'document-currency-yen',
    'document-magnifying-glass', 'document-minus', 'document-plus', 'document-text', 'newspaper'
  ],
  ui: [
    'bars-2', 'bars-3', 'bars-3-bottom-left', 'bars-3-bottom-right', 'bars-3-center-left', 'bars-4',
    'chart-bar', 'chart-bar-square', 'chart-pie', 'chevron-double-down', 'chevron-double-left',
    'chevron-double-right', 'chevron-double-up', 'chevron-down', 'chevron-left', 'chevron-right',
    'chevron-up', 'chevron-up-down', 'code-bracket', 'code-bracket-square', 'cpu-chip', 'cube',
    'cube-transparent', 'currency-bangladeshi', 'currency-dollar', 'currency-euro', 'currency-pound',
    'currency-rupee', 'currency-yen', 'eye', 'eye-dropper', 'eye-slash', 'face-frown', 'face-smile',
    'list-bullet', 'minus-small', 'plus-small', 'presentation-chart-bar', 'presentation-chart-line',
    'rectangle-group', 'rectangle-stack', 'server', 'server-stack', 'signal', 'signal-slash',
    'square-2-stack', 'square-3-stack-3d', 'squares-2x2', 'squares-plus', 'table-cells', 'view-columns',
    'viewfinder-circle', 'wifi', 'window'
  ],
  users: [
    'academic-cap', 'briefcase', 'building-library', 'building-office', 'building-office-2',
    'building-storefront', 'cake', 'calculator', 'calendar', 'calendar-days', 'clock', 'credit-card',
    'gift', 'gift-top', 'globe-alt', 'globe-americas', 'globe-asia-australia', 'globe-europe-africa',
    'language', 'map', 'map-pin', 'shopping-bag', 'shopping-cart', 'ticket', 'truck', 'user',
    'user-circle', 'user-group', 'user-minus', 'user-plus', 'users'
  ],
  alerts: [
    'exclamation-circle', 'exclamation-triangle', 'information-circle', 'no-symbol', 'question-mark-circle',
    'shield-exclamation'
  ],
  devices: [
    'battery-0', 'battery-50', 'battery-100', 'computer-desktop', 'device-phone-mobile', 'device-tablet',
    'printer', 'tv'
  ],
  weather: [
    'cloud', 'cloud-arrow-down', 'cloud-arrow-up', 'moon', 'sun'
  ]
}

// Flatten all icons for full list
const ALL_ICONS = Object.values(HEROICONS_DATA).flat()

interface Props {
  modelValue: string | null
  field: IconFieldDefinition
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
const searchQuery = ref('')
const selectedVariant = ref<'outline' | 'solid'>(
  (props.field.defaultVariant as 'outline' | 'solid') || 'outline'
)

// Available variants - only outline and solid are supported
const availableVariants = computed(() => {
  const allowed = ['outline', 'solid'] as const
  if (props.field.variants?.length) {
    return props.field.variants.filter(v => allowed.includes(v as any)) as ('outline' | 'solid')[]
  }
  return [...allowed]
})

// Computed
const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)
const clearable = computed(() => props.field.clearable !== false)

// Parse current value to extract icon name and variant
const parsedValue = computed(() => {
  if (!props.modelValue) return null

  // Format: heroicons:icon-name or heroicons:icon-name-20-solid
  const value = props.modelValue

  // Check if it's solid variant (ends with -20-solid)
  if (value.includes('-20-solid')) {
    const name = value.replace(/^heroicons:/, '').replace(/-20-solid$/, '')
    return { variant: 'solid' as const, name }
  }

  // Otherwise it's outline
  const name = value.replace(/^heroicons:/, '')
  return { variant: 'outline' as const, name }
})

// Current icon name for display
const currentIconName = computed(() => parsedValue.value?.name || null)

// Get Nuxt UI icon format
const getIconClass = (iconName: string, variant: string) => {
  if (variant === 'solid') {
    return `i-heroicons-${iconName}-20-solid`
  }
  // Default to outline
  return `i-heroicons-${iconName}`
}

// Full icon value for storage (Iconify format for compatibility)
const getIconValue = (iconName: string, variant: string) => {
  if (variant === 'solid') {
    return `heroicons:${iconName}-20-solid`
  }
  // Default to outline
  return `heroicons:${iconName}`
}

// Filter icons based on search and categories
const filteredIcons = computed(() => {
  let icons = ALL_ICONS

  // Filter by categories if specified
  if (props.field.categories?.length) {
    icons = props.field.categories.flatMap(cat =>
      HEROICONS_DATA[cat as keyof typeof HEROICONS_DATA] || []
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(icon => icon.toLowerCase().includes(query))
  }

  return [...new Set(icons)].sort()
})

// Grouped icons by category for better UX
const groupedIcons = computed(() => {
  if (searchQuery.value) {
    return { 'Search Results': filteredIcons.value }
  }

  const groups: Record<string, string[]> = {}
  const categories = props.field.categories?.length
    ? props.field.categories
    : Object.keys(HEROICONS_DATA)

  for (const cat of categories) {
    const catIcons = HEROICONS_DATA[cat as keyof typeof HEROICONS_DATA]
    if (catIcons?.length) {
      groups[cat.charAt(0).toUpperCase() + cat.slice(1)] = catIcons.filter(icon =>
        !searchQuery.value || icon.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
  }

  return groups
})

// Methods
function selectIcon(iconName: string) {
  const value = getIconValue(iconName, selectedVariant.value)
  emit('update:modelValue', value)
  isOpen.value = false
  searchQuery.value = ''
}

function clearSelection() {
  emit('update:modelValue', null)
}

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (!isOpen.value) {
      searchQuery.value = ''
    }
  }
}

// Update variant and re-emit value
function changeVariant(variant: 'outline' | 'solid') {
  selectedVariant.value = variant
  if (currentIconName.value) {
    const value = getIconValue(currentIconName.value, variant)
    emit('update:modelValue', value)
  }
}

// Close dropdown on outside click
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.cms-icon-picker')) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// Set variant from current value on mount
onMounted(() => {
  if (parsedValue.value?.variant) {
    selectedVariant.value = parsedValue.value.variant
  }
  document.addEventListener('click', handleOutsideClick)
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

// Format icon name for display
function formatIconName(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Variant labels
const variantLabels: Record<string, string> = {
  outline: 'Outline (24px)',
  solid: 'Solid (20px)'
}
</script>

<template>
  <div class="cms-field">
    <label class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>

    <div class="cms-icon-picker" :class="{ 'cms-icon-picker--disabled': disabled }">
      <!-- Selected Icon Display / Trigger -->
      <button
        type="button"
        class="cms-icon-picker__trigger"
        :class="{
          'cms-icon-picker__trigger--open': isOpen,
          'cms-icon-picker__trigger--error': error
        }"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <template v-if="currentIconName">
          <UIcon
            :name="getIconClass(currentIconName, selectedVariant)"
            class="cms-icon-picker__preview"
          />
          <span class="cms-icon-picker__selected-name">{{ formatIconName(currentIconName) }}</span>
          <span class="cms-icon-picker__variant-badge">{{ selectedVariant }}</span>
        </template>
        <template v-else>
          <UIcon name="i-heroicons-squares-plus" class="cms-icon-picker__placeholder-icon" />
          <span class="cms-icon-picker__placeholder">Select an icon</span>
        </template>

        <div class="cms-icon-picker__actions">
          <button
            v-if="currentIconName && clearable"
            type="button"
            class="cms-icon-picker__clear"
            @click.stop="clearSelection"
            title="Clear selection"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
          <UIcon
            name="i-heroicons-chevron-down"
            class="cms-icon-picker__chevron"
            :class="{ 'cms-icon-picker__chevron--open': isOpen }"
          />
        </div>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="cms-icon-picker__dropdown">
          <!-- Search & Variant Selector -->
          <div class="cms-icon-picker__header">
            <div class="cms-icon-picker__search-wrap">
              <UIcon name="i-heroicons-magnifying-glass" class="cms-icon-picker__search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="cms-icon-picker__search"
                placeholder="Search icons..."
                @click.stop
              />
            </div>

            <div class="cms-icon-picker__variants">
              <button
                v-for="variant in availableVariants"
                :key="variant"
                type="button"
                class="cms-icon-picker__variant-btn"
                :class="{ 'cms-icon-picker__variant-btn--active': selectedVariant === variant }"
                @click.stop="changeVariant(variant)"
                :title="variantLabels[variant]"
              >
                {{ variant.charAt(0).toUpperCase() }}
              </button>
            </div>
          </div>

          <!-- Icons Grid -->
          <div class="cms-icon-picker__content">
            <template v-if="filteredIcons.length">
              <div
                v-for="(icons, category) in groupedIcons"
                :key="category"
                class="cms-icon-picker__category"
              >
                <div v-if="icons.length" class="cms-icon-picker__category-header">
                  {{ category }}
                </div>
                <div v-if="icons.length" class="cms-icon-picker__grid">
                  <button
                    v-for="iconName in icons"
                    :key="iconName"
                    type="button"
                    class="cms-icon-picker__icon"
                    :class="{ 'cms-icon-picker__icon--selected': currentIconName === iconName }"
                    :title="formatIconName(iconName)"
                    @click.stop="selectIcon(iconName)"
                  >
                    <UIcon :name="getIconClass(iconName, selectedVariant)" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </template>
            <div v-else class="cms-icon-picker__empty">
              <UIcon name="i-heroicons-face-frown" class="w-8 h-8 text-gray-300" />
              <p>No icons found</p>
            </div>
          </div>

          <!-- Footer with count -->
          <div class="cms-icon-picker__footer">
            <span>{{ filteredIcons.length }} icons</span>
            <span v-if="currentIconName" class="cms-icon-picker__current">
              Selected: {{ currentIconName }}
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.cms-icon-picker {
  position: relative;
}

.cms-icon-picker--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Trigger Button */
.cms-icon-picker__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.cms-icon-picker__trigger:hover {
  border-color: #9ca3af;
}

.cms-icon-picker__trigger--open {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.cms-icon-picker__trigger--error {
  border-color: #dc2626;
}

.cms-icon-picker__preview {
  width: 24px;
  height: 24px;
  color: #374151;
  flex-shrink: 0;
}

.cms-icon-picker__selected-name {
  flex: 1;
  font-size: 14px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cms-icon-picker__variant-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  text-transform: capitalize;
}

.cms-icon-picker__placeholder-icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.cms-icon-picker__placeholder {
  flex: 1;
  font-size: 14px;
  color: #9ca3af;
}

.cms-icon-picker__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cms-icon-picker__clear {
  padding: 4px;
  color: #9ca3af;
  border-radius: 4px;
  transition: all 0.15s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.cms-icon-picker__clear:hover {
  color: #dc2626;
  background: #fef2f2;
}

.cms-icon-picker__chevron {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.cms-icon-picker__chevron--open {
  transform: rotate(180deg);
}

/* Dropdown */
.cms-icon-picker__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
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

/* Header */
.cms-icon-picker__header {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cms-icon-picker__search-wrap {
  flex: 1;
  position: relative;
}

.cms-icon-picker__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.cms-icon-picker__search {
  width: 100%;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
}

.cms-icon-picker__search:focus {
  border-color: #2563eb;
}

.cms-icon-picker__variants {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: #e5e7eb;
  border-radius: 6px;
}

.cms-icon-picker__variant-btn {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-icon-picker__variant-btn:hover {
  color: #374151;
}

.cms-icon-picker__variant-btn--active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Content */
.cms-icon-picker__content {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.cms-icon-picker__category {
  margin-bottom: 12px;
}

.cms-icon-picker__category:last-child {
  margin-bottom: 0;
}

.cms-icon-picker__category-header {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  margin-bottom: 6px;
}

.cms-icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.cms-icon-picker__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cms-icon-picker__icon:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.cms-icon-picker__icon--selected {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.cms-icon-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #9ca3af;
}

.cms-icon-picker__empty p {
  font-size: 14px;
}

/* Footer */
.cms-icon-picker__footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  color: #6b7280;
}

.cms-icon-picker__current {
  font-weight: 500;
  color: #374151;
}

/* Responsive */
@media (max-width: 640px) {
  .cms-icon-picker__grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .cms-icon-picker__dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
  }

  .cms-icon-picker__content {
    max-height: 50vh;
  }
}
</style>

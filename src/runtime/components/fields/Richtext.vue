<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import type { RichtextFieldDefinition } from '../../types'

interface Props {
  modelValue: string
  field: RichtextFieldDefinition
  fieldName: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const label = computed(() => props.field.label || props.fieldName)
const help = computed(() => props.field.help || '')
const required = computed(() => props.field.required || false)

// Link modal state
const showLinkModal = ref(false)
const linkUrl = ref('')
const linkText = ref('')

// Image modal state
const showImageModal = ref(false)
const imageUrl = ref('')
const imageAlt = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4]
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'richtext-code-block'
        }
      }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'richtext-link'
      }
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'richtext-image'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Underline,
    Placeholder.configure({
      placeholder: props.field.placeholder || 'Start writing...'
    })
  ],
  editable: !props.disabled,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

watch(() => props.disabled, (disabled) => {
  editor.value?.setEditable(!disabled)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Define all toolbar button groups
type ToolbarAction =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4'
  | 'bulletList' | 'orderedList'
  | 'blockquote' | 'code' | 'codeBlock'
  | 'link' | 'unlink' | 'image'
  | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'
  | 'horizontalRule' | 'clearFormat'

interface ToolbarButton {
  action: ToolbarAction
  icon: string
  title: string
  group: string
}

// All available toolbar buttons organized by group
const allToolbarButtons: ToolbarButton[] = [
  // Text formatting
  { action: 'bold', icon: 'bold', title: 'Bold (Ctrl+B)', group: 'formatting' },
  { action: 'italic', icon: 'italic', title: 'Italic (Ctrl+I)', group: 'formatting' },
  { action: 'underline', icon: 'underline', title: 'Underline (Ctrl+U)', group: 'formatting' },
  { action: 'strike', icon: 'strikethrough', title: 'Strikethrough', group: 'formatting' },

  // Headings
  { action: 'heading-1', icon: 'h1', title: 'Heading 1', group: 'heading' },
  { action: 'heading-2', icon: 'h2', title: 'Heading 2', group: 'heading' },
  { action: 'heading-3', icon: 'h3', title: 'Heading 3', group: 'heading' },
  { action: 'heading-4', icon: 'h4', title: 'Heading 4', group: 'heading' },

  // Lists
  { action: 'bulletList', icon: 'list-bullet', title: 'Bullet List', group: 'list' },
  { action: 'orderedList', icon: 'list-numbered', title: 'Numbered List', group: 'list' },

  // Blocks
  { action: 'blockquote', icon: 'quote', title: 'Block Quote', group: 'quote' },
  { action: 'code', icon: 'code-inline', title: 'Inline Code', group: 'code' },
  { action: 'codeBlock', icon: 'code-block', title: 'Code Block', group: 'code' },

  // Links & Media
  { action: 'link', icon: 'link', title: 'Insert Link', group: 'link' },
  { action: 'unlink', icon: 'unlink', title: 'Remove Link', group: 'link' },
  { action: 'image', icon: 'image', title: 'Insert Image', group: 'image' },

  // Alignment
  { action: 'alignLeft', icon: 'align-left', title: 'Align Left', group: 'align' },
  { action: 'alignCenter', icon: 'align-center', title: 'Align Center', group: 'align' },
  { action: 'alignRight', icon: 'align-right', title: 'Align Right', group: 'align' },
  { action: 'alignJustify', icon: 'align-justify', title: 'Justify', group: 'align' },

  // Extras
  { action: 'horizontalRule', icon: 'hr', title: 'Horizontal Rule', group: 'extras' },
  { action: 'clearFormat', icon: 'clear', title: 'Clear Formatting', group: 'extras' }
]

// Map field toolbar options to button groups
const toolbarGroupMap: Record<string, string[]> = {
  bold: ['bold'],
  italic: ['italic'],
  underline: ['underline'],
  strike: ['strike'],
  heading: ['heading-1', 'heading-2', 'heading-3', 'heading-4'],
  list: ['bulletList', 'orderedList'],
  quote: ['blockquote'],
  code: ['code', 'codeBlock'],
  link: ['link', 'unlink'],
  image: ['image'],
  align: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify']
}

// Compute which toolbar buttons to show based on field.toolbar config
const toolbarButtons = computed(() => {
  const fieldToolbar = props.field.toolbar

  // Default toolbar if none specified
  if (!fieldToolbar || fieldToolbar.length === 0) {
    return allToolbarButtons.filter(btn =>
      ['bold', 'italic', 'underline', 'strike', 'heading-1', 'heading-2',
       'bulletList', 'orderedList', 'blockquote', 'link', 'unlink', 'image'].includes(btn.action)
    )
  }

  // Build list of enabled actions
  const enabledActions: string[] = []
  for (const option of fieldToolbar) {
    const actions = toolbarGroupMap[option]
    if (actions) {
      enabledActions.push(...actions)
    }
  }

  return allToolbarButtons.filter(btn => enabledActions.includes(btn.action))
})

// Group toolbar buttons with separators
const groupedToolbarButtons = computed(() => {
  const groups: { buttons: ToolbarButton[], group: string }[] = []
  let currentGroup = ''

  for (const btn of toolbarButtons.value) {
    if (btn.group !== currentGroup) {
      groups.push({ buttons: [btn], group: btn.group })
      currentGroup = btn.group
    } else {
      groups[groups.length - 1].buttons.push(btn)
    }
  }

  return groups
})

function executeAction(action: ToolbarAction) {
  if (!editor.value) return

  switch (action) {
    case 'bold':
      editor.value.chain().focus().toggleBold().run()
      break
    case 'italic':
      editor.value.chain().focus().toggleItalic().run()
      break
    case 'underline':
      editor.value.chain().focus().toggleUnderline().run()
      break
    case 'strike':
      editor.value.chain().focus().toggleStrike().run()
      break
    case 'heading-1':
      editor.value.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case 'heading-2':
      editor.value.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case 'heading-3':
      editor.value.chain().focus().toggleHeading({ level: 3 }).run()
      break
    case 'heading-4':
      editor.value.chain().focus().toggleHeading({ level: 4 }).run()
      break
    case 'bulletList':
      editor.value.chain().focus().toggleBulletList().run()
      break
    case 'orderedList':
      editor.value.chain().focus().toggleOrderedList().run()
      break
    case 'blockquote':
      editor.value.chain().focus().toggleBlockquote().run()
      break
    case 'code':
      editor.value.chain().focus().toggleCode().run()
      break
    case 'codeBlock':
      editor.value.chain().focus().toggleCodeBlock().run()
      break
    case 'link':
      openLinkModal()
      break
    case 'unlink':
      editor.value.chain().focus().unsetLink().run()
      break
    case 'image':
      openImageModal()
      break
    case 'alignLeft':
      editor.value.chain().focus().setTextAlign('left').run()
      break
    case 'alignCenter':
      editor.value.chain().focus().setTextAlign('center').run()
      break
    case 'alignRight':
      editor.value.chain().focus().setTextAlign('right').run()
      break
    case 'alignJustify':
      editor.value.chain().focus().setTextAlign('justify').run()
      break
    case 'horizontalRule':
      editor.value.chain().focus().setHorizontalRule().run()
      break
    case 'clearFormat':
      editor.value.chain().focus().clearNodes().unsetAllMarks().run()
      break
  }
}

function isActive(action: ToolbarAction): boolean {
  if (!editor.value) return false

  switch (action) {
    case 'bold': return editor.value.isActive('bold')
    case 'italic': return editor.value.isActive('italic')
    case 'underline': return editor.value.isActive('underline')
    case 'strike': return editor.value.isActive('strike')
    case 'heading-1': return editor.value.isActive('heading', { level: 1 })
    case 'heading-2': return editor.value.isActive('heading', { level: 2 })
    case 'heading-3': return editor.value.isActive('heading', { level: 3 })
    case 'heading-4': return editor.value.isActive('heading', { level: 4 })
    case 'bulletList': return editor.value.isActive('bulletList')
    case 'orderedList': return editor.value.isActive('orderedList')
    case 'blockquote': return editor.value.isActive('blockquote')
    case 'code': return editor.value.isActive('code')
    case 'codeBlock': return editor.value.isActive('codeBlock')
    case 'link': return editor.value.isActive('link')
    case 'alignLeft': return editor.value.isActive({ textAlign: 'left' })
    case 'alignCenter': return editor.value.isActive({ textAlign: 'center' })
    case 'alignRight': return editor.value.isActive({ textAlign: 'right' })
    case 'alignJustify': return editor.value.isActive({ textAlign: 'justify' })
    default: return false
  }
}

// Link modal functions
function openLinkModal() {
  if (!editor.value) return

  // Get current link if editing
  const previousUrl = editor.value.getAttributes('link').href
  linkUrl.value = previousUrl || ''

  // Get selected text
  const { from, to } = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(from, to, '')
  linkText.value = text || ''

  showLinkModal.value = true
}

function insertLink() {
  if (!editor.value || !linkUrl.value) return

  // If there's link text and no selection, insert the text with link
  if (linkText.value && editor.value.state.selection.empty) {
    editor.value
      .chain()
      .focus()
      .insertContent(`<a href="${linkUrl.value}">${linkText.value}</a>`)
      .run()
  } else {
    // Apply link to selection
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl.value })
      .run()
  }

  closeLinkModal()
}

function closeLinkModal() {
  showLinkModal.value = false
  linkUrl.value = ''
  linkText.value = ''
}

// Image modal functions
function openImageModal() {
  imageUrl.value = ''
  imageAlt.value = ''
  showImageModal.value = true
}

function insertImage() {
  if (!editor.value || !imageUrl.value) return

  editor.value
    .chain()
    .focus()
    .setImage({ src: imageUrl.value, alt: imageAlt.value })
    .run()

  closeImageModal()
}

function closeImageModal() {
  showImageModal.value = false
  imageUrl.value = ''
  imageAlt.value = ''
}
</script>

<template>
  <div class="cms-field">
    <label v-if="label" class="cms-field__label">
      {{ label }}
      <span v-if="required" class="cms-field__required">*</span>
    </label>
    <div class="richtext-editor" :class="{ 'richtext-editor--error': error }">
      <!-- Toolbar -->
      <div class="richtext-toolbar">
        <template v-for="(group, index) in groupedToolbarButtons" :key="group.group">
          <div v-if="index > 0" class="richtext-toolbar__separator"></div>
          <button
            v-for="btn in group.buttons"
            :key="btn.action"
            type="button"
            :title="btn.title"
            :class="[
              'richtext-toolbar__btn',
              isActive(btn.action) ? 'richtext-toolbar__btn--active' : ''
            ]"
            :disabled="disabled"
            @click="executeAction(btn.action)"
          >
            <!-- SVG Icons -->
            <svg v-if="btn.icon === 'bold'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5Zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.5 4.5 0 0 1 18 15.5ZM8 13v5h5.5a2.5 2.5 0 0 0 0-5H8Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'italic'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'underline'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M8 3v9a4 4 0 0 0 8 0V3h2v9a6 6 0 0 1-12 0V3h2ZM4 20h16v2H4v-2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'strikethrough'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846ZM12 7c-1.837 0-2.755.53-2.755 1.59 0 .363.137.653.41.87l.093.072H6.31c-.2-.37-.3-.804-.3-1.3C6.01 6.75 6.56 5.7 7.66 4.96 8.76 4.22 10.195 3.85 12 3.85c1.79 0 3.22.372 4.27 1.116.496.352.893.77 1.19 1.254l.14.24-1.72 1.246A2.88 2.88 0 0 0 14.45 6.9c-.61-.267-1.415-.4-2.415-.4H12V7Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'h1'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16Zm8-12v12h-2v-9.796l-2 .536V8.67L19.5 8H21Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'h2'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'h3'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75h-1.5v-2H18c.905 0 1.638-.732 1.638-1.636S18.905 9.477 18 9.477c-.81 0-1.478.593-1.603 1.368l-1.974-.347C14.659 8.952 16.162 7.727 18 7.727c1.837 0 3.363 1.214 3.755 2.884L22 10v-.5V8ZM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'h4'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16Zm9-12v8h1.5v2H22v2h-2v-2h-5.5v-1.34l5-8.66H22Zm-2 3.133L17.19 16H20v-4.867Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'list-bullet'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M8 4h13v2H8V4ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'list-numbered'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M8 4h13v2H8V4ZM5 3v3h1v1H3V6h1V4H3V3h2Zm-2 7h3.5v1H4v1h1.5v1H3v-4Zm2 9v1H3v-1h1v-1H3v-1h3v4H4v-1h1Zm3-8h13v2H8v-2Zm0 7h13v2H8v-2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'quote'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'code-inline'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="m23 12-7.071 7.071-1.414-1.414L20.172 12l-5.657-5.657 1.414-1.414L23 12ZM3.828 12l5.657 5.657-1.414 1.414L1 12l7.071-7.071 1.414 1.414L3.828 12Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'code-block'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 2v14h16V5H4Zm16 7-3.536 3.536-1.414-1.415L17.172 12l-2.122-2.121 1.414-1.415L20 12ZM6.828 12l2.122 2.121-1.414 1.415L4 12l3.536-3.536 1.414 1.415L6.828 12Zm4.416 5H9.116l3.64-10h2.128l-3.64 10Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'link'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M18.364 15.536 16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 1 1 9.9 9.9l-1.415 1.414Zm-2.829 2.829-1.414 1.414a7 7 0 1 1-9.9-9.9l1.414-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.07 7.071l1.415-1.414 1.414 1.414Zm-.707-10.607 1.415 1.414-7.072 7.071-1.414-1.414 7.07-7.07Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'unlink'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="m17.657 14.828-1.414-1.414L17.657 12A4 4 0 1 0 12 6.343l-1.414 1.414-1.414-1.414 1.414-1.414a6 6 0 0 1 8.485 8.485l-1.414 1.414Zm-2.829 2.829-1.414 1.414a6 6 0 0 1-8.485-8.485l1.414-1.414 1.414 1.414L6.343 12A4 4 0 0 0 12 17.657l1.414-1.414 1.414 1.414Zm0-9.9 1.415 1.415-7.072 7.07-1.414-1.414 7.07-7.07ZM5 3h2v3H5V3Zm14 18h-2v-3h2v3ZM5 18H3v-2h3v2Zm14-8h3v2h-3v-2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'image'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828ZM20 15V5H4v14L14 9l6 6Zm0 2.828-6-6L6.828 19H20v-1.172ZM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'align-left'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M3 4h18v2H3V4Zm0 15h14v2H3v-2Zm0-5h18v2H3v-2Zm0-5h14v2H3V9Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'align-center'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M3 4h18v2H3V4Zm2 15h14v2H5v-2Zm-2-5h18v2H3v-2Zm2-5h14v2H5V9Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'align-right'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M3 4h18v2H3V4Zm4 15h14v2H7v-2Zm-4-5h18v2H3v-2Zm4-5h14v2H7V9Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'align-justify'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M3 4h18v2H3V4Zm0 15h18v2H3v-2Zm0-5h18v2H3v-2Zm0-5h18v2H3V9Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'hr'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M2 11h2v2H2v-2Zm4 0h12v2H6v-2Zm14 0h2v2h-2v-2Z"/>
            </svg>
            <svg v-else-if="btn.icon === 'clear'" viewBox="0 0 24 24" fill="currentColor" class="richtext-toolbar__icon">
              <path d="M12.651 14.065 11.605 20H9.574l1.35-7.661-7.41-7.41L4.93 3.515 20.485 19.07l-1.414 1.414-6.42-6.42Zm-.878-6.535.27-1.53h-1.8l-2-2H20v2h-5.927l-.595 3.37-1.705-1.704V7.53Z"/>
            </svg>
          </button>
        </template>
      </div>

      <!-- Editor -->
      <EditorContent
        :editor="editor"
        :class="[
          'richtext-content',
          { 'richtext-content--disabled': disabled }
        ]"
        :style="{
          minHeight: field.minHeight ? `${field.minHeight}px` : '200px',
          maxHeight: field.maxHeight ? `${field.maxHeight}px` : undefined,
          overflowY: field.maxHeight ? 'auto' : undefined
        }"
      />
    </div>
    <p v-if="help && !error" class="cms-field__help">{{ help }}</p>
    <p v-if="error" class="cms-field__error">{{ error }}</p>

    <!-- Link Modal -->
    <Teleport to="body">
      <div v-if="showLinkModal" class="richtext-modal-overlay" @click.self="closeLinkModal">
        <div class="richtext-modal">
          <div class="richtext-modal__header">
            <h3 class="richtext-modal__title">Insert Link</h3>
            <button type="button" class="richtext-modal__close" @click="closeLinkModal">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95Z"/>
              </svg>
            </button>
          </div>
          <div class="richtext-modal__body">
            <div class="richtext-modal__field">
              <label class="richtext-modal__label">URL</label>
              <input
                v-model="linkUrl"
                type="url"
                class="richtext-modal__input"
                placeholder="https://example.com"
                @keydown.enter.prevent="insertLink"
              />
            </div>
            <div class="richtext-modal__field">
              <label class="richtext-modal__label">Link Text (optional)</label>
              <input
                v-model="linkText"
                type="text"
                class="richtext-modal__input"
                placeholder="Click here"
                @keydown.enter.prevent="insertLink"
              />
            </div>
          </div>
          <div class="richtext-modal__footer">
            <button type="button" class="richtext-modal__btn richtext-modal__btn--secondary" @click="closeLinkModal">
              Cancel
            </button>
            <button type="button" class="richtext-modal__btn richtext-modal__btn--primary" @click="insertLink" :disabled="!linkUrl">
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Modal -->
    <Teleport to="body">
      <div v-if="showImageModal" class="richtext-modal-overlay" @click.self="closeImageModal">
        <div class="richtext-modal">
          <div class="richtext-modal__header">
            <h3 class="richtext-modal__title">Insert Image</h3>
            <button type="button" class="richtext-modal__close" @click="closeImageModal">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95Z"/>
              </svg>
            </button>
          </div>
          <div class="richtext-modal__body">
            <div class="richtext-modal__field">
              <label class="richtext-modal__label">Image URL</label>
              <input
                v-model="imageUrl"
                type="url"
                class="richtext-modal__input"
                placeholder="https://example.com/image.jpg"
                @keydown.enter.prevent="insertImage"
              />
            </div>
            <div class="richtext-modal__field">
              <label class="richtext-modal__label">Alt Text (optional)</label>
              <input
                v-model="imageAlt"
                type="text"
                class="richtext-modal__input"
                placeholder="Image description"
                @keydown.enter.prevent="insertImage"
              />
            </div>
          </div>
          <div class="richtext-modal__footer">
            <button type="button" class="richtext-modal__btn richtext-modal__btn--secondary" @click="closeImageModal">
              Cancel
            </button>
            <button type="button" class="richtext-modal__btn richtext-modal__btn--primary" @click="insertImage" :disabled="!imageUrl">
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
/* CMS Field Wrapper */
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

/* Richtext Editor */
.richtext-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.richtext-editor:focus-within {
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.richtext-editor--error {
  border-color: #dc2626;
}

.richtext-editor--error:focus-within {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Toolbar */
.richtext-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.richtext-toolbar__separator {
  width: 1px;
  height: 24px;
  background-color: #d1d5db;
  margin: 0 4px;
}

.richtext-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  color: #4b5563;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.richtext-toolbar__btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: #1f2937;
}

.richtext-toolbar__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.richtext-toolbar__btn--active {
  background-color: var(--cms-primary-light, #dbeafe);
  color: var(--cms-primary, #2563eb);
}

.richtext-toolbar__btn--active:hover:not(:disabled) {
  background-color: var(--cms-primary-light, #dbeafe);
}

.richtext-toolbar__icon {
  width: 18px;
  height: 18px;
}

/* Editor Content */
.richtext-content {
  padding: 16px;
}

.richtext-content--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.richtext-content .ProseMirror {
  outline: none;
  min-height: 100px;
  color: #111827;
}

.richtext-content .ProseMirror p.is-editor-empty:first-child::before {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Prose Styles */
.richtext-content .ProseMirror > * + * {
  margin-top: 0.75em;
}

.richtext-content .ProseMirror h1 {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.richtext-content .ProseMirror h2 {
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.richtext-content .ProseMirror h3 {
  font-size: 1.25em;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.richtext-content .ProseMirror h4 {
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.richtext-content .ProseMirror p {
  line-height: 1.6;
}

.richtext-content .ProseMirror ul,
.richtext-content .ProseMirror ol {
  padding-left: 1.5em;
}

.richtext-content .ProseMirror ul {
  list-style-type: disc;
}

.richtext-content .ProseMirror ol {
  list-style-type: decimal;
}

.richtext-content .ProseMirror li {
  line-height: 1.6;
}

.richtext-content .ProseMirror li > p {
  margin: 0;
}

.richtext-content .ProseMirror blockquote {
  border-left: 4px solid var(--cms-primary, #2563eb);
  padding-left: 1em;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #4b5563;
}

/* Inline Code */
.richtext-content .ProseMirror code {
  background-color: #f3f4f6;
  color: #dc2626;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

/* Code Block */
.richtext-content .ProseMirror pre {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  line-height: 1.5;
}

.richtext-content .ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

/* Links */
.richtext-content .ProseMirror a,
.richtext-content .ProseMirror .richtext-link {
  color: var(--cms-primary, #2563eb);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.richtext-content .ProseMirror a:hover,
.richtext-content .ProseMirror .richtext-link:hover {
  color: var(--cms-primary-hover, #1d4ed8);
}

/* Images */
.richtext-content .ProseMirror img,
.richtext-content .ProseMirror .richtext-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

.richtext-content .ProseMirror img.ProseMirror-selectednode {
  outline: 3px solid var(--cms-primary, #2563eb);
}

/* Horizontal Rule */
.richtext-content .ProseMirror hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1.5em 0;
}

/* Text Alignment */
.richtext-content .ProseMirror [style*="text-align: left"] {
  text-align: left;
}

.richtext-content .ProseMirror [style*="text-align: center"] {
  text-align: center;
}

.richtext-content .ProseMirror [style*="text-align: right"] {
  text-align: right;
}

.richtext-content .ProseMirror [style*="text-align: justify"] {
  text-align: justify;
}

/* Strikethrough, Bold, Italic, Underline */
.richtext-content .ProseMirror strong {
  font-weight: 700;
}

.richtext-content .ProseMirror em {
  font-style: italic;
}

.richtext-content .ProseMirror u {
  text-decoration: underline;
}

.richtext-content .ProseMirror s {
  text-decoration: line-through;
}

/* Modal Overlay */
.richtext-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

/* Modal */
.richtext-modal {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.richtext-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.richtext-modal__title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.richtext-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.richtext-modal__close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.richtext-modal__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.richtext-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.richtext-modal__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.richtext-modal__input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: white;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.richtext-modal__input:focus {
  outline: none;
  border-color: var(--cms-primary, #2563eb);
  box-shadow: 0 0 0 3px var(--cms-primary-light, rgba(37, 99, 235, 0.1));
}

.richtext-modal__input::placeholder {
  color: #9ca3af;
}

.richtext-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.richtext-modal__btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.richtext-modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.richtext-modal__btn--secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.richtext-modal__btn--secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.richtext-modal__btn--primary {
  background-color: var(--cms-primary, #2563eb);
  color: white;
  border: 1px solid var(--cms-primary, #2563eb);
}

.richtext-modal__btn--primary:hover:not(:disabled) {
  background-color: var(--cms-primary-hover, #1d4ed8);
  border-color: var(--cms-primary-hover, #1d4ed8);
}
</style>

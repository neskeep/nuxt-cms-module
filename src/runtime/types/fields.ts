/**
 * All available field types in the CMS
 */
export type FieldType =
  // Basic
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'password'
  // Selection
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  // Content
  | 'richtext'
  | 'markdown'
  | 'code'
  // Media
  | 'image'
  | 'file'
  | 'gallery'
  // Date/Time
  | 'date'
  | 'datetime'
  | 'time'
  // Relations
  | 'relation'
  | 'json'
  // Layout
  | 'repeater'
  | 'group'
  // Special
  | 'color'
  | 'slug'
  | 'icon'

/**
 * Condition for showing/hiding fields
 */
export interface FieldCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty'
  value?: unknown
}

/**
 * Select option for dropdowns, radios, checkboxes
 */
export interface SelectOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

/**
 * Base field definition shared by all field types
 */
export interface BaseFieldDefinition {
  type: FieldType
  label?: string
  required?: boolean
  default?: unknown
  placeholder?: string
  help?: string
  translatable?: boolean
  hidden?: boolean
  readonly?: boolean
  width?: 'full' | 'half' | 'third' | 'quarter'
  conditions?: FieldCondition[]
}

// ============ Basic Fields ============

export interface TextFieldDefinition extends BaseFieldDefinition {
  type: 'text'
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface TextareaFieldDefinition extends BaseFieldDefinition {
  type: 'textarea'
  minLength?: number
  maxLength?: number
  rows?: number
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  type: 'number'
  min?: number
  max?: number
  step?: number
  decimals?: number
}

export interface EmailFieldDefinition extends BaseFieldDefinition {
  type: 'email'
}

export interface UrlFieldDefinition extends BaseFieldDefinition {
  type: 'url'
}

export interface PasswordFieldDefinition extends BaseFieldDefinition {
  type: 'password'
  minLength?: number
}

// ============ Selection Fields ============

export interface SelectFieldDefinition extends BaseFieldDefinition {
  type: 'select'
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
}

export interface RadioFieldDefinition extends BaseFieldDefinition {
  type: 'radio'
  options: SelectOption[]
  inline?: boolean
}

export interface CheckboxFieldDefinition extends BaseFieldDefinition {
  type: 'checkbox'
  options: SelectOption[]
  inline?: boolean
}

export interface BooleanFieldDefinition extends BaseFieldDefinition {
  type: 'boolean'
  labelOn?: string
  labelOff?: string
}

// ============ Content Fields ============

export interface RichtextFieldDefinition extends BaseFieldDefinition {
  type: 'richtext'
  toolbar?: ('bold' | 'italic' | 'underline' | 'strike' | 'link' | 'image' | 'heading' | 'list' | 'quote' | 'code' | 'align')[]
  minHeight?: number
  maxHeight?: number
}

export interface MarkdownFieldDefinition extends BaseFieldDefinition {
  type: 'markdown'
  preview?: boolean
  rows?: number
}

export interface CodeFieldDefinition extends BaseFieldDefinition {
  type: 'code'
  language?: 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'sql' | 'python' | 'php'
  lineNumbers?: boolean
  rows?: number
}

// ============ Media Fields ============

export interface ImageFieldDefinition extends BaseFieldDefinition {
  type: 'image'
  accept?: string[]
  maxSize?: number
  aspectRatio?: string
  minWidth?: number
  minHeight?: number
}

export interface FileFieldDefinition extends BaseFieldDefinition {
  type: 'file'
  accept?: string[]
  maxSize?: number
}

export interface GalleryFieldDefinition extends BaseFieldDefinition {
  type: 'gallery'
  accept?: string[]
  maxSize?: number
  maxItems?: number
  sortable?: boolean
}

// ============ Date/Time Fields ============

export interface DateFieldDefinition extends BaseFieldDefinition {
  type: 'date'
  min?: string
  max?: string
  format?: string
}

export interface DatetimeFieldDefinition extends BaseFieldDefinition {
  type: 'datetime'
  min?: string
  max?: string
  format?: string
}

export interface TimeFieldDefinition extends BaseFieldDefinition {
  type: 'time'
  min?: string
  max?: string
  step?: number
}

// ============ Relation Fields ============

export interface RelationFieldDefinition extends BaseFieldDefinition {
  type: 'relation'
  collection: string
  relationship: 'one-to-one' | 'one-to-many' | 'many-to-many'
  displayField?: string
  searchFields?: string[]
}

export interface JsonFieldDefinition extends BaseFieldDefinition {
  type: 'json'
  rows?: number
  schema?: Record<string, unknown>
}

// ============ Layout Fields ============

export interface RepeaterFieldDefinition extends BaseFieldDefinition {
  type: 'repeater'
  fields: Record<string, FieldDefinition>
  min?: number
  max?: number
  collapsed?: boolean
  itemLabel?: string
  sortable?: boolean
}

export interface GroupFieldDefinition extends BaseFieldDefinition {
  type: 'group'
  fields: Record<string, FieldDefinition>
  collapsed?: boolean
}

// ============ Special Fields ============

export interface ColorFieldDefinition extends BaseFieldDefinition {
  type: 'color'
  format?: 'hex' | 'rgb' | 'hsl'
  alpha?: boolean
  presets?: string[]
}

export interface SlugFieldDefinition extends BaseFieldDefinition {
  type: 'slug'
  from: string
  prefix?: string
  separator?: '-' | '_'
}

export interface IconFieldDefinition extends BaseFieldDefinition {
  type: 'icon'
  /** Icon style variants to show (only outline and solid supported) */
  variants?: ('outline' | 'solid')[]
  /** Default variant when none selected */
  defaultVariant?: 'outline' | 'solid'
  /** Icon categories to filter (e.g., 'arrows', 'media', 'social') */
  categories?: string[]
  /** Allow clearing selection */
  clearable?: boolean
}

/**
 * Union type of all field definitions
 */
export type FieldDefinition =
  | TextFieldDefinition
  | TextareaFieldDefinition
  | NumberFieldDefinition
  | EmailFieldDefinition
  | UrlFieldDefinition
  | PasswordFieldDefinition
  | SelectFieldDefinition
  | RadioFieldDefinition
  | CheckboxFieldDefinition
  | BooleanFieldDefinition
  | RichtextFieldDefinition
  | MarkdownFieldDefinition
  | CodeFieldDefinition
  | ImageFieldDefinition
  | FileFieldDefinition
  | GalleryFieldDefinition
  | DateFieldDefinition
  | DatetimeFieldDefinition
  | TimeFieldDefinition
  | RelationFieldDefinition
  | JsonFieldDefinition
  | RepeaterFieldDefinition
  | GroupFieldDefinition
  | ColorFieldDefinition
  | SlugFieldDefinition
  | IconFieldDefinition

/**
 * Map of field names to their definitions
 */
export type FieldsSchema = Record<string, FieldDefinition>

/**
 * Check if a field type is translatable by default
 */
export function isTranslatableField(type: FieldType): boolean {
  const translatableTypes: FieldType[] = [
    'text',
    'textarea',
    'richtext',
    'markdown',
    'code'
  ]
  return translatableTypes.includes(type)
}

/**
 * Check if a field stores its value as JSON
 */
export function isJsonField(type: FieldType): boolean {
  const jsonTypes: FieldType[] = [
    'checkbox',
    'gallery',
    'json',
    'repeater',
    'group'
  ]
  return jsonTypes.includes(type)
}

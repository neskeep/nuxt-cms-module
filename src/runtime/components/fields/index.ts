// Export all field components for easy importing
export { default as CmsFieldText } from './Text.vue'
export { default as CmsFieldTextarea } from './Textarea.vue'
export { default as CmsFieldNumber } from './Number.vue'
export { default as CmsFieldEmail } from './Email.vue'
export { default as CmsFieldUrl } from './Url.vue'
export { default as CmsFieldPassword } from './Password.vue'
export { default as CmsFieldSelect } from './Select.vue'
export { default as CmsFieldRadio } from './Radio.vue'
export { default as CmsFieldCheckbox } from './Checkbox.vue'
export { default as CmsFieldBoolean } from './Boolean.vue'
export { default as CmsFieldRichtext } from './Richtext.vue'
export { default as CmsFieldMarkdown } from './Markdown.vue'
export { default as CmsFieldCode } from './Code.vue'
export { default as CmsFieldImage } from './Image.vue'
export { default as CmsFieldFile } from './File.vue'
export { default as CmsFieldGallery } from './Gallery.vue'
export { default as CmsFieldDate } from './Date.vue'
export { default as CmsFieldDatetime } from './Datetime.vue'
export { default as CmsFieldTime } from './Time.vue'
export { default as CmsFieldRelation } from './Relation.vue'
export { default as CmsFieldJson } from './Json.vue'
export { default as CmsFieldRepeater } from './Repeater.vue'
export { default as CmsFieldGroup } from './Group.vue'
export { default as CmsFieldColor } from './Color.vue'
export { default as CmsFieldSlug } from './Slug.vue'

/**
 * Map field type to component name
 */
export const fieldComponentMap: Record<string, string> = {
  text: 'CmsFieldText',
  textarea: 'CmsFieldTextarea',
  number: 'CmsFieldNumber',
  email: 'CmsFieldEmail',
  url: 'CmsFieldUrl',
  password: 'CmsFieldPassword',
  select: 'CmsFieldSelect',
  radio: 'CmsFieldRadio',
  checkbox: 'CmsFieldCheckbox',
  boolean: 'CmsFieldBoolean',
  richtext: 'CmsFieldRichtext',
  markdown: 'CmsFieldMarkdown',
  code: 'CmsFieldCode',
  image: 'CmsFieldImage',
  file: 'CmsFieldFile',
  gallery: 'CmsFieldGallery',
  date: 'CmsFieldDate',
  datetime: 'CmsFieldDatetime',
  time: 'CmsFieldTime',
  relation: 'CmsFieldRelation',
  json: 'CmsFieldJson',
  repeater: 'CmsFieldRepeater',
  group: 'CmsFieldGroup',
  color: 'CmsFieldColor',
  slug: 'CmsFieldSlug'
}

/**
 * Get field component name from type
 */
export function getFieldComponent(type: string): string {
  return fieldComponentMap[type] || 'CmsFieldText'
}

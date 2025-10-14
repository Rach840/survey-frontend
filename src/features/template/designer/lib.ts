import type { Template } from '@/entities/templates/types'
import type {
  DesignerTemplate,
  DesignerSection,
  DesignerFieldType,
  TemplateUpsertPayload,
  TemplateUpsertSection,
} from './types'

const apiToDesignerTypeMap: Record<string, DesignerFieldType> = {
  text: 'text',
  number: 'number',
  date: 'date',
  select_one: 'select_one',
  select_multiple: 'select_multiple',
  checkbox: 'checkbox',
}

const designerToApiTypeMap: Record<DesignerFieldType, DesignerFieldType> = {
  text: 'text',
  number: 'number',
  date: 'date',
  select_one: 'select_one',
  select_multiple: 'select_multiple',
  checkbox: 'checkbox',
}

export function mapTemplateToDesigner(template: Template): DesignerTemplate {
  const sections: DesignerSection[] = template.draft_schema_json.map((section) => ({
    id: section.id || crypto.randomUUID(),
    code: section.code,
    title: section.title,
    repeatable: section.repeatable,
    min: section.min,
    max: section.max,
    fields: section.fields.map((field) => ({
      id: field.id || crypto.randomUUID(),
      code: field.code,
      label: field.label,
      required: field.required,
      type: apiToDesignerTypeMap[field.type] ?? 'text',
      options: field.options?.map((option) => ({ code: option.code, label: option.label })) ?? [],
    })),
  }))

  return {
    id: template.id,
    title: template.title,
    description: template.description ?? '',
    version: template.version ?? 1,
    sections,
  }
}

export function normalizeDesignerTemplate(template: DesignerTemplate): TemplateUpsertPayload {
  const sections: TemplateUpsertSection[] = template.sections.map((section) => ({
    code: section.code,
    title: section.title,
    repeatable: section.repeatable,
    ...(section.repeatable ? { min: section.min, max: section.max } : {}),
    fields: section.fields.map((field) => ({
      code: field.code,
      label: field.label,
      required: field.required,
      type: designerToApiTypeMap[field.type] ?? 'text',
      ...(field.options && field.options.length > 0 ? { options: field.options } : {}),
    })),
  }))

  return {
    title: template.title,
    description: template.description,
    version: template.version,
    sections,
  }
}

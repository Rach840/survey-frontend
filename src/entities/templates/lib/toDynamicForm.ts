import type { DynamicFormDef, FormFieldDef } from '@/features/template/generated/model'
import type { TemplateSection, TemplateField, TemplateFieldType } from '@/entities/templates/types'

const typeMap: Record<TemplateFieldType, FormFieldDef['type']> = {
  text: 'text',
  number: 'number',
  date: 'date',
  select_one: 'select',
  select_multiple: 'select',
}

function mapField(field: TemplateField): FormFieldDef {
  return {
    id: field.id,
    code: field.code,
    label: field.label,
    required: field.required,
    type: typeMap[field.type] ?? 'text',
    options: field.options?.map((option) => ({
      label: option.label,
      value: option.code,
    })),
  }
}

export function sectionsToDynamicForm(title: string, sections: TemplateSection[]): DynamicFormDef {
  return {
    title,
    sections: sections.map((section) => ({
      id: section.id,
      code: section.code,
      title: section.title,
      fields: section.fields.map(mapField),
    })),
  }
}

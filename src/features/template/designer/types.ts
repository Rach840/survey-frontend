export type DesignerFieldType = 'text' | 'number' | 'date' | 'select_one' | 'select_multiple' | 'checkbox'

export interface DesignerFieldOption {
  code: string
  label: string
}

export interface DesignerField {
  id: string
  code: string
  type: DesignerFieldType
  label: string
  required: boolean
  options?: DesignerFieldOption[]
}

export interface DesignerSection {
  id: string
  code: string
  title: string
  repeatable: boolean
  min?: number
  max?: number
  fields: DesignerField[]
}

export interface DesignerTemplate {
  id?: number
  title: string
  description: string
  version: number
  sections: DesignerSection[]
}

export interface TemplateUpsertSectionField {
  code: string
  type: DesignerFieldType
  label: string
  required: boolean
  options?: DesignerFieldOption[]
}

export interface TemplateUpsertSection {
  code: string
  title: string
  repeatable: boolean
  min?: number
  max?: number
  fields: TemplateUpsertSectionField[]
}

export interface TemplateUpsertPayload {
  title: string
  description: string
  version: number
  sections: TemplateUpsertSection[]
}

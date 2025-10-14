export type TemplateFieldType = "text" | "date" | "select_one" | "select_multiple" | "number"

export interface TemplateFieldOption {
    code: string
    label: string
}

export interface TemplateField {
    id: string
    code: string
    type: TemplateFieldType
    label: string
    required: boolean
    options?: TemplateFieldOption[]
}

export interface TemplateSection {
    id: string
    code: string
    title: string
    repeatable: boolean
    min?: number
    max?: number
    fields: TemplateField[]
}

export interface Template {
    id: number
    owner_id: number
    title: string
    description: string
    version: number
    status: string
    draft_schema_json: TemplateSection[]
    published_schema_json: TemplateSection[] | null
    updated_at: string
    published_at: string | null
}

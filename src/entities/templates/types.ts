type FieldType = "text" | "date" | "select_one" | "select_multiple" | "number"

interface Field {
    id: string
    code: string
    type: FieldType
    label: string
    required: boolean
    options?: { code: string; label: string }[]
}

interface Section {
    id: string
    code: string
    title: string
    repeatable: boolean
    min?: number
    max?: number
    fields: Field[]
}

interface Template {
    title: string
    description: string
    version: number
    sections: Section[]
}
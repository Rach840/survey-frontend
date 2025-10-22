"use client"

import {type PointerEvent, useCallback, useEffect, useState} from "react"
import {Button} from "@/shared/ui/button"
import {Input} from "@/shared/ui/input"
import {Label} from "@/shared/ui/label"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/shared/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/ui/select"
import {Checkbox} from "@/shared/ui/checkbox"
import {Textarea} from "@/shared/ui/textarea"
import {Skeleton} from "@/shared/ui/skeleton"
import {GripVertical, Plus, Save, Trash2} from "lucide-react"
import {Reorder, useDragControls} from "motion/react"
import type {DesignerField, DesignerFieldType, DesignerSection, DesignerTemplate, TemplateUpsertPayload} from "../types"
import {normalizeDesignerTemplate} from "../lib"
import {toast} from "sonner"

const DEFAULT_TEMPLATE: DesignerTemplate = {
  title: "",
  description: "",
  version: 1,
  sections: [],
}

function createEmptySection(): DesignerSection {
  return {
    id: crypto.randomUUID(),
    code: "",
    title: "",
    repeatable: false,
    fields: [],
  }
}

function createEmptyField(): DesignerField {
  return {
    id: crypto.randomUUID(),
    code: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  }
}

function cloneTemplate(template: DesignerTemplate): DesignerTemplate {
  return JSON.parse(JSON.stringify(template))
}

type TemplateDesignerProps = {
  initialTemplate?: DesignerTemplate
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (payload: TemplateUpsertPayload) => Promise<void> | void
  headerTitle?: string
  headerSubtitle?: string
  showSkeleton?: boolean
}

export function TemplateDesigner({
  initialTemplate,
  submitLabel = "Сохранить",
  isSubmitting,
  onSubmit,
  headerTitle = "Конструктор шаблона анкеты",
  headerSubtitle = "Создайте структуру анкеты с секциями и полями",
  showSkeleton = false,
}: TemplateDesignerProps) {
  const [template, setTemplate] = useState<DesignerTemplate>(initialTemplate ? cloneTemplate(initialTemplate) : DEFAULT_TEMPLATE)

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(cloneTemplate(initialTemplate))
    }
  }, [initialTemplate])

  const addSection = () => {
    setTemplate((prev) => ({ ...prev, sections: [...prev.sections, createEmptySection()] }))
  }

  const updateSection = (sectionId: string, updates: Partial<DesignerSection>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
  }

  const removeSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const addField = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, fields: [...section.fields, createEmptyField()] } : section,
      ),
    }))
  }

  const updateField = (sectionId: string, fieldId: string, updates: Partial<DesignerField>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
            }
          : section,
      ),
    }))
  }

  const removeField = (sectionId: string, fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, fields: section.fields.filter((field) => field.id !== fieldId) } : section,
      ),
    }))
  }

  const addOption = (sectionId: string, fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      options: [...(field.options ?? []), { code: "", label: "" }],
                    }
                  : field,
              ),
            }
          : section,
      ),
    }))
  }

  const updateOption = (
    sectionId: string,
    fieldId: string,
    optionIndex: number,
    updates: Partial<{ code: string; label: string }>,
  ) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      options: field.options?.map((option, idx) => (idx === optionIndex ? { ...option, ...updates } : option)),
                    }
                  : field,
              ),
            }
          : section,
      ),
    }))
  }

  const removeOption = (sectionId: string, fieldId: string, optionIndex: number) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      options: field.options?.filter((_, idx) => idx !== optionIndex),
                    }
                  : field,
              ),
            }
          : section,
      ),
    }))
  }

  const reorderSections = (newSections: DesignerSection[]) => {
    setTemplate((prev) => ({
      ...prev,
      sections: newSections,
    }))
  }

  const reorderFields = (sectionId: string, newFields: DesignerField[]) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, fields: newFields } : section,
      ),
    }))
  }

  const handleSubmit = useCallback(async () => {
    const payload = normalizeDesignerTemplate(template)
    try {
      await onSubmit(payload)
    } catch (error) {
      console.error(error)
      toast.error("Не удалось сохранить шаблон")
    }
  }, [onSubmit, template])

  const handleReset = () => {
    setTemplate(initialTemplate ? cloneTemplate(initialTemplate) : cloneTemplate(DEFAULT_TEMPLATE))
  }


  const sections = template.sections

  if (showSkeleton) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{headerTitle}</h1>
          <p className="text-gray-600">{headerSubtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Сохранение..." : submitLabel}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-title">Название шаблона</Label>
            <Input
              id="template-title"
              value={template.title}
              onChange={(event) => setTemplate({ ...template, title: event.target.value })}
              placeholder="Например: Анкета студента v3"
            />
          </div>

          <div>
            <Label htmlFor="template-description">Описание</Label>
            <Textarea
              id="template-description"
              value={template.description}
              onChange={(event) => setTemplate({ ...template, description: event.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="template-version">Версия</Label>
            <Input
              id="template-version"
              type="number"
              className="w-24"
              value={template.version}
              min={1}
              onChange={(event) =>
                setTemplate({
                  ...template,
                  version: Number.parseInt(event.target.value, 10) || 1,
                })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="ghost" onClick={handleReset} disabled={isSubmitting}>
            Сбросить изменения
          </Button>
        </CardFooter>
      </Card>

      <Reorder.Group axis="y" values={sections} onReorder={reorderSections} className="space-y-6 p-0">
        {sections.map((section, sectionIndex) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={sectionIndex}
            onRemoveSection={removeSection}
            onUpdateSection={updateSection}
            onAddField={addField}
            onUpdateField={updateField}
            onRemoveField={removeField}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
            onReorderFields={reorderFields}
          />
        ))}
      </Reorder.Group>

      <Button variant="outline" onClick={addSection} className="w-full border-2 border-dashed bg-transparent py-6">
        <Plus className="w-5 h-5 mr-2" />
        Добавить секцию
      </Button>
    </div>
  )
}

type SectionEditorProps = {
  section: DesignerSection
  index: number
  onRemoveSection: (sectionId: string) => void
  onUpdateSection: (sectionId: string, updates: Partial<DesignerSection>) => void
  onAddField: (sectionId: string) => void
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<DesignerField>) => void
  onRemoveField: (sectionId: string, fieldId: string) => void
  onAddOption: (sectionId: string, fieldId: string) => void
  onUpdateOption: (
    sectionId: string,
    fieldId: string,
    optionIndex: number,
    updates: Partial<{ code: string; label: string }>,
  ) => void
  onRemoveOption: (sectionId: string, fieldId: string, optionIndex: number) => void
  onReorderFields: (sectionId: string, newFields: DesignerField[]) => void
}

function SectionEditor({
  section,
  index,
  onRemoveSection,
  onUpdateSection,
  onAddField,
  onUpdateField,
  onRemoveField,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onReorderFields,
}: SectionEditorProps) {
  const sectionDragControls = useDragControls()
  const fields = section.fields ?? []

  const startSectionDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sectionDragControls.start(event)
  }

  const handleFieldsReorder = (newFields: DesignerField[]) => {
    onReorderFields(section.id, newFields)
  }

  const dragHandleClass =
    'rounded-md border border-transparent p-1 text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2'

  return (
    <Reorder.Item value={section} dragListener={false} dragControls={sectionDragControls} className="list-none">
      <Card className="border-2">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={startSectionDrag}
                className={dragHandleClass}
                aria-label="Переместить секцию"
              >
                <GripVertical className="h-5 w-5" />
              </button>
              <CardTitle className="text-lg">Секция {index + 1}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemoveSection(section.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Код секции</Label>
                <Input
                  value={section.code}
                  onChange={(event) => onUpdateSection(section.id, { code: event.target.value })}
                  placeholder="personal"
                />
              </div>
              <div>
                <Label>Название секции</Label>
                <Input
                  value={section.title}
                  onChange={(event) => onUpdateSection(section.id, { title: event.target.value })}
                  placeholder="Личные данные"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`repeatable-${section.id}`}
                  checked={section.repeatable}
                  onCheckedChange={(checked) =>
                    onUpdateSection(section.id, { repeatable: Boolean(checked) })
                  }
                />
                <Label htmlFor={`repeatable-${section.id}`}>Повторяемая секция</Label>
              </div>

              {section.repeatable ? (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`min-${section.id}`}>Мин.</Label>
                  <Input
                    id={`min-${section.id}`}
                    type="number"
                    className="w-20"
                    value={section.min ?? 1}
                    onChange={(event) =>
                      onUpdateSection(section.id, { min: Number.parseInt(event.target.value, 10) || 1 })
                    }
                  />
                  <Label htmlFor={`max-${section.id}`}>Макс.</Label>
                  <Input
                    id={`max-${section.id}`}
                    type="number"
                    className="w-20"
                    value={section.max ?? 1}
                    onChange={(event) =>
                      onUpdateSection(section.id, { max: Number.parseInt(event.target.value, 10) || 1 })
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Поля</h4>
            <Reorder.Group axis="y" values={fields} onReorder={handleFieldsReorder} className="space-y-4 p-0">
              {fields.map((field, fieldIndex) => (
                <FieldEditor
                  key={field.id}
                  sectionId={section.id}
                  field={field}
                  index={fieldIndex}
                  onUpdateField={onUpdateField}
                  onRemoveField={onRemoveField}
                  onAddOption={onAddOption}
                  onUpdateOption={onUpdateOption}
                  onRemoveOption={onRemoveOption}
                />
              ))}
            </Reorder.Group>

            <Button variant="outline" onClick={() => onAddField(section.id)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Добавить поле
            </Button>
          </div>
        </CardContent>
      </Card>
    </Reorder.Item>
  )
}

type FieldEditorProps = {
  sectionId: string
  field: DesignerField
  index: number
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<DesignerField>) => void
  onRemoveField: (sectionId: string, fieldId: string) => void
  onAddOption: (sectionId: string, fieldId: string) => void
  onUpdateOption: (
    sectionId: string,
    fieldId: string,
    optionIndex: number,
    updates: Partial<{ code: string; label: string }>,
  ) => void
  onRemoveOption: (sectionId: string, fieldId: string, optionIndex: number) => void
}

function FieldEditor({
  sectionId,
  field,
  index,
  onUpdateField,
  onRemoveField,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: FieldEditorProps) {
  const fieldDragControls = useDragControls()

  const startFieldDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    fieldDragControls.start(event)
  }

  const dragHandleClass =
    'rounded-md border border-transparent p-1 text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2'

  return (
    <Reorder.Item value={field} dragListener={false} dragControls={fieldDragControls} className="list-none">
      <Card className="bg-gray-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={startFieldDrag}
                className={dragHandleClass}
                aria-label="Переместить поле"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">Поле {index + 1}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemoveField(sectionId, field.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Код поля</Label>
              <Input
                value={field.code}
                onChange={(event) => onUpdateField(sectionId, field.id, { code: event.target.value })}
                placeholder="last_name"
              />
            </div>
            <div>
              <Label>Тип поля</Label>
              <Select
                value={field.type}
                onValueChange={(value: DesignerFieldType) => onUpdateField(sectionId, field.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="date">Дата</SelectItem>
                  <SelectItem value="number">Число</SelectItem>
                  <SelectItem value="select_one">Выбор одного</SelectItem>
                  <SelectItem value="select_multiple">Множественный выбор</SelectItem>
                  <SelectItem value="checkbox">Чекбокс</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Название поля</Label>
            <Input
              value={field.label}
              onChange={(event) => onUpdateField(sectionId, field.id, { label: event.target.value })}
              placeholder="Фамилия"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdateField(sectionId, field.id, { required: Boolean(checked) })}
            />
            <Label htmlFor={`required-${field.id}`}>Обязательное поле</Label>
          </div>

          {(field.type === "select_one" || field.type === "select_multiple") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Варианты ответов</Label>
                <Button variant="outline" size="sm" onClick={() => onAddOption(sectionId, field.id)}>
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить
                </Button>
              </div>
              {field.options?.map((option, optionIndex) => (
                <div key={`${field.id}-option-${optionIndex}`} className="flex items-center gap-2">
                  <Input
                    placeholder="Код"
                    value={option.code}
                    onChange={(event) => onUpdateOption(sectionId, field.id, optionIndex, { code: event.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Название"
                    value={option.label}
                    onChange={(event) => onUpdateOption(sectionId, field.id, optionIndex, { label: event.target.value })}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => onRemoveOption(sectionId, field.id, optionIndex)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Reorder.Item>
  )
}

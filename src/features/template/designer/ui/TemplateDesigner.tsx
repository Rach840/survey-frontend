"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"
import { Textarea } from "@/shared/ui/textarea"
import { Skeleton } from "@/shared/ui/skeleton"
import { Plus, Trash2, GripVertical, Save, Upload } from "lucide-react"
import type { DesignerTemplate, DesignerSection, DesignerField, DesignerFieldType, TemplateUpsertPayload } from "../types"
import { normalizeDesignerTemplate } from "../lib"
import { toast } from "sonner"

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

  const exportJSON = () => {
    const payload = normalizeDesignerTemplate(template)
    console.log(JSON.stringify(payload, null, 2))
    toast.success("JSON экспортирован в консоль")
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
          <Button variant="outline" onClick={exportJSON}>
            <Upload className="w-4 h-4 mr-2" />
            Экспорт JSON
          </Button>
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

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id} className="border-2">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <CardTitle className="text-lg">Секция {sectionIndex + 1}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
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
                      onChange={(event) => updateSection(section.id, { code: event.target.value })}
                      placeholder="personal"
                    />
                  </div>
                  <div>
                    <Label>Название секции</Label>
                    <Input
                      value={section.title}
                      onChange={(event) => updateSection(section.id, { title: event.target.value })}
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
                        updateSection(section.id, { repeatable: Boolean(checked) })
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
                          updateSection(section.id, { min: Number.parseInt(event.target.value, 10) || 1 })
                        }
                      />
                      <Label htmlFor={`max-${section.id}`}>Макс.</Label>
                      <Input
                        id={`max-${section.id}`}
                        type="number"
                        className="w-20"
                        value={section.max ?? 1}
                        onChange={(event) =>
                          updateSection(section.id, { max: Number.parseInt(event.target.value, 10) || 1 })
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Поля</h4>
                {section.fields.map((field, fieldIndex) => (
                  <Card key={field.id} className="bg-gray-50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Поле {fieldIndex + 1}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeField(section.id, field.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Код поля</Label>
                          <Input
                            value={field.code}
                            onChange={(event) => updateField(section.id, field.id, { code: event.target.value })}
                            placeholder="last_name"
                          />
                        </div>
                        <div>
                          <Label>Тип поля</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: DesignerFieldType) => updateField(section.id, field.id, { type: value })}
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
                          onChange={(event) => updateField(section.id, field.id, { label: event.target.value })}
                          placeholder="Фамилия"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(section.id, field.id, { required: Boolean(checked) })}
                        />
                        <Label htmlFor={`required-${field.id}`}>Обязательное поле</Label>
                      </div>

                      {(field.type === "select_one" || field.type === "select_multiple") && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Варианты ответов</Label>
                            <Button variant="outline" size="sm" onClick={() => addOption(section.id, field.id)}>
                              <Plus className="w-3 h-3 mr-1" />
                              Добавить
                            </Button>
                          </div>
                          {field.options?.map((option, optionIndex) => (
                            <div key={`${field.id}-option-${optionIndex}`} className="flex items-center gap-2">
                              <Input
                                placeholder="Код"
                                value={option.code}
                                onChange={(event) => updateOption(section.id, field.id, optionIndex, { code: event.target.value })}
                                className="flex-1"
                              />
                              <Input
                                placeholder="Название"
                                value={option.label}
                                onChange={(event) => updateOption(section.id, field.id, optionIndex, { label: event.target.value })}
                                className="flex-1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => removeOption(section.id, field.id, optionIndex)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Button variant="outline" onClick={() => addField(section.id)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить поле
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addSection} className="w-full border-2 border-dashed bg-transparent py-6">
          <Plus className="w-5 h-5 mr-2" />
          Добавить секцию
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"



export function CreateTemplatePage() {
    const [template, setTemplate] = useState<Template>({
        title: "",
        sections: [],
    })
    console.log(template)
    const addSection = () => {
        const newSection: Section = {
            id: Date.now().toString(),
            code: "",
            title: "",
            repeatable: false,
            fields: [],
        }
        setTemplate({ ...template, sections: [...template.sections, newSection] })
    }

    const removeSection = (sectionId: string) => {
        setTemplate({
            ...template,
            sections: template.sections.filter((s) => s.id !== sectionId),
        })
    }

    const updateSection = (sectionId: string, updates: Partial<Section>) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
        })
    }

    const addField = (sectionId: string) => {
        const newField: Field = {
            id: Date.now().toString(),
            code: "",
            type: "text",
            label: "",
            required: false,
        }
        setTemplate({
            ...template,
            sections: template.sections.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s)),
        })
    }

    const removeField = (sectionId: string, fieldId: string) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) =>
                s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s,
            ),
        })
    }

    const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
                    }
                    : s,
            ),
        })
    }

    const addOption = (sectionId: string, fieldId: string) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        fields: s.fields.map((f) =>
                            f.id === fieldId
                                ? {
                                    ...f,
                                    options: [...(f.options || []), { code: "", label: "" }],
                                }
                                : f,
                        ),
                    }
                    : s,
            ),
        })
    }

    const updateOption = (
        sectionId: string,
        fieldId: string,
        optionIndex: number,
        updates: Partial<{ code: string; label: string }>,
    ) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        fields: s.fields.map((f) =>
                            f.id === fieldId
                                ? {
                                    ...f,
                                    options: f.options?.map((opt, idx) => (idx === optionIndex ? { ...opt, ...updates } : opt)),
                                }
                                : f,
                        ),
                    }
                    : s,
            ),
        })
    }

    const removeOption = (sectionId: string, fieldId: string, optionIndex: number) => {
        setTemplate({
            ...template,
            sections: template.sections.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        fields: s.fields.map((f) =>
                            f.id === fieldId
                                ? {
                                    ...f,
                                    options: f.options?.filter((_, idx) => idx !== optionIndex),
                                }
                                : f,
                        ),
                    }
                    : s,
            ),
        })
    }

    const exportJSON = () => {
        const exportData = {
            title: template.title,
            sections: template.sections.map((s) => ({
                code: s.code,
                title: s.title,
                repeatable: s.repeatable,
                ...(s.repeatable && { min: s.min, max: s.max }),
                fields: s.fields.map((f) => ({
                    code: f.code,
                    type: f.type,
                    label: f.label,
                    required: f.required,
                    ...(f.options && { options: f.options }),
                })),
            })),
        }
        console.log(JSON.stringify(exportData, null, 2))
        alert("JSON выведен в консоль")
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Конструктор шаблона анкеты</h1>
                    <p className="text-gray-600">Создайте структуру анкеты с секциями и полями</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportJSON}>
                        Экспорт JSON
                    </Button>
                    <Button className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]">
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить
                    </Button>
                </div>
            </div>

            {/* Template Title */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Название шаблона</Label>
                            <Input
                                id="title"
                                value={template.title}
                                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                                placeholder="Например: Анкета студента v3"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-6">
                {template.sections.map((section, sectionIndex) => (
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
                        <CardContent className="pt-6">
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Код секции</Label>
                                        <Input
                                            value={section.code}
                                            onChange={(e) => updateSection(section.id, { code: e.target.value })}
                                            placeholder="personal"
                                        />
                                    </div>
                                    <div>
                                        <Label>Название секции</Label>
                                        <Input
                                            value={section.title}
                                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                            placeholder="Личные данные"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`repeatable-${section.id}`}
                                            checked={section.repeatable}
                                            onCheckedChange={(checked) =>
                                                updateSection(section.id, {
                                                    repeatable: checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor={`repeatable-${section.id}`}>Повторяющаяся секция</Label>
                                    </div>
                                    {section.repeatable && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Label>Мин:</Label>
                                                <Input
                                                    type="number"
                                                    className="w-20"
                                                    value={section.min || 0}
                                                    onChange={(e) =>
                                                        updateSection(section.id, {
                                                            min: Number.parseInt(e.target.value),
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label>Макс:</Label>
                                                <Input
                                                    type="number"
                                                    className="w-20"
                                                    value={section.max || 0}
                                                    onChange={(e) =>
                                                        updateSection(section.id, {
                                                            max: Number.parseInt(e.target.value),
                                                        })
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Поля</h4>
                                {section.fields.map((field, fieldIndex) => (
                                    <Card key={field.id} className="bg-gray-50">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">Поле {fieldIndex + 1}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeField(section.id, field.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <Label>Код поля</Label>
                                                    <Input
                                                        value={field.code}
                                                        onChange={(e) =>
                                                            updateField(section.id, field.id, {
                                                                code: e.target.value,
                                                            })
                                                        }
                                                        placeholder="last_name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Тип поля</Label>
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value: FieldType) =>
                                                            updateField(section.id, field.id, {
                                                                type: value,
                                                            })
                                                        }
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
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <Label>Название поля</Label>
                                                <Input
                                                    value={field.label}
                                                    onChange={(e) =>
                                                        updateField(section.id, field.id, {
                                                            label: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Фамилия"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <Checkbox
                                                    id={`required-${field.id}`}
                                                    checked={field.required}
                                                    onCheckedChange={(checked) =>
                                                        updateField(section.id, field.id, {
                                                            required: checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor={`required-${field.id}`}>Обязательное поле</Label>
                                            </div>

                                            {/* Options for select fields */}
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
                                                        <div key={optionIndex} className="flex gap-2 items-center">
                                                            <Input
                                                                placeholder="Код"
                                                                value={option.code}
                                                                onChange={(e) =>
                                                                    updateOption(section.id, field.id, optionIndex, {
                                                                        code: e.target.value,
                                                                    })
                                                                }
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                placeholder="Название"
                                                                value={option.label}
                                                                onChange={(e) =>
                                                                    updateOption(section.id, field.id, optionIndex, {
                                                                        label: e.target.value,
                                                                    })
                                                                }
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeOption(section.id, field.id, optionIndex)}
                                                            >
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

                <Button variant="outline" onClick={addSection} className="w-full border-2 border-dashed h-16 bg-transparent">
                    <Plus className="w-5 h-5 mr-2" />
                    Добавить секцию
                </Button>
            </div>
        </div>
    )
}

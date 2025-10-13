"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"
import { Plus, Trash2, Users, Bot, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

interface Participant {
    id: string
    email: string
    firstName: string
    lastName: string
}

export function CreateSurveyPage() {
    const [surveyTitle, setSurveyTitle] = useState("")
    const [surveyDescription, setSurveyDescription] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState("")
    const [invitationMode, setInvitationMode] = useState<"manual" | "bot">("manual")
    const [participants, setParticipants] = useState<Participant[]>([])
    const [maxParticipants, setMaxParticipants] = useState(10)

    const addParticipant = () => {
        const newParticipant: Participant = {
            id: Date.now().toString(),
            email: "",
            firstName: "",
            lastName: "",
        }
        setParticipants([...participants, newParticipant])
    }


    const removeParticipant = (id: string) => {
        setParticipants(participants.filter((p) => p.id !== id))
    }

    const updateParticipant = (id: string, field: keyof Participant, value: string) => {
        setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    }

    const handleSubmit = () => {
        const surveyData = {
            title: surveyTitle,
            description: surveyDescription,
            template: selectedTemplate,
            invitationMode,
            ...(invitationMode === "manual" ? { participants } : { maxParticipants }),
        }
        console.log("[v0] Survey data:", surveyData)
        alert("Анкета создана! Данные выведены в консоль")
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/surveys">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к анкетам
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Создание новой анкеты</h1>
                <p className="text-gray-600">Заполните информацию и добавьте участников</p>
            </div>

            {/* Basic Information */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Название анкеты</Label>
                        <Input
                            id="title"
                            value={surveyTitle}
                            onChange={(e) => setSurveyTitle(e.target.value)}
                            placeholder="Введите название анкеты"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            value={surveyDescription}
                            onChange={(e) => setSurveyDescription(e.target.value)}
                            placeholder="Краткое описание анкеты"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="template">Шаблон анкеты</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger id="template">
                                <SelectValue placeholder="Выберите шаблон" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student_v3">Анкета студента v3</SelectItem>
                                <SelectItem value="employee">Анкета сотрудника</SelectItem>
                                <SelectItem value="feedback">Анкета обратной связи</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Invitation Mode */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Приглашения участников</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={invitationMode} onValueChange={(v) => setInvitationMode(v as "manual" | "bot")}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="manual" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Ручное добавление
                            </TabsTrigger>
                            <TabsTrigger value="bot" className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                Режим "Бот"
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Добавьте участников вручную, указав их email и имя. Каждый участник получит персональное приглашение.
                            </p>

                            {participants.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
                                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-600 mb-4">Участники еще не добавлены</p>
                                    <Button onClick={addParticipant} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Добавить первого участника
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {participants.map((participant, index) => (
                                        <Card key={participant.id} className="bg-gray-50">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <span className="text-sm font-medium text-gray-700">Участник {index + 1}</span>
                                                    <Button variant="ghost" size="icon" onClick={() => removeParticipant(participant.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <Label>Email</Label>
                                                        <Input
                                                            type="email"
                                                            value={participant.email}
                                                            onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                                                            placeholder="email@example.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Имя</Label>
                                                        <Input
                                                            value={participant.firstName}
                                                            onChange={(e) => updateParticipant(participant.id, "firstName", e.target.value)}
                                                            placeholder="Иван"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Фамилия</Label>
                                                        <Input
                                                            value={participant.lastName}
                                                            onChange={(e) => updateParticipant(participant.id, "lastName", e.target.value)}
                                                            placeholder="Иванов"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button onClick={addParticipant} variant="outline" className="w-full bg-transparent">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Добавить участника
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="bot" className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex gap-3">
                                    <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-1">Режим "Бот"</h4>
                                        <p className="text-sm text-blue-800">
                                            В этом режиме система автоматически создаст уникальные ссылки для указанного количества
                                            участников. Участники смогут заполнить анкету по ссылке без предварительной регистрации.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-md">
                                <Label htmlFor="maxParticipants">Максимальное количество участников</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(Number.parseInt(e.target.value) || 1)}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-gray-600">участников</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Будет создано {maxParticipants} уникальных ссылок для заполнения анкеты
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mt-6">
                                <h4 className="font-semibold text-gray-900 mb-2">Что произойдет после создания:</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Система сгенерирует {maxParticipants} уникальных ссылок</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Каждая ссылка может быть использована только один раз</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>Вы сможете скачать список ссылок или отправить их участникам</span>
                                    </li>
                                </ul>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <Link href="/surveys">
                    <Button variant="outline">Отмена</Button>
                </Link>
                <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]"
                    disabled={!surveyTitle || !selectedTemplate}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Создать анкету
                </Button>
            </div>
        </div>
    )
}
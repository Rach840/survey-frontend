"use client"

import {useEffect, useState} from "react"
import {Button} from "@/shared/ui/button"
import {Input} from "@/shared/ui/input"
import {Label} from "@/shared/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "@/shared/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/ui/select"
import {Textarea} from "@/shared/ui/textarea"
import {ArrowLeft, Bot, Plus, Save, Trash2, Users} from "lucide-react"
import Link from "next/link"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/shared/ui/tabs"
import {useTemplatesByMe} from "@/entities/templates/model/templateQuery"
import type {CreateSurveyPayload, EnrollmentCreatePayload} from "@/features/survey/create-survey"
import {useSurveyCreate} from "@/features/survey/create-survey"
import {toast} from "sonner"
import {Skeleton} from "@/shared/ui/skeleton"

interface Participant {
    id: string
    email: string
    firstName: string
    lastName: string
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export default function CreateSurveyPage() {
    const [surveyTitle, setSurveyTitle] = useState("")
    const [surveyDescription, setSurveyDescription] = useState("")
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [invitationMode, setInvitationMode] = useState<"admin" | "bot">("admin")
    const [participants, setParticipants] = useState<Participant[]>([])
    const [maxParticipants, setMaxParticipants] = useState(10)
    const [publicSlug, setPublicSlug] = useState("")
    const [isSlugDirty, setIsSlugDirty] = useState(false)
    const { data, isLoading } = useTemplatesByMe()
    const templates = data ?? []
    const isTemplatesLoading = isLoading && templates.length === 0
    const { mutateAsync, isPending } = useSurveyCreate()

    useEffect(() => {
        if (isSlugDirty) {
            return
        }
        const nextSlug = slugify(surveyTitle)
        setPublicSlug((current) => (current === nextSlug ? current : nextSlug))
    }, [surveyTitle, isSlugDirty])
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

    const handleSubmit = async () => {
        if (!selectedTemplateId) {
            toast.error("Выберите шаблон анкеты")
            return
        }

        const normalizedParticipants = participants
            .map(({ email, firstName, lastName }) => ({
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            }))
            .filter((participant) => participant.email)

        const participantsPayload: EnrollmentCreatePayload[] = normalizedParticipants.map((participant) => {
            const fullName = [participant.firstName, participant.lastName]
                .filter(Boolean)
                .join(' ')
                .trim()

            return {
                full_name: fullName || participant.email,
                email: participant.email,
            }
        })

        if (invitationMode === "admin" && participantsPayload.length === 0) {
            toast.error("Добавьте хотя бы одного участника")
            return
        }

        const safeMaxParticipants = Math.max(1, maxParticipants)
        const normalizedSlug = slugify(publicSlug)

        const payload: CreateSurveyPayload = {
            template_id: Number(selectedTemplateId),
            title: surveyTitle.trim(),
            invitationMode,
            status: "draft",
            participants: invitationMode === "admin" ? participantsPayload : [],
            public_slug: normalizedSlug || undefined,
            max_participants:
                invitationMode === "admin"
                    ? participantsPayload.length > 0 ? participantsPayload.length : undefined
                    : safeMaxParticipants,
        }

        try {
            await mutateAsync(payload)
            toast.success("Анкета создана")
        } catch (error) {
            console.error(error)
            toast.error("Не удалось создать анкету")
        }
    }

    return (
        <div className=" max-w-5xl mx-auto">
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
                        <Label htmlFor="publicSlug">Публичный идентификатор</Label>
                        <Input
                            id="publicSlug"
                            value={publicSlug}
                            onChange={(e) => {
                                setPublicSlug(slugify(e.target.value))
                                setIsSlugDirty(true)
                            }}
                            onBlur={() => {
                                if (!publicSlug.trim()) {
                                    setIsSlugDirty(false)
                                }
                            }}
                            placeholder="Например, team-onboarding"
                            autoComplete="off"
                        />
                        <p className="text-xs text-gray-500">
                            Ссылка для участников: /survey/{publicSlug || 'ваш-слаг'}
                        </p>
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
                        {isTemplatesLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={selectedTemplateId}
                                onValueChange={setSelectedTemplateId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="template">
                                    <SelectValue placeholder="Выберите шаблон" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Invitation Mode */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Приглашения участников</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={invitationMode} onValueChange={(v) => setInvitationMode(v as "admin" | "bot")}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="admin" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Ручное добавление
                            </TabsTrigger>
                            <TabsTrigger value="bot" className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                Режим &quot;Бот&quot;
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="admin" className="space-y-4">
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
                                    <Button onClick={addParticipant} variant="outline" className="w-full ">
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
                                        <h4 className="font-semibold text-blue-900 mb-1">Режим &quot;Бот&quot;</h4>
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
                    disabled={!surveyTitle.trim() || !selectedTemplateId || isPending || isTemplatesLoading}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isPending ? "Создание..." : "Создать анкету"}
                </Button>
            </div>
        </div>
    )
}

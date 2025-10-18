"use client"

import {useState} from "react"
import {Button} from "@/shared/ui/button"
import {Input} from "@/shared/ui/input"
import {Card, CardContent, CardHeader, CardTitle} from "@/shared/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/ui/select"
import {ArrowLeft, Save} from "lucide-react"
import Link from "next/link"
import {useTemplatesByMe} from "@/entities/templates/model/templateQuery"
import type {EnrollmentCreatePayload} from "@/features/survey/create-survey"
import {useSurveyCreate} from "@/features/survey/create-survey"
import {toast} from "sonner"
import {Skeleton} from "@/shared/ui/skeleton"
import {SurveyInput, SurveyOutput, surveySchema} from "@/pages/surveys-page/create/schema/create-schema";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/shared";
import {z} from "zod";
import {MethodCard, Participant} from "@/pages/surveys-page/create/ui/MethodCard";


function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}
export type RHFContext = Record<string, never>;
export default function CreateSurveyPage() {
    const [participants, setParticipants] = useState<Participant[]>([])
    const [maxParticipants, setMaxParticipants] = useState(10)
    const { data:templates, isLoading } = useTemplatesByMe()
    const { mutateAsync, isPending } = useSurveyCreate()
    const createForm = useForm<SurveyInput, RHFContext, SurveyOutput>({
        resolver: zodResolver(surveySchema),
        defaultValues:{
            invitationMode: "admin",
            max_participants: 10,
            status: "draft",
            title: "",
            public_slug: ""
        },
        mode: "onTouched",
    });

    const handleSubmit = async () => {
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
                full_name: fullName,
                email: participant.email,
            }
        })
        createForm.setValue("participants", participantsPayload)
        createForm.setValue('public_slug', slugify(createForm.getValues('public_slug')))
        createForm.setValue('max_participants',createForm.getValues("invitationMode") === "admin"
            ? participantsPayload.length > 0 ? participantsPayload.length : 10
            : Math.max(1, maxParticipants))
        if (createForm.getValues("invitationMode") === "admin" && participantsPayload.length === 0) {
            toast.error("Добавьте хотя бы одного участника")
            return
        }
        console.log(createForm.getValues())

    const data = surveySchema.safeParse(createForm.getValues())
    if (!data.success) {
        toast.error(Object.values(z.flattenError(data.error)).flat().map(er=> Object.values(er).toString()).flat().toString())
        return
    } else {
        try {
            await mutateAsync(data.data)
            toast.success("Анкета создана")
        } catch  {
            toast.error("Не удалось создать анкету")
        }
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

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={handleSubmit} id="form-survey-create" className=" space-y-6">
                        <Controller
                            name="title"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-survey-create-title">
                                        Название анкеты
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-survey-create-title"
                                        type={'text'}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Введите название анкеты"
                                        autoComplete="off"

                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="public_slug"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-survey-create-publicSlug">
                                        Публичный идентификатор
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-survey-create-publicSlug"
                                        type={'text'}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Например, team-onboarding"
                                        autoComplete="off"

                                    />
                                    <FieldDescription>
                                            Ссылка для участников: /survey/{createForm.getValues("public_slug") || 'ваш-слаг'}

                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="template_id"
                            control={createForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-survey-create-publicSlug">
                                        Шаблон анкеты
                                    </FieldLabel>

                                    {isLoading && templates?.length === 0 ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            value={String(createForm.getValues('template_id'))}
                                            onValueChange={(v)=> createForm.setValue("template_id",Number(v))}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="template">
                                                <SelectValue placeholder="Выберите шаблон" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {  templates?.map((item) => (
                                                    <SelectItem key={item.id} value={String(item.id)}>
                                                        {item.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </form>
                </CardContent>
            </Card>
<MethodCard form={createForm} setParticipants={setParticipants} participants={participants} maxParticipants={maxParticipants} setMaxParticipants={setMaxParticipants}/>
            <div className="flex gap-4 justify-end">
                <Link href="/surveys">
                    <Button variant="outline">Отмена</Button>
                </Link>
                <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]"
                    disabled={!createForm.getValues('title').trim() || !createForm.getValues("template_id") || isPending || isLoading}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isPending ? "Создание..." : "Создать анкету"}
                </Button>
            </div>
        </div>
    )
}

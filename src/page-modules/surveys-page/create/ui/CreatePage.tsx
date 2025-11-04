"use client"

import {useState} from "react"
import {Button} from "@/shared/ui/button"
import {Input} from "@/shared/ui/input"
import {Card, CardContent, CardHeader, CardTitle} from "@/shared/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/ui/select"
import {ArrowLeft, Save} from "lucide-react"
import Link from "next/link"
import {motion} from "motion/react"
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
import {fadeTransition, fadeUpVariants} from "@/shared/ui/page-transition";


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
    const [participants, setParticipants] = useState<Participant[]>([])
    const [maxParticipants, setMaxParticipants] = useState(10)
    const { data: templatesData, isLoading } = useTemplatesByMe()
    const templates = templatesData ?? []
    const { mutateAsync, isPending } = useSurveyCreate()
    const createForm = useForm<SurveyInput, Record<string, never>, SurveyOutput>({
        resolver: zodResolver(surveySchema),
        defaultValues:{
            invitationMode: "admin",
            max_participants: 10,
            status: "draft",
            title: "",
            public_slug: "",
            starts_at: undefined,
            ends_at: undefined,
        },
        mode: "onTouched",
    });

    const slugValue = createForm.watch('public_slug')
    const slugPreview = slugify(slugValue || "")
    const startsAtValue = createForm.watch('starts_at')

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
    const data = surveySchema.safeParse(createForm.getValues())
    if (!data.success) {
        toast.error(Object.values(z.flattenError(data.error)).flat().map(er=> Object.values(er).toString()).flat().toString())
        return
    } else {
        const startsAtDate = data.data.starts_at ? new Date(data.data.starts_at) : null
        const endsAtDate = data.data.ends_at ? new Date(data.data.ends_at) : null

        if (startsAtDate && Number.isNaN(startsAtDate.getTime())) {
            toast.error("Некорректная дата начала анкеты")
            return
        }

        if (endsAtDate && Number.isNaN(endsAtDate.getTime())) {
            toast.error("Некорректная дата окончания анкеты")
            return
        }
     
        const payload = {
            ...data.data,
            starts_at: startsAtDate ? startsAtDate.toISOString() : undefined,
            ends_at: endsAtDate ? endsAtDate.toISOString() : undefined,
        }

        try {
            await mutateAsync(payload)
            toast.success("Анкета создана")
        } catch  {
            toast.error("Не удалось создать анкету")
        }
    }

    }

    return (
        <div className="min-h-screen  px-4 pb-20 pt-10 sm:px-8 lg:px-12">
            <motion.div
                className="mx-auto flex max-w-5xl flex-col gap-8"
                initial="hidden"
                animate="show"
                variants={fadeUpVariants}
                transition={fadeTransition}
            >
            <div>
                <Link href="/admin/surveys">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к анкетам
                    </Button>
                </Link>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Создание новой анкеты</h1>
                <p className="text-gray-600">Заполните информацию и добавьте участников</p>
            </div>

            <motion.div
                variants={fadeUpVariants}
                transition={{ ...fadeTransition, delay: 0.05 }}
            >
            <Card className="mb-6 border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={handleSubmit} id="form-survey-create" className="space-y-6">
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
                                        Ссылка для участников: /survey/{slugPreview || 'ваш-слаг'}
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

                                    {isLoading && templates.length === 0 ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            value={String(createForm.getValues('template_id'))}
                                            onValueChange={(v) => createForm.setValue("template_id", Number(v))}
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
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <div className='grid gap-4 md:grid-cols-2'>
                            <Controller
                                name="starts_at"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-survey-create-startsAt">
                                            Дата начала анкеты
                                        </FieldLabel>
                                        <Input
                                            id="form-survey-create-startsAt"
                                            type='datetime-local'
                                            value={field.value ?? ''}
                                            onChange={(event) => field.onChange(event.target.value || undefined)}
                                            onBlur={field.onBlur}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldDescription>Оставьте пустым, чтобы анкета стала доступна сразу после создания</FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="ends_at"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-survey-create-endsAt">
                                            Дата окончания анкеты
                                        </FieldLabel>
                                        <Input
                                            id="form-survey-create-endsAt"
                                            type='datetime-local'
                                            value={field.value ?? ''}
                                            min={startsAtValue ?? undefined}
                                            onChange={(event) => field.onChange(event.target.value || undefined)}
                                            onBlur={field.onBlur}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldDescription>Оставьте пустым, чтобы анкета оставалась доступной без ограничений</FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
            </motion.div>

            <motion.div
                variants={fadeUpVariants}
                transition={{ ...fadeTransition, delay: 0.1 }}
            >
                <MethodCard
                    form={createForm}
                    setParticipants={setParticipants}
                    participants={participants}
                    maxParticipants={maxParticipants}
                    setMaxParticipants={setMaxParticipants}
                />
            </motion.div>

            <motion.div
                className="flex justify-end gap-4"
                variants={fadeUpVariants}
                transition={{ ...fadeTransition, delay: 0.15 }}
            >
                <Link href="/admin/surveys">
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
            </motion.div>
            </motion.div>
        </div>
    )
}

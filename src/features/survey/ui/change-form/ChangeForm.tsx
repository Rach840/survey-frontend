import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/ui/sheet'
import {Input} from '@/shared/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/ui/select'
import {Button, Field, FieldError, FieldGroup, FieldLabel} from "@/shared";
import {Edit3, RefreshCcw} from "lucide-react";
import {Survey, SurveyMode, SurveyStatus} from "@/entities/surveys/types";
import {statusLabels} from "@/entities/templates/types";
import {toast} from "sonner";
import {Controller, useForm} from "react-hook-form";
import {updateSchema, UpdateSchema} from "@/features/survey/ui/change-form/schema/updateSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useSurveyUpdate} from "@/features/survey/update-survey";


export function ChangeForm({survey, editOpen,  setEditOpen}: { survey: Survey | undefined,editOpen: boolean, setEditOpen: (v:boolean)=> void}) {
    const {mutateAsync, isPending} = useSurveyUpdate(survey?.id)
    console.log(survey)


    const form = useForm<UpdateSchema>({
        resolver: zodResolver(updateSchema),
        mode: "onChange",
        defaultValues: {
            title: survey?.title,
            invitationMode: (survey?.mode as SurveyMode) ?? 'questioner',
            status: (survey?.status as SurveyStatus) ?? 'draft',
            max_participants: survey.max_participants,
            starts_at: toInputDateTime(survey?.starts_at),
            ends_at: toInputDateTime(survey?.ends_at),
        },
    })

    const handleSave = async () => {
        const parsed = updateSchema.safeParse(form.getValues())
        if (!parsed.success) {
            toast.error(Object.values(z.flattenError(parsed.error)).flat().map(er=> Object.values(er).toString()).flat().toString())
            return
        } else {
            const startsAtIso = parseDateTime(parsed.data.starts_at)
            const endsAtIso =  parseDateTime(parsed.data.ends_at)

            const payload = {
               ...parsed.data,
                starts_at: startsAtIso,
                ends_at: endsAtIso,
            }

            try {
                await mutateAsync(payload)
                toast.success('Анкета обновлена')
                setEditOpen(false)
            } catch (error) {
                console.error(error)
                toast.error('Не удалось сохранить изменения')
            }
        }

    }

    return (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetTrigger asChild>
                <Button variant='outline' className='gap-2'>
                    <Edit3 className='h-4 w-4' />
                    Редактировать
                </Button>
            </SheetTrigger>
            <SheetContent className='flex flex-col' side='right'>
                <SheetHeader>
                    <SheetTitle>Редактирование анкеты</SheetTitle>
                    <SheetDescription>
                        Обновите основные параметры. Изменения сохранятся сразу после подтверждения.
                    </SheetDescription>
                </SheetHeader>
                <div className=''>

                        <form id={"form-upd"} onSubmit={form.handleSubmit(handleSave)} className="flex-1 space-y-4 overflow-y-auto p-4">
                            <FieldGroup>

                            <Controller
                                control={form.control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                        <FieldLabel>Название</FieldLabel>

                                            <Input placeholder="Название анкеты" {...field} />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="invitationMode"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                        <FieldLabel>Режим приглашений</FieldLabel>

                                            <Select      name={field.name}
                                                         value={field.value}
                                                         onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Выберите режим' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='admin'>Администратор</SelectItem>
                                                    <SelectItem value='bot'>Бот</SelectItem>
                                                </SelectContent>
                                            </Select>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="invitationMode"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                        <FieldLabel>Статус</FieldLabel>

                                            <Select      name={field.name}
                                                         value={field.value}
                                                         onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Выберите статус' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(Object.keys(statusLabels) as SurveyStatus[]).map((status,key:number) => (
                                                        <SelectItem key={key} value={status}>
                                                            {statusLabels[status]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />


                            <Controller
                                control={form.control}
                                name="max_participants"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                        <FieldLabel>Максимум участников</FieldLabel>

                                            <Input   type='number'  placeholder='Не ограничено'
                                                     min={1}  {...field} />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <FieldGroup className='grid gap-4 md:grid-cols-2'>
                                <Controller
                                    control={form.control}
                                    name="starts_at"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                            <FieldLabel>Дата начала</FieldLabel>

                                                <Input  type='datetime-local'
                                                        min={1}  {...field} />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="ends_at"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className={"space-y-2"}>
                                            <FieldLabel>Дата конца</FieldLabel>

                                                <Input  type='datetime-local'
                                                        min={1}  {...field} />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldGroup>
                        </form>

                </div>
                <SheetFooter>
                    <Button onClick={handleSave} form="form-upd" disabled={isPending} className='w-full gap-2'>
                        {isPending ? <RefreshCcw className='h-4 w-4 animate-spin' /> : <Edit3 className='h-4 w-4' />}
                        {isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

function toInputDateTime(value?: string | null) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseDateTime(value: string) {
    if (!value) return null
    const iso = new Date(value)
    if (Number.isNaN(iso.getTime())) return null
    return iso.toISOString()
}

import {Card, CardContent, CardDescription, CardHeader, CardTitle, enrollmentLabels, responseLabels} from "@/shared";
import {statusLabels} from "@/entities/templates/types";
import {GeneratedForm} from "@/features/template/generated";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {sectionsToDynamicForm} from "@/entities/templates/lib/toDynamicForm";
import {PublicSurveySession} from "@/entities/public-survey";
import {toast} from "sonner";
import {buildSubmissionAnswers, writeDraft} from "@/entities/surveys/lib";
import {useSubmitSurvey} from "@/features/survey/submit-survey";
import {useQueryClient} from "@tanstack/react-query";

const AUTOSAVE_DELAY = 600


export function SurveyForm({data, isSubmitted, shouldShowForm,token, storageKey,setIsSubmited, initialValues} : {data: PublicSurveySession,initialValues:Record<string, unknown> | undefined,isSubmitted: boolean, shouldShowForm: boolean,token: string, storageKey: string,setIsSubmited: (v:boolean)=> void}) {
    const formSections = data?.survey.formSnapshot
    const queryClient = useQueryClient()
    const autosaveTimer = useRef<number | null>(null)

    const {mutateAsync: submit, isPending: submitPending} = useSubmitSurvey(token,storageKey,setIsSubmited, queryClient)
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) {
                window.clearTimeout(autosaveTimer.current)
            }
        }
    }, [])
    const handleSubmit = useCallback(
        async (values: Record<string, unknown>) => {
            if (isSubmitted) {
                toast.info('Ответ уже отправлен.')
                return
            }

            if (!shouldShowForm) {
                toast.error('Анкетирование ещё не начато. Нажмите «Начать анкетирование».')
                return
            }

            if (!formSections) {
                toast.error('Не удалось определить структуру анкеты.')
                return
            }

            const answers = buildSubmissionAnswers(formSections, values)
            await submit(answers)
        },
        [formSections, isSubmitted, submit, shouldShowForm],
    )

    const handleChange = useCallback(
        (values: Record<string, unknown>) => {
            if (!storageKey || isSubmitted) return
            if (autosaveTimer.current) {
                window.clearTimeout(autosaveTimer.current)
            }
            autosaveTimer.current = window.setTimeout(() => {
                writeDraft(storageKey, values)
            }, AUTOSAVE_DELAY)
        },
        [storageKey, isSubmitted],
    )

    const schema = useMemo(() => {
        if (!data?.survey.formSnapshot || data.survey.formSnapshot.length === 0) {
            return null
        }
        return sectionsToDynamicForm(data.survey.title, data.survey.formSnapshot)
    }, [data])

    return (
        <div className='min-h-screen bg-slate-50 px-4 py-12'>
            <div className='mx-auto flex max-w-3xl flex-col gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-2xl font-semibold text-gray-900'>{data.survey.title}</CardTitle>
                        <CardDescription className='text-gray-600'>
                            {data.survey.description || 'Заполните форму, чтобы отправить ответы организатору.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <p className='text-xs uppercase text-gray-500'>Участник</p>
                            <p className='text-sm font-medium text-gray-900'>{data.enrollment.fullName}</p>
                            {data.enrollment.state ? (
                                <p className='text-xs text-gray-500'>
                                    {enrollmentLabels[data.enrollment.state] ?? data.enrollment.state}
                                </p>
                            ) : null}
                        </div>
                        <div>
                            <p className='text-xs uppercase text-gray-500'>Статус анкеты</p>
                            <p className='text-sm font-medium text-gray-900'>
                                {statusLabels[data.survey.status] ?? data.survey.status}
                            </p>
                            {data.response?.state ? (
                                <p className='text-xs text-gray-500'>
                                    {responseLabels[data.response.state] ?? data.response.state}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                {schema ? (
                    <GeneratedForm
                        schema={schema}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onChange={handleChange}
                        submitLabel='Завершить анкету'
                        submittingLabel='Отправляем...'
                        hideResetButton={false}
                        isSubmitting={submitPending}
                        isReadOnly={false}
                        showSubmissionPreview={false}
                    />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg text-gray-900'>Анкета пока не содержит вопросов</CardTitle>
                            <CardDescription className='text-gray-600'>
                                Обратитесь к организатору для уточнения статуса анкеты.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    )
}
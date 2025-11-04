import {PublicSurveySession} from "@/entities/public-survey";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    enrollmentLabels,
    formatDateTime
} from "@/shared";
import {Loader2, PlayCircle} from "lucide-react";
import {statusLabels} from "@/entities/templates/types";
import {useCallback} from "react";

type SurveyStartScreenProps = {
    session: PublicSurveySession
    startMutation: () => void
    isStarting: boolean
    pending: boolean
}

export function SurveyStartScreen({ session, startMutation,pending, isStarting }: SurveyStartScreenProps) {
    const { survey, enrollment } = session
    const contact = enrollment.email ?? enrollment.phone ?? '—'
    const closesAt = survey.endsAt ? formatDateTime(survey.endsAt) : null
    const handleStart = useCallback(() => {
        if (pending) return
        startMutation()
    }, [startMutation])

    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
            <Card className='w-full max-w-2xl border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
                <CardHeader className='space-y-4'>
                    <div className='flex items-start gap-3'>
                        <div className='rounded-full bg-indigo-100 p-2 text-indigo-600'>
                            <PlayCircle className='h-5 w-5' />
                        </div>
                        <div>
                            <CardTitle className='text-2xl font-semibold text-gray-900'>{survey.title}</CardTitle>
                            <CardDescription className='text-gray-600'>
                                {survey.description || 'Проверьте данные и начните прохождение анкеты.'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid gap-4 text-sm text-gray-700 sm:grid-cols-2'>
                        <div>
                            <p className='text-xs uppercase text-gray-500'>Участник</p>
                            <p className='mt-1 font-medium text-gray-900'>{enrollment.fullName}</p>
                            {enrollment.state ? (
                                <p className='text-xs text-gray-500'>
                                    {enrollmentLabels[enrollment.state] ?? enrollment.state}
                                </p>
                            ) : null}
                        </div>
                        <div>
                            <p className='text-xs uppercase text-gray-500'>Контакты</p>
                            <p className='mt-1 font-medium text-gray-900'>{contact}</p>
                            {enrollment.email && enrollment.phone ? (
                                <p className='text-xs text-gray-500'>{enrollment.phone}</p>
                            ) : null}
                        </div>
                        <div>
                            <p className='text-xs uppercase text-gray-500'>Статус анкеты</p>
                            <p className='mt-1 font-medium text-gray-900'>
                                {statusLabels[survey.status] ?? survey.status}
                            </p>
                            <p className='text-xs text-gray-500'>
                                Формат: {survey.mode === 'bot' ? 'Через бота' : 'Администратор'}
                            </p>
                        </div>
                        {closesAt ? (
                            <div>
                                <p className='text-xs uppercase text-gray-500'>Доступно до</p>
                                <p className='mt-1 font-medium text-gray-900'>{closesAt}</p>
                                <p className='text-xs text-gray-500'>После этого ответы могут не приниматься.</p>
                            </div>
                        ) : null}
                    </div>
                    <div className='space-y-2'>
                        <Button
                            className='w-full gap-2 text-base font-medium'
                            size='lg'
                            onClick={handleStart}
                            disabled={isStarting}
                        >
                            {isStarting ? <Loader2 className='h-4 w-4 animate-spin' /> : <PlayCircle className='h-4 w-4' />}
                            {isStarting ? 'Запускаем...' : 'Начать анкетирование'}
                        </Button>
                        <p className='text-center text-xs text-gray-500'>
                            Нажимая кнопку, вы подтверждаете, что данные участника корректны и готовы к отправке.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

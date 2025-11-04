import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, formatDateTime} from "@/shared";
import {CheckCircle2, RefreshCcw} from "lucide-react";
import {PublicSurveySession} from "@/entities/public-survey";

type SurveyCompletionScreenProps = {
    session: PublicSurveySession
    onReload: () => void
}

export function SurveyCompletionScreen({ session, onReload }: SurveyCompletionScreenProps) {
    const submittedAt = session.response?.submittedAt ? formatDateTime(session.response.submittedAt) : null

    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
            <Card className='w-full max-w-2xl border-none bg-white/90 shadow-lg ring-1 ring-emerald-200/70 backdrop-blur-sm'>
                <CardHeader className='flex flex-col items-center gap-3 text-center'>
                    <div className='rounded-full bg-emerald-100 p-3 text-emerald-600'>
                        <CheckCircle2 className='h-6 w-6' />
                    </div>
                    <CardTitle className='text-2xl font-semibold text-gray-900'>Анкета пройдена</CardTitle>
                    <CardDescription className='text-gray-600'>
                        Спасибо, {session.enrollment.fullName}! Ваши ответы отправлены организатору
                        {submittedAt && submittedAt !== '—' ? ` ${submittedAt}.` : '.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 text-sm text-gray-600'>
                    <p>
                        Сохраните подтверждение о прохождении или закройте страницу. При необходимости вы можете обновить данные, чтобы повторно загрузить ответы.
                    </p>
                    <Button variant='outline' className='w-full gap-2 sm:w-auto' onClick={onReload}>
                        <RefreshCcw className='h-4 w-4' />
                        Обновить данные
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

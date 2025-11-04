import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, formatDateTime} from "@/shared";
import {AlertCircle, RefreshCcw} from "lucide-react";
import {PublicSurveySession} from "@/entities/public-survey";

type SurveyExpiredNoticeProps = {
    session: PublicSurveySession
    onRetry: () => void
}

export function SurveyExpiredNotice({ session, onRetry }: SurveyExpiredNoticeProps) {
    const expiresAt = session.survey.endsAt ? formatDateTime(session.survey.endsAt) : null

    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
            <Card className='w-full max-w-xl border-red-200 bg-red-50 shadow-lg ring-1 ring-red-200/60'>
                <CardHeader className='flex items-start gap-3'>
                    <AlertCircle className='h-6 w-6 text-red-500' />
                    <div>
                        <CardTitle className='text-lg font-semibold text-red-700'>Приглашение недействительно</CardTitle>
                        <CardDescription className='text-sm text-red-600'>
                            {session.enrollment.fullName}, срок действия вашего приглашения истёк
                            {expiresAt && expiresAt !== '—' ? ` ${expiresAt}.` : '.'} Обратитесь к организатору за новой ссылкой.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className='flex flex-col gap-3 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between'>
                    <span className='text-xs sm:max-w-[60%]'>Если вы считаете, что это ошибка, обновите страницу или запросите повторное приглашение.</span>
                    <Button variant='outline' className='gap-2' onClick={onRetry}>
                        <RefreshCcw className='h-4 w-4' />
                        Обновить
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

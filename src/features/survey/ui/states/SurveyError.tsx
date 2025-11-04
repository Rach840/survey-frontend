import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/shared";
import {AlertCircle, RefreshCcw} from "lucide-react";
import {QueryObserverResult, RefetchOptions} from "@tanstack/query-core";
import {PublicSurveySession} from "@/entities/public-survey";

export function SurveyError({error, refetch}: {error: Error | null, refetch:(options?: RefetchOptions) => Promise<QueryObserverResult<PublicSurveySession, Error>>} ) {
    const message =
        (error as Error & { status?: number })?.status === 401
            ? 'Ссылка недействительна или срок действия приглашения истёк.'
            : (error instanceof Error && error.message) || 'Не удалось загрузить анкету.'
    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
            <Card className='max-w-lg border-red-200 bg-red-50'>
                <CardHeader className='flex items-start gap-2'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <div>
                        <CardTitle className='text-red-700'>Ошибка загрузки анкеты</CardTitle>
                        <CardDescription className='text-red-600'>{message}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button variant='outline' className='gap-2' onClick={() => refetch()}>
                        <RefreshCcw className='h-4 w-4' />
                        Попробовать снова
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
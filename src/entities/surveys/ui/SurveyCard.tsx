import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/shared";
import Link from "next/link";
import {BarChart3, FileSpreadsheet, Pencil, Users} from "lucide-react";
import {SurveyDetail} from "@/entities/surveys/types";

export default function SurveyCard({survey}: {survey: SurveyDetail, tone:number, completionRate: number}){
    return (
        <Card key={survey.id} className='overflow-hidden border border-slate-200 shadow-sm transition-colors hover:border-slate-300'>
            <CardHeader className='border-b pb-6'>
                <div className='flex items-start justify-between gap-3 text-sm'>
                    {/*<span className={`rounded-full px-3 py-1 font-medium ${tone}`}>{survey.statusLabel}</span>*/}
                    {/*<span className='text-xs text-gray-500'>Обновлено {survey.updatedAt}</span>*/}
                </div>
                <CardTitle className='text-xl text-gray-900'>{survey.title}</CardTitle>
                <CardDescription className='text-gray-600'>{survey.description}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 py-6'>
                <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                    <div>
                        <span className='text-xs uppercase tracking-wide text-gray-500'>Приглашено</span>
                        {/*<div className='text-lg font-semibold text-gray-900'>{survey.metrics.invited}</div>*/}
                    </div>
                    <div>
                        <span className='text-xs uppercase tracking-wide text-gray-500'>Активно</span>
                        {/*<div className='text-lg font-semibold text-gray-900'>{survey.metrics.inProgress}</div>*/}
                    </div>
                    <div>
                        <span className='text-xs uppercase tracking-wide text-gray-500'>Завершили</span>
                        {/*<div className='text-lg font-semibold text-gray-900'>{survey.metrics.submitted}</div>*/}
                    </div>
                    <div>
                        <span className='text-xs uppercase tracking-wide text-gray-500'>Ответственный</span>
                        {/*<div className='text-lg font-semibold text-gray-900'>{survey.owner}</div>*/}
                    </div>
                </div>

                <div>
                    <div className='mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-gray-500'>
                        <span>Прогресс</span>
                        {/*<span>{completionRate}%</span>*/}
                    </div>
                    <div className='h-2 rounded-full bg-slate-200'>
                        {/*<div*/}
                        {/*    className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'*/}
                        {/*    style={{ width: `${completionRate}%` }}*/}
                        {/*/>*/}
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-3'>
                    <div className="grid grid-cols-2 gap-x-2">
                        <Link href={`/admin/survey/${survey.id}`}>
                            <Button variant={"secondary"} className='gap-2 w-full'>
                                <BarChart3 className='h-4 w-4' />
                                Статистика
                            </Button>
                        </Link>
                        <Link href={`/admin/survey/${survey.id}?edit=true`}>
                            <Button variant={"secondary"} className='gap-2 w-full'>
                                <Pencil className='h-4 w-4' />
                                Редактировать
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                    <Link href={`/admin/survey/${survey.id}/results`}>
                        <Button variant={"secondary"} className='gap-2 w-full'>
                            <FileSpreadsheet className='h-4 w-4' />
                            Результаты
                        </Button>
                    </Link>
                    <Link href={`/admin/survey/${survey.id}/participants`}>
                        <Button variant={"secondary"} className='gap-2 w-full'>
                            <Users className='h-4 w-4' />
                            Участники
                        </Button>
                    </Link>
                </div>
                </div>

            </CardContent>
        </Card>
    )
}
import {useMemo} from "react";
import {defaultStats, formatNumber, MetricCard, normalizePercentage} from "@/shared";
import {SurveyResult} from "@/entities/surveys/types";

export function Metrics({stats,nextExpirationDisplay,expiringSoon}: {stats:SurveyResult,nextExpirationDisplay?:string,expiringSoon?: number  }) {
    const metrics = useMemo(() => createMetrics(stats), [stats])
    return (
        <>
            {metrics.map((metric) => (
                <div
                    key={metric.label}
                    className='rounded-xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm'
                >
                    <div className='text-xs uppercase tracking-wide text-gray-500'>{metric.label}</div>
                    <div className='mt-2 text-2xl font-semibold text-gray-900'>{metric.value}</div>
                    {typeof metric.percentage === 'number' ? (
                        <div className='mt-3 h-2 rounded-full bg-gray-200'>
                            <div
                                className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'
                                style={{ width: `${metric.percentage}%` }}
                            />
                        </div>
                    ) : null}
                </div>
                ))}
            {nextExpirationDisplay ? (
                <div
                    key={"Состояние приглашений"}
                    className='rounded-xl border space-y-3 border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm'
                >
                    <div className='text-xs uppercase tracking-wide text-gray-500'>Состояние приглашений</div>
                    <div className="grid grid-cols-2">
                        <div>
                            <div className='text-xs uppercase tracking-wide text-gray-500'>Истекают скоро</div>
                            <div className='mt-1 text-xl text-gray-900'>{expiringSoon}</div>
                        </div>
                        <div>
                            <div className='text-xs uppercase tracking-wide text-gray-500'>Ближайшее истечение</div>
                            <div className='mt-1 text-xl text-gray-900'>{nextExpirationDisplay}</div>
                        </div>
                    </div>
                </div>
            ) : ''}

        </>

    )

}

export function createMetrics(result?: SurveyResult): MetricCard[] {
    const stats = result?.statistics ?? defaultStats
    const overall = normalizePercentage(stats.overall_progress)

    return [
        { label: 'Всего приглашений', value: formatNumber(stats.total_enrollments) },
        { label: 'Начали заполнение', value: formatNumber(stats.responses_started) },
        { label: 'В процессе', value: formatNumber(stats.responses_in_progress) },
        { label: 'Завершили', value: formatNumber(stats.responses_submitted) },
        { label: 'Общий прогресс', value: `${overall}%`, percentage: overall },
    ]
}


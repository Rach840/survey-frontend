"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Skeleton } from "@/shared/ui/skeleton"
import { useSurveyDetail } from "@/entities/surveys/model/surveyDetailQuery"
import { useSurveyUpdate } from "@/features/survey/update-survey"
import type { SurveyParticipant, SurveyStatus } from "@/entities/surveys/types"
import { toast } from "sonner"
import { ArrowLeft, Edit3, RefreshCcw } from "lucide-react"

const statusLabels: Record<SurveyStatus, string> = {
  draft: "Черновик",
  open: "Открыта",
  closed: "Закрыта",
  archived: "Архив",
}

const statusTone: Record<SurveyStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-700",
}

const enrollmentLabels: Record<string, string> = {
  invited: "Приглашён",
  pending: "Ожидает",
  approved: "Одобрен",
  active: "Активен",
  rejected: "Отклонён",
  removed: "Удалён",
  expired: "Истёк",
}

const responseLabels: Record<string, string> = {
  in_progress: "В процессе",
  submitted: "Завершено",
}

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatDateTime(value?: string | null) {
  if (!value) return "—"
  try {
    return dateTimeFormatter.format(new Date(value))
  } catch {
    return value
  }
}

function toInputDateTime(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseDateTime(value: string) {
  if (!value) return null
  const iso = new Date(value)
  if (Number.isNaN(iso.getTime())) return null
  return iso.toISOString()
}

type EditFormState = {
  title: string
  description: string
  status: SurveyStatus
  maxParticipants: string
  startsAt: string
  endsAt: string
}

const defaultStats = {
  invited: 0,
  pending: 0,
  active: 0,
  inProgress: 0,
  submitted: 0,
  expired: 0,
}

export  default  function SurveyDetailPage({
  surveyId,
  autoOpenEdit = false,
}: {
  surveyId: string
  autoOpenEdit?: boolean
}) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)
  const { mutateAsync, isPending } = useSurveyUpdate(surveyId)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<EditFormState | null>(null)

  useEffect(() => {
    if (!data) return
    setForm({
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      maxParticipants: data.maxParticipants ? String(data.maxParticipants) : "",
      startsAt: toInputDateTime(data.startsAt),
      endsAt: toInputDateTime(data.endsAt),
    })
  }, [data])

  useEffect(() => {
    if (!autoOpenEdit || !data) return
    setEditOpen(true)
  }, [autoOpenEdit, data])

  const stats = data?.stats ?? defaultStats
  const participantRows = data?.participants ?? []

  const metrics = useMemo(
    () => [
      { label: "Приглашено", value: stats.invited },
      { label: "Активно", value: stats.active },
      { label: "В процессе", value: stats.inProgress },
      { label: "Завершено", value: stats.submitted },
      { label: "Ожидание", value: stats.pending },
      { label: "Истекло", value: stats.expired },
    ],
    [stats],
  )

  const completionRate = useMemo(() => {
    if (!stats.invited) return 0
    return Math.round((stats.submitted / stats.invited) * 100)
  }, [stats])

  const handleChange = <K extends keyof EditFormState,>(key: K, value: EditFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      status: form.status,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      startsAt: parseDateTime(form.startsAt),
      endsAt: parseDateTime(form.endsAt),
    }

    if (payload.maxParticipants !== null && Number.isNaN(payload.maxParticipants)) {
      toast.error("Введите корректное число участников")
      return
    }

    try {
      await mutateAsync(payload)
      toast.success("Анкета обновлена")
      setEditOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Не удалось сохранить изменения")
    }
  }

  const renderParticipantRow = (participant: SurveyParticipant) => {
    const enrollmentLabel = enrollmentLabels[participant.state] ?? participant.state
    const responseLabel = participant.responseState ? responseLabels[participant.responseState] ?? participant.responseState : "—"
    const progress = Math.max(0, Math.min(100, participant.progress))

    return (
      <tr key={participant.id} className="border-b last:border-b-0">
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900">{participant.fullName}</div>
          <div className="text-sm text-gray-500">{participant.source === "bot" ? "Бот" : "Админ"}</div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {participant.email ?? "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{enrollmentLabel}</span>
            <span className="text-gray-500">{responseLabel}</span>
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="mb-1 text-sm font-medium text-gray-900">{progress}%</div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" style={{ width: `${progress}%` }} />
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          <div>Последнее: {formatDateTime(participant.lastActivity)}</div>
          <div className="text-xs text-gray-500">Отправлено: {formatDateTime(participant.submittedAt)}</div>
        </td>
      </tr>
    )
  }

  const renderContent = () => {
    if (isLoading || !data || !form) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      )
    }

    return (
      <>
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone[data.status]}`}>
                  {statusLabels[data.status]}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {data.mode === "bot" ? "Режим бота" : "Ручной режим"}
                </span>
              </div>
              <CardTitle className="text-2xl">{data.title}</CardTitle>
              <p className="max-w-3xl text-sm text-gray-600">{data.description || "Описание отсутствует"}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Версия шаблона: {data.snapshot_version}</span>
                {data.templateTitle ? <span>Шаблон: {data.templateTitle}</span> : null}
                <span>Создано: {formatDateTime(data.createdAt)}</span>
                <span>Ограничение: {data.maxParticipants ?? "—"}</span>
                <span>Старт: {formatDateTime(data.startsAt)}</span>
                <span>Завершение: {formatDateTime(data.endsAt)}</span>
              </div>
            </div>
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Редактировать
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col" side="right">
                <SheetHeader>
                  <SheetTitle>Редактирование анкеты</SheetTitle>
                  <SheetDescription>
                    Обновите основные параметры. Изменения сохранятся сразу после подтверждения.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="survey-title">
                      Название
                    </label>
                    <Input
                      id="survey-title"
                      value={form.title}
                      onChange={(event) => handleChange("title", event.target.value)}
                      placeholder="Название анкеты"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="survey-description">
                      Описание
                    </label>
                    <Textarea
                      id="survey-description"
                      value={form.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                      placeholder="Краткое описание анкеты"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Статус</label>
                    <Select value={form.status} onValueChange={(value: SurveyStatus) => handleChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusLabels) as SurveyStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="survey-max">
                      Максимум участников
                    </label>
                    <Input
                      id="survey-max"
                      type="number"
                      min={1}
                      value={form.maxParticipants}
                      onChange={(event) => handleChange("maxParticipants", event.target.value)}
                      placeholder="Не ограничено"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="survey-start">
                        Дата начала
                      </label>
                      <Input
                        id="survey-start"
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(event) => handleChange("startsAt", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="survey-end">
                        Дата завершения
                      </label>
                      <Input
                        id="survey-end"
                        type="datetime-local"
                        value={form.endsAt}
                        onChange={(event) => handleChange("endsAt", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button onClick={handleSave} disabled={isPending} className="w-full gap-2">
                    {isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                    {isPending ? "Сохранение..." : "Сохранить"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">{metric.label}</div>
                <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-500">Процент завершения</div>
              <div className="text-2xl font-semibold text-gray-900">{completionRate}%</div>
              <div className="mt-3 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Участники и прогресс</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {participantRows.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">Пока нет участников для отображения</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50 text-sm font-medium text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Участник</th>
                      <th className="px-4 py-3">Контакты</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">Прогресс</th>
                      <th className="px-4 py-3">Активность</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participantRows.map((participant) => renderParticipantRow(participant))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/survey" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Назад к списку
        </Link>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold text-red-700">Не удалось загрузить данные</span>
              <p className="text-sm text-red-600">Попробуйте обновить страницу или повторить попытку позже.</p>
              <div>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RefreshCcw className="h-4 w-4" /> Повторить запрос
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">{renderContent()}</div>
      )}
    </div>
  )
}

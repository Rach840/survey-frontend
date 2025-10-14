"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { Separator } from "@/shared/ui/separator"
import { useTemplateDetail } from "@/entities/templates/model/templateDetailQuery"
import { sectionsToDynamicForm } from "@/entities/templates/lib/toDynamicForm"
import { GeneratedForm } from "@/features/template/generated"
import type { Template, TemplateSection } from "@/entities/templates/types"
import { RefreshCcw, ArrowLeft, Eye, EyeOff } from "lucide-react"

const variantLabels: Record<TemplateVariant, string> = {
  published: "Опубликованная версия",
  draft: "Черновик",
}

type TemplateVariant = "published" | "draft"

type TemplatePreviewPageProps = {
  templateId: string
}

type MaybeSections = TemplateSection[] | null | undefined

function hasSections(sections: MaybeSections): sections is TemplateSection[] {
  return Array.isArray(sections) && sections.length > 0
}

function getSectionCount(sections?: Template["draft_schema_json"] | null) {
  if (!sections) return 0
  return sections.length
}

function getFieldsCount(sections?: Template["draft_schema_json"] | null) {
  if (!sections) return 0
  return sections.reduce((acc, section) => acc + section.fields.length, 0)
}

export function TemplatePreviewPage({ templateId }: TemplatePreviewPageProps) {
  const { data, isLoading, isError, refetch } = useTemplateDetail(templateId)
  const [variant, setVariant] = useState<TemplateVariant>("draft")
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!data || initialized) return
    const hasPublished = hasSections(data.published_schema_json)
    setVariant(hasPublished ? "published" : "draft")
    setInitialized(true)
  }, [data, initialized])

  const activeSections = useMemo<MaybeSections>(() => {
    if (!data) return null
    if (variant === "published" && hasSections(data.published_schema_json)) {
      return data.published_schema_json
    }
    return data.draft_schema_json
  }, [data, variant])

  const formSchema = useMemo(() => {
    if (!data || !activeSections || !hasSections(activeSections)) return null
    const titleSuffix = variant === "draft" ? "(черновик)" : ""
    return sectionsToDynamicForm(`${data.title} ${titleSuffix}`.trim(), activeSections)
  }, [data, activeSections, variant])

  const isSchemaEmpty = !isLoading && (!activeSections || !hasSections(activeSections))

  const metaItems = useMemo(() => {
    if (!data) return []
    return [
      { label: "Версия", value: data.version },
      { label: "Состояние", value: data.status === "draft" ? "Черновик" : "Опубликован" },
      { label: "Обновлён", value: new Date(data.updated_at).toLocaleString() },
      { label: "Опубликован", value: data.published_at ? new Date(data.published_at).toLocaleString() : "—" },
      {
        label: "Секции",
        value: getSectionCount(activeSections ?? data.draft_schema_json),
      },
      {
        label: "Поля",
        value: getFieldsCount(activeSections ?? data.draft_schema_json),
      },
    ]
  }, [data, activeSections])

  const renderSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-[520px] w-full" />
    </div>
  )

  if (isError) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Не удалось загрузить шаблон</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">Проверьте соединение с сервером и попробуйте снова.</p>
            <Button variant="outline" className="gap-2" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" /> Повторить запрос
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/templates" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Назад к шаблонам
        </Link>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading || !data ? (
        renderSkeleton()
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 font-medium ${
                      variant === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {variantLabels[variant]}
                  </span>
                  {variant === "draft" && hasSections(data.published_schema_json) ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                      Опубликованная версия доступна
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-2xl">{data.title}</CardTitle>
                <p className="max-w-3xl text-sm text-gray-600">{data.description || "Описание не задано"}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {metaItems.map((item) => (
                    <span key={item.label} className="flex items-center gap-1">
                      <strong className="font-medium text-gray-700">{item.label}:</strong>
                      {item.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2">
                <Link href={`/admin/templates/${templateId}/edit`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]">
                    Изменить шаблон
                  </Button>
                </Link>
                <Button
                  variant={variant === "published" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setVariant("published")}
                  disabled={!hasSections(data.published_schema_json)}
                >
                  <Eye className="h-4 w-4" /> Опубликованная версия
                </Button>
                <Button
                  variant={variant === "draft" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setVariant("draft")}
                >
                  <EyeOff className="h-4 w-4" /> Черновая версия
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card className={'p-2'}>
            <CardHeader className={"block"}>
              <CardTitle className={'text-2xl text-center mb-0' }>Структура шаблона</CardTitle>
            </CardHeader>
          </Card>
              {isSchemaEmpty ? (
                <div className="rounded-md border border-dashed border-gray-200  text-center text-sm text-gray-500">
                  В выбранной версии пока нет секций. Добавьте поля в редакторе, чтобы увидеть предпросмотр.
                </div>
              ) : formSchema ? (
                <GeneratedForm schema={formSchema} onSubmit={() => undefined} />
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-[420px] w-full" />
                </div>
              )}

        </div>
      )}

      <Separator className="my-8" />
    </div>
  )
}

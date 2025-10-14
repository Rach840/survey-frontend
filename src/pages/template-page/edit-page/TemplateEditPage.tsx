"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { TemplateDesigner, mapTemplateToDesigner, TemplateUpsertPayload } from "@/features/template/designer"
import { useTemplateDetail } from "@/entities/templates/model/templateDetailQuery"
import { useTemplateUpdate } from "@/features/template/update-template"
import { Skeleton } from "@/shared/ui/skeleton"
import { Button } from "@/shared/ui/button"
import { toast } from "sonner"

export function TemplateEditPage({ templateId }: { templateId: string }) {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useTemplateDetail(templateId)
  const { mutateAsync, isPending } = useTemplateUpdate(templateId)

  const handleSubmit = useCallback(
    async (payload: TemplateUpsertPayload) => {
      await mutateAsync({
        title: payload.title,
        description: payload.description,
        version: payload.version,
        sections: JSON.stringify(payload.sections),
      })
      toast.success("Шаблон обновлён")
      router.refresh()
    },
    [mutateAsync, router],
  )

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="mt-4 h-[600px] w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          <p className="mb-4">Не удалось загрузить шаблон. Попробуйте снова выполнить запрос.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TemplateDesigner
      initialTemplate={mapTemplateToDesigner(data)}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Сохранить изменения"
      headerTitle="Редактирование шаблона"
      headerSubtitle="Обновите структуры и поля опубликованного шаблона"
    />
  )
}

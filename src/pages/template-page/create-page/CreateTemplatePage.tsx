"use client"

import { TemplateDesigner, TemplateUpsertPayload } from "@/features/template/designer"
import { useTemplateCreate } from "@/features/template/create-template/model"
import { toast } from "sonner"

export function CreateTemplatePage() {
  const { mutateAsync, isPending } = useTemplateCreate()

  const handleSubmit = async (payload: TemplateUpsertPayload) => {
    await mutateAsync({
      title: payload.title,
      description: payload.description,
      version: payload.version,
      sections: JSON.stringify(payload.sections),
    })
    toast.success("Шаблон сохранён")
  }

  return (
    <TemplateDesigner
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Создать шаблон"
      headerTitle="Конструктор шаблона анкеты"
      headerSubtitle="Создайте структуру анкеты с секциями и полями"
    />
  )
}

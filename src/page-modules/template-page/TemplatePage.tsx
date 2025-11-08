"use client"

import {Button} from "@/shared/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/shared/ui/card"
import {Skeleton} from "@/shared/ui/skeleton"
import {Plus} from "lucide-react"
import Link from "next/link"
import {useTemplatesByMe} from "@/entities/templates/model/templateQuery"
import type {Template, TemplateSection} from "@/entities/templates/types"

export default function TemplatesPage() {
  const { data, isLoading } = useTemplatesByMe()

  const skeletonCards = Array.from({ length: 3 }, (_, index) => (
    <Card key={index}>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  ))

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Шаблоны анкет</h1>
          <p className="text-gray-600">Создавайте и управляйте шаблонами для анкет</p>
        </div>
        <Link href="/(private)/questioner/templates/create">
          <Button className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]">
            <Plus className="mr-2 h-4 w-4" />
            Создать шаблон
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? skeletonCards
          : (data ?? []).map((template: Template) => {
              const sections = template.draft_schema_json
              const fieldsTotal = sections.reduce(
                (acc: number, section: TemplateSection) => acc + section.fields.length,
                0,
              )
              return (
                <Card key={template.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Последнее обновление: {new Date(template.updated_at).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{template.description || "Описание отсутствует"}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{sections.length} секций</span>
                      <span>{fieldsTotal} полей</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Создан: {template.published_at ? new Date(template.published_at).toLocaleString() : "—"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/questioner/templates/${template.id}/edit`} className="flex-1">
                      <Button variant="secondary" className="w-full bg-transparent">
                        Редактировать
                      </Button>
                    </Link>
                    <Link href={`/questioner/templates/${template.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]">
                        Открыть
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
      </div>
    </div>
  )
}

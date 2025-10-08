"use client"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import {templates} from "@/entities/templates/model/templates";


export function TemplatesPage() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Шаблоны анкет</h1>
                    <p className="text-gray-600">Создавайте и управляйте шаблонами для анкет</p>
                </div>
                <Link href="/templates/create">
                    <Button className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]">
                        <Plus className="w-4 h-4 mr-2" />
                        Создать шаблон
                    </Button>
                </Link>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.title}</h3>
                            <p className="text-gray-600 mb-4">{template.description}</p>

                            <div className="flex gap-4 mb-4 text-sm text-gray-500">
                                <span>{template.sections} секций</span>
                                <span>{template.fields} полей</span>
                            </div>

                            <div className="text-xs text-gray-400 mb-4">Создан: {template.createdAt}</div>

                            <div className="flex gap-2">
                                <Link href={`/templates/create`} className="flex-1">
                                    <Button variant="outline" className="w-full bg-transparent">
                                        Редактировать
                                    </Button>
                                </Link>
                                <Link href="/survey/create">
                                    <Button variant="outline" size="icon" title="Создать анкету из шаблона">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

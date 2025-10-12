'use client'
import {Card, CardContent} from "@/shared/ui/card";
import {Button} from "@/shared/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/ui/select";
import {surveys} from "@/entities/surveys/model/surveys";
import {Clock, MessageSquare, Plus} from "lucide-react";
import Link from "next/link";
import {Input} from "@/shared/ui/input";
import {useMeQuery} from "@/entities/user/model/meQuery";

export function SurveyPage() {

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Анкеты для заполнения</h1>
                <p className="text-gray-600">Выберите анкету для заполнения или продолжите начатую</p>
            </div>

            {/* Filters */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
                        <Button variant="link" className="text-[#2563eb] p-0 h-auto">
                            Сбросить все
                        </Button>
                    </div>
                    <div className="flex gap-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Все статусы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="not_started">Не начато</SelectItem>
                                <SelectItem value="in_progress">В процессе</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="date">
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="По дате создания" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">По дате создания</SelectItem>
                                <SelectItem value="name">По названию</SelectItem>
                                <SelectItem value="status">По статусу</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex-1">
                            <Input placeholder="Поиск анкет..." className="w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Survey Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.map((survey) => (
                    <Card key={survey.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        survey.status === "not_started"
                            ? "bg-red-50 text-red-600"
                            : survey.status === "in_progress"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-green-50 text-green-600"
                    }`}
                >
                  {survey.statusLabel}
                </span>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">{survey.endDate}</div>
                                    <div className="text-sm font-medium text-gray-900">{survey.date}</div>
                                </div>
                            </div>

                            {/* Title and Description */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{survey.title}</h3>
                            <p className="text-gray-600 mb-4">{survey.description}</p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{survey.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{survey.questions}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            survey.status === "not_started"
                                                ? "bg-gray-300"
                                                : survey.status === "in_progress"
                                                    ? "bg-yellow-400"
                                                    : "bg-green-500"
                                        }`}
                                        style={{ width: `${survey.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button
                                className={`w-full ${
                                    survey.status === "completed"
                                        ? "bg-gray-400 hover:bg-gray-500"
                                        : "bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]"
                                }`}
                                disabled={survey.status === "completed"}
                            >
                                {survey.buttonText}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Floating Action Button */}
            <Link href="/survey/create">
                <Button
                    size="lg"
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e3] hover:to-[#9333ea]"
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </Link>
        </div>
    )
}
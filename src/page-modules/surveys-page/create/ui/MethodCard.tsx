import {UseFormReturn} from "react-hook-form";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/shared";
import {Bot, Plus, Trash2, Users} from "lucide-react";
import {SurveyInput, SurveyOutput} from "@/pages/surveys-page/create/schema/create-schema";
import {RHFContext} from "@/pages/surveys-page/create/ui/CreatePage";

export interface Participant {
    id: string
    email: string
    firstName: string
    lastName: string
}
interface MethodCardProps {
    form:UseFormReturn<SurveyInput, RHFContext, SurveyOutput>,
    participants: Participant[],
    maxParticipants: number,
    setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>,
    setMaxParticipants: React.Dispatch<React.SetStateAction<number>>,
}
export function MethodCard({form,maxParticipants, participants, setParticipants,setMaxParticipants}:MethodCardProps
) {
    const addParticipant = () => {
        const newParticipant: Participant = {
            id: Date.now().toString(),
            email: "",
            firstName: "",
            lastName: "",
        }
        setParticipants([...participants, newParticipant])
    }


    const removeParticipant = (id: string) => {
        setParticipants(participants.filter((p) => p.id !== id))
    }

    const updateParticipant = (id: string, field: keyof Participant, value: string) => {
        setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    }

    return (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle>Приглашения участников</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs  onValueChange={(v) => form.setValue('invitationMode',v as "admin" | "bot")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Ручное добавление
                    </TabsTrigger>
                    <TabsTrigger value="bot" className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Режим &quot;Бот&quot;
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Добавьте участников вручную, указав их email и имя. Каждый участник получит персональное приглашение.
                    </p>

                    {participants.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
                            <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-4">Участники еще не добавлены</p>
                            <Button onClick={addParticipant} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить первого участника
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {participants.map((participant: Participant, index:number) => (
                                <Card key={participant.id} className="bg-gray-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="text-sm font-medium text-gray-700">Участник {index + 1}</span>
                                            <Button variant="ghost" size="icon" onClick={() => removeParticipant(participant.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={participant.email}
                                                    onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <Label>Имя</Label>
                                                <Input
                                                    value={participant.firstName}
                                                    onChange={(e) => updateParticipant(participant.id, "firstName", e.target.value)}
                                                    placeholder="Иван"
                                                />
                                            </div>
                                            <div>
                                                <Label>Фамилия</Label>
                                                <Input
                                                    value={participant.lastName}
                                                    onChange={(e) => updateParticipant(participant.id, "lastName", e.target.value)}
                                                    placeholder="Иванов"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button onClick={addParticipant} variant="outline" className="w-full ">
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить участника
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bot" className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex gap-3">
                            <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Режим &quot;Бот&quot;</h4>
                                <p className="text-sm text-blue-800">
                                    В этом режиме система автоматически создаст уникальные ссылки для указанного количества
                                    участников. Участники смогут заполнить анкету по ссылке без предварительной регистрации.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="maxParticipants">Максимальное количество участников</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Input
                                id="maxParticipants"
                                type="number"
                                min="1"
                                max="1000"
                                value={maxParticipants}
                                onChange={(e) => setMaxParticipants(Number.parseInt(e.target.value) || 1)}
                                className="w-32"
                            />
                            <span className="text-sm text-gray-600">участников</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Будет создано {maxParticipants} уникальных ссылок для заполнения анкеты
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Что произойдет после создания:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Система сгенерирует {maxParticipants} уникальных ссылок</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Каждая ссылка может быть использована только один раз</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Вы сможете скачать список ссылок или отправить их участникам</span>
                            </li>
                        </ul>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>

)
}
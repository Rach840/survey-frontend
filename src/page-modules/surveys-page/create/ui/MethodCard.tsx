import {useId} from 'react'
import {UseFormReturn} from 'react-hook-form'
import {toast} from 'sonner'
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
  TabsTrigger,
} from '@/shared'
import {Bot, Download, Plus, Trash2, Upload, Users} from 'lucide-react'
import {SurveyInput, SurveyOutput} from '@/pages/surveys-page/create/schema/create-schema'
import {loadXlsx} from '@/shared/lib/loadXlsx'

export interface Participant {
  id: string
  email: string
  firstName: string
  lastName: string
}
interface MethodCardProps {
  form: UseFormReturn<SurveyInput, Record<string, never>, SurveyOutput>
  participants: Participant[]
  maxParticipants: number
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>
  setMaxParticipants: React.Dispatch<React.SetStateAction<number>>
}

const makeParticipant = (): Participant => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
  email: '',
  firstName: '',
  lastName: '',
})

export function MethodCard({ form, maxParticipants, participants, setParticipants, setMaxParticipants }: MethodCardProps) {
  const inputId = useId()

  const addParticipant = () => {
    setParticipants((prev) => [...prev, makeParticipant()])
  }

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleImportChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const XLSX = await loadXlsx()
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]

      if (!sheet) {
        throw new Error('Не удалось прочитать первый лист в файле')
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      const imported = rows
        .map((row, index) => {
          const email = String(row.email ?? row.Email ?? row['E-mail'] ?? '').trim()
          if (!email) return null
          const firstName = String(row.firstName ?? row['First Name'] ?? row['Имя'] ?? '').trim()
          const lastName = String(row.lastName ?? row['Last Name'] ?? row['Фамилия'] ?? '').trim()
          return {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `import-${index}-${Date.now()}`,
            email,
            firstName,
            lastName,
          }
        })
        .filter((item): item is Participant => Boolean(item))

      if (!imported.length) {
        throw new Error('Не найдено строк с email')
      }

      setParticipants(imported)
      toast.success(`Импортировано участников: ${imported.length}`)
    } catch (error) {
      console.error('participants import failed', error)
      toast.error(error instanceof Error ? error.message : 'Не удалось импортировать участников')
    } finally {
      event.target.value = ''
    }
  }

  const handleExportTemplate = async () => {
    try {
      const XLSX = await loadXlsx()
      const data = participants.length
        ? participants
        : [
            { email: 'user@example.com', firstName: 'Иван', lastName: 'Иванов' },
            { email: 'user2@example.com', firstName: 'Мария', lastName: 'Петрова' },
          ]

      const worksheet = XLSX.utils.json_to_sheet(
        data.map(({ email, firstName, lastName }, index) => ({
          index: index + 1,
          email,
          firstName,
          lastName,
        })),
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Участники')
      XLSX.writeFile(workbook, 'список участников.xlsx')
    } catch (error) {
      console.error('participants export-survey failed', error)
      toast.error('Не удалось сформировать файл-шаблон')
    }
  }

  return (
    <Card className='mb-6 border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
      <CardHeader>
        <CardTitle>Приглашения участников</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs onValueChange={(v) => form.setValue('invitationMode', v as 'admin' | 'bot')}>
          <TabsList className='grid w-full grid-cols-2 mb-6'>
            <TabsTrigger value='admin' className='flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Ручное добавление
            </TabsTrigger>
            <TabsTrigger value='bot' className='flex items-center gap-2'>
              <Bot className='w-4 h-4' />
              Режим &quot;Бот&quot;
            </TabsTrigger>
          </TabsList>

          <TabsContent value='admin' className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Добавьте участников вручную или импортируйте Excel-файл с колонками <strong>email</strong>, <strong>firstName</strong>, <strong>lastName</strong>.
            </p>

            <div className='flex flex-wrap items-center gap-3'>
              <input
                id={inputId}
                type='file'
                accept='.xlsx,.xls'
                className='hidden'
                onChange={handleImportChange}
              />
              <Button variant='outline' className='gap-2' onClick={() => document.getElementById(inputId)?.click()}>
                <Upload className='h-4 w-4' />
                Импортировать Excel
              </Button>
              <Button variant='ghost' className='gap-2 text-slate-600 hover:text-slate-900' onClick={handleExportTemplate}>
                <Download className='h-4 w-4' />
                Скачать шаблон
              </Button>
            </div>

            {participants.length === 0 ? (
              <div className='text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8'>
                <Users className='mx-auto mb-2 h-12 w-12 text-slate-400' />
                <p className='mb-4 text-slate-600'>Участники еще не добавлены</p>
                <Button onClick={addParticipant} variant='outline'>
                  <Plus className='mr-2 h-4 w-4' />
                  Добавить первого участника
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {participants.map((participant, index) => (
                  <Card key={participant.id} className='bg-slate-50'>
                    <CardContent className='pt-6'>
                      <div className='mb-4 flex items-start justify-between'>
                        <span className='text-sm font-medium text-slate-700'>Участник {index + 1}</span>
                        <Button variant='ghost' size='icon' onClick={() => removeParticipant(participant.id)}>
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type='email'
                            value={participant.email}
                            onChange={(event) => updateParticipant(participant.id, 'email', event.target.value)}
                            placeholder='email@example.com'
                          />
                        </div>
                        <div>
                          <Label>Имя</Label>
                          <Input
                            value={participant.firstName}
                            onChange={(event) => updateParticipant(participant.id, 'firstName', event.target.value)}
                            placeholder='Иван'
                          />
                        </div>
                        <div>
                          <Label>Фамилия</Label>
                          <Input
                            value={participant.lastName}
                            onChange={(event) => updateParticipant(participant.id, 'lastName', event.target.value)}
                            placeholder='Иванов'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addParticipant} variant='outline' className='w-full'>
                  <Plus className='mr-2 h-4 w-4' />
                  Добавить участника
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value='bot' className='space-y-4'>
            <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='flex gap-3'>
                <Bot className='h-5 w-5 flex-shrink-0 text-blue-600' />
                <div>
                  <h4 className='mb-1 font-semibold text-blue-900'>Режим &quot;Бот&quot;</h4>
                  <p className='text-sm text-blue-800'>
                    Система автоматически сгенерирует уникальные ссылки для участников. Ограничьте количество приглашений,
                    чтобы контролировать выдачу.
                  </p>
                </div>
              </div>
            </div>

            <div className='max-w-md'>
              <Label htmlFor='maxParticipants'>Максимальное количество участников</Label>
              <div className='mt-2 flex items-center gap-4'>
                <Input
                  id='maxParticipants'
                  type='number'
                  min='1'
                  max='1000'
                  value={maxParticipants}
                  onChange={(event) => setMaxParticipants(Number.parseInt(event.target.value, 10) || 1)}
                  className='w-32'
                />
                <span className='text-sm text-gray-600'>участников</span>
              </div>
              <p className='mt-2 text-xs text-gray-500'>Будет создано {maxParticipants} уникальных ссылок</p>
            </div>

            <div className='mt-6 rounded-lg bg-gray-50 p-4'>
              <h4 className='mb-2 font-semibold text-gray-900'>Что произойдет после создания:</h4>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 text-blue-600'>•</span>
                  <span>Система сгенерирует {maxParticipants} уникальных ссылок</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 text-blue-600'>•</span>
                  <span>Каждая ссылка может быть использована только один раз</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 text-blue-600'>•</span>
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

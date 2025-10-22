'use client'

import {useMutation} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import Link from 'next/link'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet, Filter, Plus, Trash2} from 'lucide-react'
import {useSurveyDetail} from '@/entities/surveys/model/surveyDetailQuery'
import type {SurveyParticipant} from '@/entities/surveys/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Input} from '@/shared/ui/input'
import {Skeleton} from '@/shared/ui/skeleton'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/ui/select'
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from '@/shared/ui/sheet'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import {toast} from 'sonner'
import {loadXlsx} from '@/shared/lib/loadXlsx'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'
import {extendEnrollmentToken} from '@/entities/surveys/api/extendEnrollmentToken'
import {addSurveyParticipant} from '@/entities/surveys/api/addSurveyParticipant'
import {removeSurveyParticipant} from '@/entities/surveys/api/removeSurveyParticipant'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/shared/ui/table"
import {CopyButton} from "@/shared/ui/shadcn-io/copy-button";
import {enrollmentLabels, formatDateTime} from "@/shared/lib/";


function getParticipantTokenExpiry(participant?: SurveyParticipant | null) {
  if (!participant) return null
  return participant.expires_at ??  null
}

const DEFAULT_EXTENSION_DAYS = 7
const LONG_EXTENSION_DAYS = 30

function computeExtensionDate(current?: string | null, days = DEFAULT_EXTENSION_DAYS) {
  const now = new Date()
  let base = current ? new Date(current) : now
  if (Number.isNaN(base.getTime())) {
    base = now
  }
  if (base.getTime() < now.getTime()) {
    base = now
  }
  const result = new Date(base.getTime())
  result.setDate(result.getDate() + days)
  return result
}

function toLocalInputValue(date: Date | null) {
  if (!date) return ''
  const pad = (v: number) => v.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalInputValue(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

export default function SurveyParticipantsPage({ surveyId }: { surveyId: string }) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)
  const participants = useMemo<SurveyParticipant[]>(
    () => data?.participants ?? data?.invitations ?? [],
    [data?.participants, data?.invitations],
  )
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [extendTarget, setExtendTarget] = useState<SurveyParticipant | null>(null)
  const [extendValue, setExtendValue] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addFullName, setAddFullName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPhone, setAddPhone] = useState('')

  const addMutation = useMutation({
    mutationFn: async ({ full_name, email, phone }: { full_name: string; email?: string; phone?: string }) =>
      addSurveyParticipant({ surveyId, full_name, email, phone }),
    onSuccess: () => {
      toast.success('Участник добавлен')
      setAddFullName('')
      setAddEmail('')
      setAddPhone('')
      setAddOpen(false)
      refetch()
    },
    onError: () => {
      toast.error('Не удалось добавить участника')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (participantId: number) =>
      removeSurveyParticipant({ surveyId, enrollmentId: String(participantId) }),
    onSuccess: () => {
      toast.success('Участник удалён')
      refetch()
    },
    onError: () => {
      toast.error('Не удалось удалить участника')
    },
  })

  const extendMutation = useMutation({
    mutationFn: async ({ enrollmentId, expiresAt }: { enrollmentId: number; expiresAt: string }) =>
      extendEnrollmentToken({ surveyId, enrollmentId: String(enrollmentId), expiresAt }),
    onSuccess: () => {
      toast.success('Срок действия токена продлён')
      setExtendTarget(null)
      setExtendValue('')
      refetch()
    },
    onError: () => {
      toast.error('Не удалось продлить токен')
    },
  })

  const handleOpenExtend = (participant: SurveyParticipant) => {
    const nextDefault = computeExtensionDate(getParticipantTokenExpiry(participant), DEFAULT_EXTENSION_DAYS)
    setExtendValue(toLocalInputValue(nextDefault))
    setExtendTarget(participant)
  }

  const handleQuickExtend = (days: number) => {
    if (!extendTarget) return
    const nextDefault = computeExtensionDate(getParticipantTokenExpiry(extendTarget), days)
    setExtendValue(toLocalInputValue(nextDefault))
  }

  const handleExtendSubmit = async () => {
    if (!extendTarget) return
    if (!extendValue) {
      toast.error('Укажите новую дату истечения')
      return
    }
    const parsed = fromLocalInputValue(extendValue)
    if (!parsed) {
      toast.error('Некорректная дата истечения')
      return
    }
    try {
      await extendMutation.mutateAsync({
        enrollmentId: extendTarget.enrollment_id,
        expiresAt: parsed.toISOString(),
      })
    } catch {
      // errors handled in mutation callbacks
    }
  }

  const handleOpenAdd = () => {
    setAddFullName('')
    setAddEmail('')
    setAddPhone('')
    setAddOpen(true)
  }

  const handleAddSubmit = async () => {
    const fullName = addFullName.trim()
    const email = addEmail.trim()
    const phone = addPhone.trim()
    if (!fullName) {
      toast.error('Введите имя участника')
      return
    }

    if (!email && !phone) {
      toast.error('Укажите email или телефон участника')
      return
    }

    try {
      await addMutation.mutateAsync({
        full_name: fullName,
        email: email ? email : undefined,
        phone: phone ? phone : undefined,
      })
    } catch (error) {
      console.error('add participant error', error)
    }
  }

  const handleRemoveParticipant = async (participant: SurveyParticipant) => {
    if (!participant.enrollment_id) return

    try {
      await removeMutation.mutateAsync(participant.enrollment_id)
      await refetch()
    } catch (error) {
      console.error('remove participant error', error)
    }
  }

  const handleExport = async () => {
    if (!participants.length) {
      toast.info('Список участников пуст')
      return
    }

    try {
      const XLSX = await loadXlsx()
      const worksheet = XLSX.utils.json_to_sheet(
        participants.map((participant, index) => ({
          "ID": index + 1,
          "ФИО": participant.full_name,
          "Почта": participant.email ?? '',
          "Состояние": participant.state,
        })),
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Участники')
      XLSX.writeFile(workbook, `анкета-${surveyId}-участники.xlsx`)
    } catch (error) {
      console.error('participants export error', error)
      toast.error('Не удалось сформировать файл')
    }
  }

  const filteredParticipants = useMemo(() => {
    if (stateFilter === 'all') {
      return participants
    }
    return participants.filter((participant) => participant.state === stateFilter)
  }, [participants, stateFilter])
  console.log(filteredParticipants)
  if (isLoading) {
    return (
      <div className='min-h-screen  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
        <motion.div
          className='space-y-4'
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={fadeTransition}
        >
          <Skeleton className='h-20 w-full rounded-2xl' />
          <Skeleton className='h-12 w-64 rounded-2xl' />
          <Skeleton className='h-64 w-full rounded-2xl' />
        </motion.div>
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorFetch refetch={refetch} />
  }

  return (
    <div className='min-h-screen  px-4 pb-16 pt-5 sm:px-8 lg:px-12'>
      <motion.div
        className='flex flex-wrap items-center justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href={`/admin/survey/${surveyId}`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к анкете
          </span>
        </Link>
        <div className='flex items-center mb-5  gap-3'>
          <Button className='gap-2' onClick={handleOpenAdd} disabled={addMutation.isPending}>
            <Plus className='h-4 w-4' />
            Добавить
          </Button>
          <Button variant='outline' className='gap-2' onClick={handleExport}>
            <FileSpreadsheet className='h-4 w-4' />
            Экспортировать список
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.05 }}
      >
      <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-2xl font-semibold text-gray-900'>Участники анкеты</CardTitle>
          <CardDescription className='text-gray-600'>Следите за статусами и открывайте карточки для экспорта в PDF.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 py-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='inline-flex items-center gap-2 text-sm text-gray-600'>
              <Filter className='h-4 w-4' />
              Фильтр по статусу
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className='w-[220px]'>
                <SelectValue placeholder='Все статусы' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Все статусы</SelectItem>
                {Object.entries(enrollmentLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stateFilter !== 'all' ? (
              <Button variant='link' className='h-auto px-0 text-[#2563eb]' onClick={() => setStateFilter('all')}>
                Сбросить фильтр
              </Button>
            ) : null}
          </div>

          {filteredParticipants.length === 0 ? (
            <div className='rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-gray-500'>
              Участники пока не найдены.
            </div>
          ) : (
              <Table className={'min-w-full divide-y divide-gray-200 text-left'}>
                <TableHeader className={''}>
                  <TableRow className={''}>
                    <TableHead className="w-[100px]">Участник</TableHead>
                    <TableHead className={"px-4 py-3"}>Контакты</TableHead>
                    <TableHead className={'px-4 py-3'}>Срок действия</TableHead>
                    <TableHead className="px-4 py-3">Приглашение </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={'divide-y divide-gray-100 text-sm text-gray-700'}>
                  {filteredParticipants.map((participant) => (
                      <TableRow key={participant.enrollment_id} className={'transition-colors hover:bg-slate-50'}>
                        <TableCell className='px-4 py-3'>
                          <div className='font-medium text-gray-900'>{participant.full_name}</div>
                          <div className='text-xs text-gray-500'>Источник: {participant.source === 'bot' ? 'бот' : 'ручной'}</div>
                        </TableCell>
                        <TableCell className='px-4 py-3'>
                          {participant.email ?? '—'}
                        </TableCell>

                        <TableCell className='flex items-center space-x-3 px-4 py-3'>
                          <div className='text-sm font-medium text-gray-900'>{formatDateTime(getParticipantTokenExpiry(participant))}</div>

                          <div className="flex space-x-2 items-center">
                            <Button
                                size='sm'
                                variant='outline'
                                className=''
                                onClick={() => handleOpenExtend(participant)}
                                disabled={extendMutation.isPending}
                            >
                              Продлить
                            </Button>
                            <Button
                                size='icon'
                                variant='ghost'
                                className='text-red-500 hover:text-red-600'
                                onClick={() => handleRemoveParticipant(participant)}
                                disabled={removeMutation.isPending}
                                title='Удалить участника'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                          <TableCell className='px-4 py-3 '>
                          <CopyButton variant={"secondary"}  content={`http://localhost:3000/survey/${participant.token}`}  size={"lg"}  />

                          </TableCell>

                      </TableRow>
                  ))}


                </TableBody>
              </Table>

          )}
        </CardContent>
      </Card>
      </motion.div>
      <Sheet
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) {
            setAddFullName('')
            setAddEmail('')
            setAddPhone('')
          }
        }}
      >
        <SheetContent side='right'>
          <SheetHeader>
            <SheetTitle>Добавление участника</SheetTitle>
            <SheetDescription>Укажите контактную информацию, чтобы выслать приглашение на анкету.</SheetDescription>
          </SheetHeader>
          <div className='flex flex-col gap-4 px-4 pb-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700' htmlFor='add-participant-name'>Имя и фамилия</label>
              <Input
                id='add-participant-name'
                value={addFullName}
                onChange={(event) => setAddFullName(event.target.value)}
                placeholder='Например, Иван Иванов'
                disabled={addMutation.isPending}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700' htmlFor='add-participant-email'>Email</label>
              <Input
                id='add-participant-email'
                type='email'
                value={addEmail}
                onChange={(event) => setAddEmail(event.target.value)}
                placeholder='user@example.com'
                disabled={addMutation.isPending}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700' htmlFor='add-participant-phone'>Телефон (опционально)</label>
              <Input
                id='add-participant-phone'
                value={addPhone}
                onChange={(event) => setAddPhone(event.target.value)}
                placeholder='+7 (900) 000-00-00'
                disabled={addMutation.isPending}
              />
            </div>
          </div>
          <SheetFooter className='mt-auto flex-row justify-end gap-2 p-4'>
            <Button
              variant='outline'
              onClick={() => {
                setAddOpen(false)
                setAddFullName('')
                setAddEmail('')
                setAddPhone('')
              }}
              disabled={addMutation.isPending}
            >
              Отмена
            </Button>
            <Button onClick={handleAddSubmit} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Добавляем…' : 'Добавить участника'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet
        open={Boolean(extendTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setExtendTarget(null)
            setExtendValue('')
          }
        }}
      >
        <SheetContent side='right'>
          <SheetHeader>
            <SheetTitle>Продление токена</SheetTitle>
            <SheetDescription>Установите новую дату истечения приглашения для выбранного участника.</SheetDescription>
          </SheetHeader>
          {extendTarget ? (
            <div className='flex flex-col gap-4 px-4 pb-4'>
              <div className='text-sm text-gray-600'>
                Текущий срок: <span className='font-medium text-gray-900'>{formatDateTime(getParticipantTokenExpiry(extendTarget))}</span>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-700' htmlFor='extend-token-input'>
                  Новая дата истечения
                </label>
                <Input
                  id='extend-token-input'
                  type='datetime-local'
                  value={extendValue}
                  min={toLocalInputValue(new Date())}
                  onChange={(event) => setExtendValue(event.target.value)}
                  disabled={extendMutation.isPending}
                />
                <span className='text-xs text-gray-500'>Выберите дату и время в вашем часовом поясе.</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => handleQuickExtend(DEFAULT_EXTENSION_DAYS)}
                  disabled={extendMutation.isPending}
                >
                  +7 дней
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => handleQuickExtend(LONG_EXTENSION_DAYS)}
                  disabled={extendMutation.isPending}
                >
                  +30 дней
                </Button>
              </div>
            </div>
          ) : null}
          <SheetFooter className='mt-auto flex-row justify-end gap-2 p-4'>
            <Button
              variant='outline'
              onClick={() => {
                setExtendTarget(null)
                setExtendValue('')
              }}
              disabled={extendMutation.isPending}
            >
              Отмена
            </Button>
            <Button onClick={handleExtendSubmit} disabled={!extendTarget || !extendValue || extendMutation.isPending}>
              {extendMutation.isPending ? 'Сохраняем…' : 'Продлить'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

'use client'

import Link from 'next/link'
import {useCallback, useMemo, useRef, useState} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileText, Loader2} from 'lucide-react'

import {useSurveyResult} from '@/entities/surveys/model/surveyResultQuery'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'
import {toast} from 'sonner'
import {ensureCyrillicFont, getPdfFontCss, loadJsPdf} from '@/shared/lib/loadJsPdf'
import {buildSectionDisplays, formatDateTime, helper} from "@/shared/lib";
import {enrollmentLabels, responseLabels} from "@/shared/lib/";


export default function SurveyResultDetailPage({
  surveyId,
  enrollmentId,
}: {
  surveyId: string
  enrollmentId: string
}) {
  const { data, isLoading, isError, refetch } = useSurveyResult(surveyId, enrollmentId)

  const [isExporting, setIsExporting] = useState(false)
  const exportContentRef = useRef<HTMLDivElement>(null)

  const survey = data?.survey
  const enrollment = data?.enrollment
  const response = data?.response
  const answers = useMemo(() => data?.answers ?? [], [data?.answers])

  const formSections = useMemo(() => helper(survey?.form_snapshot_json), [survey?.form_snapshot_json])

  const sectionDisplays = useMemo(() => buildSectionDisplays(formSections, answers), [formSections, answers])

  const handleExport = useCallback(async () => {
    if (!survey || !enrollment || !response) {
      toast.error('Нет данных для экспорта')
      return
    }

    const content = exportContentRef.current

    if (!content) {
      toast.error('Не удалось найти содержимое для экспорта')
      return
    }

    setIsExporting(true)

    let originalDataAttr: string | null = null
    let originalFontFamily = ''
    let originalFontSize = ''
    let originalLineHeight = ''
    let originalMaxWidth = ''
    let originalMargin = ''

    try {
      if (document.fonts) {
        const fontVariants = [
          "400 16px 'LiberationSans'",
          "700 16px 'LiberationSans'",
          "400 16px 'Liberation Sans'",
          "700 16px 'Liberation Sans'",
        ]
        await Promise.allSettled([
          ...fontVariants.map((font) => document.fonts.load(font)),
          document.fonts.ready,
        ])
      }

      const [fontCss, { jsPDF }] = await Promise.all([
        getPdfFontCss(),
        loadJsPdf(),
      ])
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const fontName = await ensureCyrillicFont(doc)
      doc.setFont(fontName, 'normal')
      const pdfFontFamily = "'LiberationSans', 'Liberation Sans', Arial, Helvetica, sans-serif"

      const margin = 40
      const pageWidth = doc.internal.pageSize.getWidth()
      const baseWindowWidth = Math.max(content.scrollWidth, content.offsetWidth, 960)
      const windowWidth = Math.min(baseWindowWidth, 800)
      const filename = `survey-${surveyId}-participant-${enrollment.id}.pdf`

      originalDataAttr = content.getAttribute('data-pdf-export')
      originalFontFamily = content.style.fontFamily
      originalFontSize = content.style.fontSize
      originalLineHeight = content.style.lineHeight
      originalMaxWidth = content.style.maxWidth
      originalMargin = content.style.margin
      content.setAttribute('data-pdf-export', 'true')
      content.style.fontFamily = pdfFontFamily
      content.style.fontSize = '0.95rem'
      content.style.lineHeight = '1.5'
      content.style.maxWidth = '800px'
      content.style.margin = '0 auto'

      await doc.html(content, {
        margin: [0, margin, margin, 0],
        autoPaging: 'text',
        width: pageWidth,
        windowWidth,
        html2canvas: {
          scale: 0.75,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (docClone) => {
            docClone.documentElement.setAttribute('data-pdf-export', 'true')
            docClone.documentElement.style.fontSize = '15px'
            const style = docClone.createElement('style')
            style.setAttribute('data-pdf-fonts', 'true')
            style.textContent = fontCss
            docClone.head.appendChild(style)
            docClone.body.style.fontFamily = pdfFontFamily
            docClone.body.style.fontSize = '0.95rem'
            docClone.body.style.lineHeight = '1.5'

            const exportRoot = docClone.querySelector<HTMLElement>('[data-pdf-export="true"]')
            if (exportRoot) {
              exportRoot.style.maxWidth = '960px'
              exportRoot.style.margin = '0 auto'
              exportRoot.style.fontSize = '0.95rem'
              exportRoot.style.lineHeight = '1.5'
            }
          },
        },
      })

      doc.save(filename)
      toast.success('PDF сформирован')
    } catch (error) {
      console.error('survey participant export error', error)
      toast.error('Не удалось сформировать PDF')
    } finally {
      if (content) {
        if (originalDataAttr === null) {
          content.removeAttribute('data-pdf-export')
        } else {
          content.setAttribute('data-pdf-export', originalDataAttr)
        }
        content.style.fontFamily = originalFontFamily
        content.style.fontSize = originalFontSize
        content.style.lineHeight = originalLineHeight
        content.style.maxWidth = originalMaxWidth
        content.style.margin = originalMargin
      }
      setIsExporting(false)
    }
  }, [enrollment, response, survey, surveyId])

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
          <Skeleton className='h-32 w-full rounded-2xl' />
          <Skeleton className='h-64 w-full rounded-2xl' />
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return <ErrorFetch refetch={refetch} />
  }

  if (!survey || !enrollment || !response) {
    return (
      <div className='min-h-screen  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={fadeTransition}
        >
          <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardContent className='space-y-3 p-6'>
              <CardTitle className='text-lg text-gray-900'>Ответ не найден</CardTitle>
              <CardDescription className='text-gray-600'>Проверьте ссылку или вернитесь к списку результатов.</CardDescription>
              <Link href={`/admin/survey/${surveyId}/results`}>
                <Button variant='outline' className='gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  Вернуться назад
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='min-h-screen  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='flex flex-wrap items-center justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href={`/admin/survey/${surveyId}/results`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к результатам
          </span>
        </Link>
        <Button
          className='gap-2 shadow-sm transition-transform hover:-translate-y-0.5'
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className='h-4 w-4 animate-spin' /> : <FileText className='h-4 w-4' />}
          {isExporting ? 'Формирование...' : 'Экспортировать в PDF'}
        </Button>
      </motion.div>

      <div ref={exportContentRef} className='mt-6 space-y-6'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={{ ...fadeTransition, delay: 0.05 }}
        >
          <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardHeader className='border-b pb-6'>
              <CardTitle className='text-2xl font-semibold text-gray-900'>{enrollment.full_name || 'Без имени'}</CardTitle>
              <CardDescription className='text-gray-600'>Ответ участника на анкету «{survey.title}».</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 py-6 md:grid-cols-2'>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='text-xs uppercase tracking-wide text-gray-500'>Email</div>
                <div className='text-base font-medium text-gray-900'>{enrollment.email ?? '—'}</div>
              </div>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='text-xs uppercase tracking-wide text-gray-500'>Статус участия</div>
                <div className='text-base font-medium text-gray-900'>
                  {enrollmentLabels[enrollment.state] ?? enrollment.state}
                </div>
                <div className='text-xs text-gray-500'>
                  {response.state ? responseLabels[response.state] ?? response.state : '—'}
                </div>
              </div>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='text-xs uppercase tracking-wide text-gray-500'>Канал</div>
                <div className='text-base font-medium text-gray-900'>{response.channel ?? '—'}</div>
              </div>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='text-xs uppercase tracking-wide text-gray-500'>Время прохождения</div>
                <div>Начал: {formatDateTime(response.started_at)}</div>
                <div>Отправил: {formatDateTime(response.submitted_at)}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className='space-y-4'
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={{ ...fadeTransition, delay: 0.1 }}
        >
          {sectionDisplays.length === 0 ? (
            <Card className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
              <CardContent className='p-6 text-sm text-gray-600'>Ответы не найдены.</CardContent>
            </Card>
          ) : (
            sectionDisplays.map((section) => (
              <Card key={section.code || section.title} className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
                <CardHeader className='border-b pb-4'>
                  <CardTitle className='text-lg font-semibold text-gray-900'>{section.title}</CardTitle>
                  <CardDescription className='text-gray-500'>Ответы участника</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6 py-4'>
                  {section.items.map((item, index) => (
                    <div key={item.key || index} className='space-y-3'>
                      {item.heading ? (
                        <div className='text-sm font-semibold text-gray-700'>{item.heading}</div>
                      ) : null}
                      {item.fields.map((field, fieldIndex) => (
                        <div key={`${field.label}-${fieldIndex}`} className='grid gap-1 text-sm text-gray-600 md:grid-cols-[240px_1fr]'>
                          <div className='font-medium text-gray-900'>{field.label}</div>
                          {field.isJson ? (
                            <pre className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-700'>
                              {field.value}
                            </pre>
                          ) : (
                            <div className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-gray-700'>
                              {field.value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}

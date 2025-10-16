export default function SurveyLanding() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
      <div className='max-w-md text-center text-sm text-gray-600'>
        Ссылка на анкету должна содержать публичный идентификатор, например
        <code className='mx-1 rounded-md bg-white px-2 py-1 text-xs text-gray-800'>/survey/example-slug?token=...</code>.
        Проверьте приглашение и перейдите по полной ссылке.
      </div>
    </div>
  )
}

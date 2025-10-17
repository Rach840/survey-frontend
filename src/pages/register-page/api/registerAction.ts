import { registerSchema } from '@/pages/register-page/schema/register-schema'
import { getApiBaseUrl } from '@/shared/api/base-url'
import { toast } from 'sonner'

export default async function registerAction(
  _: unknown,
  formData: FormData,
) {
  console.log(process.env.API_URL)

  try {
    const data = registerSchema.parse(Object.fromEntries(formData.entries()))
    const upstream = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!upstream.ok) {
      throw new Error('register failed')
    }

    toast.success('Пользователь создан')
    return upstream.status
  } catch (error) {
    toast.error('Произошла ошибка')
    return error
  }
}

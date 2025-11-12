'use server'

import { registerSchema } from '@/entities/user/ui/create-user/schema/register-schema'
import { getApiBaseUrl } from '@/shared/api/base-url'
import { toast } from 'sonner'
import {cookies} from "next/headers";

export default async function registerAction(
  _: unknown,
  formData: FormData,
) {
  console.log(process.env.API_URL)

  try {
    const data = registerSchema.parse(Object.fromEntries(formData.entries()))
    const jar = await cookies()
    const access = jar.get('__Host-access')?.value

    if (!access) {
      return new Response('Unauthorized', { status: 401 })
    }

    console.log(access)

    const upstream = await fetch(`${getApiBaseUrl()}/api/user/create`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json',authorization: `Bearer ${access}` },
      body: JSON.stringify(data),

    })

    if (!upstream.ok) {
      throw new Error('register failed')
    }


    return upstream.status
  } catch (error) {
    console.log(error)

    return error
  }
}

'use server'
import {cookies} from "next/headers";

export default async function ensureAccess() {
    const cookieStore = await cookies()
    const access = cookieStore.get('__Host-access')?.value

    if (!access) {
        throw new Response('Unauthorized', { status: 401 })
    }

    return access


}
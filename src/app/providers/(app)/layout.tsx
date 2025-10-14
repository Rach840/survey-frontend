'use server'
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query'
import { meQueryOptions } from '@/entities/user/model/meQuery'
import { cookies } from 'next/headers'
import {Providers} from "@/app/providers";

async function prefetchMe() {
    const qc = new QueryClient()
    // Вызов своего BFF, прокинув текущие куки (чтобы /api/me увидел сессию):
    const jar = await cookies()
    const cookie = jar.getAll().map(c => `${c.name}=${c.value}`).join('; ')
    await qc.prefetchQuery({
        ...meQueryOptions(),
        queryFn: async () => {
            const r = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/me`, {
                headers: { cookie },
                cache: 'no-store',
            })
            if (r.status === 401) return null
            if (!r.ok) throw new Error('me failed')
            return r.json()
        },
    })
    return dehydrate(qc)
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const state = await prefetchMe()
    return (
        <Providers>
        <HydrationBoundary state={state}>{children}</HydrationBoundary>
        </Providers>
    )
}
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meKey } from '@/entities/user/model/meQuery'
import { useRouter } from 'next/navigation'
import {notifyLogout} from "@/shared";

export function useSignOut() {
    const qc = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',              // или PATCH, если поддерживаете
                credentials: 'include',
                cache: 'no-store',
            })
            if (!res.ok) {
                // Подсветит проблему в onError и не даст ложный success
                throw new Error(`Logout failed: ${res.status}`)
            }
        },
        onSuccess: async () => {
            // Очистить кэш текущего юзера
            await qc.invalidateQueries({ queryKey: meKey })
            notifyLogout()
            // Можно сильнее: qc.removeQueries() или qc.clear()
            router.refresh()              // обновит серверные данные
            // или router.replace('/login') для явного редиректа
        },
    })
}
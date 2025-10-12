'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meKey } from '@/entities/user/model/meQuery'
import { useRouter } from 'next/navigation'

export function useSignOut() {
    const qc = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: meKey })
            // при необходимости можно почистить больше ключей
            router.refresh()
        },
    })
}
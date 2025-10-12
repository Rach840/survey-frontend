'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { meKey } from '@/entities/user/model/meQuery'

export function useSignIn() {
    const qc = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: async (payload: { email: string; password: string }) => {
            console.log(payload)
            const r = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!r.ok) throw new Error('login failed')
            return r.json()
        },
        onSuccess: async () => {
            // куки установлены на сервере → обновим UI
            await qc.invalidateQueries({ queryKey: meKey })
            router.refresh() // очистка Router Cache и новый запрос к серверу
        },
    })
}
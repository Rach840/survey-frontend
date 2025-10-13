'use client'
import { useMutation } from '@tanstack/react-query'

export function useRefresh() {
    return useMutation({
        mutationFn: async () => {
            const r = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            })
            if (!r.ok) throw new Error('refresh failed')
            return r.json()
        },
    })
}
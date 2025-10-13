'use client'
import { useEffect } from 'react'

export function AutoRefresh() {
    useEffect(() => {

        const tick = () => {
            fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
                .catch(() => {}) // тихо игнорим — «мягкий» режим
        }

        // при фокусе вкладки — тоже пробуем освежить
        const onFocus = () => tick()

        const id = setInterval(tick, 12 * 60 * 1000) // 12 минут как пример
        window.addEventListener('focus', onFocus)
        return () => {
            clearInterval(id)
            window.removeEventListener('focus', onFocus)
        }
    }, [])

    return null
}
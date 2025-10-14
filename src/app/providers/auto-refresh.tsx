// 'use client'
// import { useEffect } from 'react'
//
// export function AutoRefresh() {
//     useEffect(() => {
//
//         const tick = () => {
//             fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
//                 .catch(() => {})
//         }
//
//         // при фокусе вкладки — тоже пробуем освежить
//         const onFocus = () => tick()
//
//         const id = setInterval(tick, 12 * 60 * 1000)
//         window.addEventListener('focus', onFocus)
//         return () => {
//             clearInterval(id)
//             window.removeEventListener('focus', onFocus)
//         }
//     }, [])
//
//     return null
// }
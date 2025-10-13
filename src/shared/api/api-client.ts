let isRefreshing = false
let waiters: Array<() => void> = []

function onRefreshed() {
    waiters.forEach((w) => w())
    waiters = []
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
    const doFetch = () =>
        fetch(input, { credentials: 'include', cache: 'no-store', ...init })

    let res = await doFetch()
    if (res.status !== 401) return res

    // Если 401 — один «тихий» рефреш на таб и повтор запроса
    if (!isRefreshing) {
        isRefreshing = true
        try {
            const rf = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
            })
            isRefreshing = false
            onRefreshed()
            if (!rf.ok) return res // рефреш не удался — вернем оригинальный 401
        } catch {
            isRefreshing = false
            onRefreshed()
            return res
        }
    } else {
        // Если рефреш уже идет — подождем его завершения
        await new Promise<void>((resolve) => waiters.push(resolve))
    }

    // Повторим запрос один раз
    res = await doFetch()
    return res
}
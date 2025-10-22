const DEFAULT_CACHE_TTL = 30_000
const CACHE_BYPASS_HEADER = 'x-skip-cache'
const CACHE_TTL_HEADER = 'x-cache-ttl'

type CacheEntry = {
    expiresAt: number
    status: number
    statusText: string
    headers: [string, string][]
    body: ArrayBuffer
}

const cacheStore = new Map<string, CacheEntry>()

let isRefreshing = false
let waiters: Array<() => void> = []

function onRefreshed() {
    waiters.forEach((w) => w())
    waiters = []
}

function normalizeMethod(input: RequestInfo, init: RequestInit) {
    const requestMethod = typeof input === 'string' ? undefined : input instanceof Request ? input.method : undefined
    return (init.method ?? requestMethod ?? 'GET').toUpperCase()
}

function headersAsRecord(headers: HeadersInit | undefined) {
    return new Headers(headers ?? undefined)
}

function getCacheKey(input: RequestInfo, init: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
    const method = normalizeMethod(input, init)
    return `${method}:${url}`
}

function shouldUseCache(input: RequestInfo, init: RequestInit) {
    const method = normalizeMethod(input, init)
    if (method !== 'GET') return false

    const headers = headersAsRecord(init.headers)
    return headers.get(CACHE_BYPASS_HEADER) !== 'true';


}

function readCacheTTL(init: RequestInit) {
    const headers = headersAsRecord(init.headers)
    const ttlValue = headers.get(CACHE_TTL_HEADER)
    if (!ttlValue) return DEFAULT_CACHE_TTL

    const parsed = Number(ttlValue)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CACHE_TTL
}

function buildResponseFromCache(entry: CacheEntry) {
    const bufferCopy = entry.body.slice(0)
    const headers = new Headers(entry.headers)
    return new Response(bufferCopy, {
        status: entry.status,
        statusText: entry.statusText,
        headers,
    })
}

export function invalidateApiFetchCache(match?: string | RegExp) {
    if (!match) {
        cacheStore.clear()
        return
    }

    for (const key of cacheStore.keys()) {
        if (typeof match === 'string') {
            if (key.includes(match)) cacheStore.delete(key)
        } else if (match.test(key)) {
            cacheStore.delete(key)
        }
    }
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
    const useCache = shouldUseCache(input, init)
    const cacheKey = useCache ? getCacheKey(input, init) : null
    const cacheTTL = useCache ? readCacheTTL(init) : DEFAULT_CACHE_TTL

    const sanitizedHeaders = (() => {
        const headers = headersAsRecord(init.headers)
        headers.delete(CACHE_BYPASS_HEADER)
        headers.delete(CACHE_TTL_HEADER)
        return headers
    })()

    const normalizedInit: RequestInit = {
        ...init,
        headers: sanitizedHeaders,
    }

    if (useCache && cacheKey) {
        const cached = cacheStore.get(cacheKey)
        if (cached && cached.expiresAt > Date.now()) {
            return buildResponseFromCache(cached)
        }
    }

    const doFetch = () =>
        fetch(input, { credentials: 'include', cache: 'no-store', ...normalizedInit })

    let res = await doFetch()
    if (res.status === 401) {
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
                if (!rf.ok) return res
            } catch {
                isRefreshing = false
                onRefreshed()
                return res
            }
        } else {
            await new Promise<void>((resolve) => waiters.push(resolve))
        }

        res = await doFetch()
    }

    if (useCache && cacheKey && res.ok) {
        const body = await res.clone().arrayBuffer()
        cacheStore.set(cacheKey, {
            expiresAt: Date.now() + cacheTTL,
            status: res.status,
            statusText: res.statusText,
            headers: Array.from(res.headers.entries()),
            body,
        })
    }

    return res
}

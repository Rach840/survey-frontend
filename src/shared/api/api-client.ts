
export async function apiFetch<T>(
    path: string,
    init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
    const { auth, ...rest } = init;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
            ...(rest.headers || {}),
        },
        cache: 'no-store', // избегаем конкуренции с кэшем Next
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
}

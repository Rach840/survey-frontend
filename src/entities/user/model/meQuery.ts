import { queryOptions, useQuery } from '@tanstack/react-query'
import { getMe } from '../api/getMe'

export const meKey = ['me'] as const

export const meQueryOptions = () =>
    queryOptions({
        queryKey: meKey,
        queryFn: getMe,
        // профиль меняется редко — делаем «долгую свежесть»
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    })

export function useMeQuery() {
    return useQuery(meQueryOptions())
}
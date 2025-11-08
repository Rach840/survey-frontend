import {queryOptions, useQuery} from '@tanstack/react-query'
import {getAllUsers} from "@/entities/user/api/getAllUsers";

export const usersKey = ['users'] as const

export const getUsersQueryOptions = () =>
    queryOptions({
        queryKey: usersKey,
        queryFn: getAllUsers,
        // профиль меняется редко — делаем «долгую свежесть»
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    })

export function useGetUsers() {
    return useQuery(getUsersQueryOptions())
}
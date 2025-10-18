'use client'
import {useQuery, UseQueryResult} from '@tanstack/react-query'
import {getTemplateByMe} from "@/entities/templates/api/getTemplateByMe"
import {Template} from "@/entities/templates/types";

export const templatesByMeKey = ['templateByMe'] as const

export const useTemplatesByMe = (): UseQueryResult<Template[] | [], Error> =>
    useQuery({
        queryKey: templatesByMeKey,
        queryFn: getTemplateByMe,
        // профиль меняется редко — делаем «долгую свежесть»
        staleTime: 5 * 300 * 1000,

        refetchOnWindowFocus: false,
        retry: false,
    })

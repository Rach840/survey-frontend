import { useQuery } from '@tanstack/react-query'
import { getTemplateByMe } from "@/entities/templates/api/getTemplateByMe"

export const templatesByMeKey = ['templateByMe'] as const

export const useTemplatesByMe = () =>
    useQuery({
        queryKey: templatesByMeKey,
        queryFn: getTemplateByMe,
        // профиль меняется редко — делаем «долгую свежесть»
        staleTime: 5 * 300 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    })

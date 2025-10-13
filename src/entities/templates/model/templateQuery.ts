import { useQuery } from '@tanstack/react-query'
import {getTemplateByMe} from "@/entities/templates/api/getTemplateByMe";

export const templateByMe = ['templateByMe'] as const

export const getTemplatesByMe = () =>
    useQuery({
        queryKey: [templateByMe],
        queryFn: getTemplateByMe,
        // профиль меняется редко — делаем «долгую свежесть»
        staleTime: 5 * 300 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    })
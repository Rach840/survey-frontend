import {useMutation} from "@tanstack/react-query";
import {publicSurveySessionKey, startPublicSurveySession} from "@/entities/public-survey";
import {toast} from "sonner";

export function  useStartMutation(token: string, queryClient:any ) {
    return useMutation({
    mutationFn: () => startPublicSurveySession({
        token,
        channel: 'general',
    }),
    onSuccess: async () => {
        await queryClient.invalidateQueries({
            queryKey: publicSurveySessionKey(token),
        })
        toast.success('Анкетирование начато')
    },
    onError: () => {
        toast.error('Не удалось начать анкетирование. Попробуйте ещё раз.')
    },
})
}
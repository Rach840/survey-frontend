import {useMutation} from "@tanstack/react-query";
import {publicSurveySessionKey, submitPublicSurveyResponse, SurveySubmissionAnswer} from "@/entities/public-survey";
import {clearDraft} from "@/entities/surveys/lib";
import {toast} from "sonner";

export function useSubmitSurvey(token: string, storageKey: undefined | string, setIsSubmited: (v: boolean) => void, queryClient: any) {
    return useMutation({
        mutationFn: async (answers: SurveySubmissionAnswer[]) => {
            return submitPublicSurveyResponse({
                token,
                channel: 'web',
                answers,
            })
        },
        onSuccess: async (value) => {
            if (storageKey) {
                clearDraft(storageKey)
            }
            if (value.response.state == "submitted"){
                setIsSubmited(true)
            }
            await queryClient.invalidateQueries({
                queryKey: publicSurveySessionKey(token),
            })
            toast.success('Анкета успешно завершена')
        },
        onError: () => {
            toast.error('Не удалось отправить ответы. Попробуйте ещё раз.')
        },
    })
}
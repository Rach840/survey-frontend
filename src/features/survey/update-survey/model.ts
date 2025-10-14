'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSurvey } from '@/entities/surveys/api/updateSurvey'
import { surveyDetailKey } from '@/entities/surveys/model/surveyDetailQuery'
import type { UpdateSurveyPayload } from '@/entities/surveys/types'

export function useSurveyUpdate(surveyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSurveyPayload) => updateSurvey(surveyId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(surveyDetailKey(surveyId), data)
    },
  })
}

'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'

import {updateSurvey} from '@/entities/surveys/api/updateSurvey'
import {surveyDetailKey} from '@/entities/surveys/model/surveyDetailQuery'
import {surveyStatisticsKey} from '@/entities/surveys/model/surveyStatisticsQuery'
import type {UpdateSurveyPayload} from '@/entities/surveys/types'
import {invalidateApiFetchCache} from '@/shared'

export function useSurveyUpdate(surveyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSurveyPayload) => updateSurvey(surveyId, payload),
    onSuccess: (data) => {
      invalidateApiFetchCache('api/survey')
      queryClient.setQueryData(surveyDetailKey(surveyId), data)
      queryClient.invalidateQueries({ queryKey: surveyStatisticsKey(surveyId) })
    },
  })
}

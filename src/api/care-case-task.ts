import type { ApiResponse } from '@/types'
import type { CareCaseTaskItem, CareCaseTaskCreateInput, CareCaseTaskUpdateInput } from '@/types/care-case-task'
import { api } from '@/api'

export const careCaseTaskApi = api.injectEndpoints({
    endpoints: build => ({
        getCareCaseTasks: build.query<ApiResponse<CareCaseTaskItem[]>, number>({
            query: care_case_id => ({
                url: '/admin/care-case-tasks',
                method: 'GET',
                params: { care_case_id },
            }),
        }),
        addCareCaseTask: build.mutation<ApiResponse<CareCaseTaskItem>, { payload: CareCaseTaskCreateInput }>({
            query: ({ payload }) => ({
                url: '/admin/care-case-tasks',
                method: 'POST',
                body: payload,
            }),
        }),
        updateCareCaseTask: build.mutation<
            ApiResponse<CareCaseTaskItem>,
            {
                task_id: number
                care_case_id: number
                payload: CareCaseTaskUpdateInput
            }
        >({
            query: ({ task_id, payload }) => ({
                url: `/admin/care-case-tasks/${task_id}`,
                method: 'PATCH',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetCareCaseTasksQuery, useAddCareCaseTaskMutation, useUpdateCareCaseTaskMutation } = careCaseTaskApi

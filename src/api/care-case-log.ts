import type { ApiResponse } from '@/types'
import type { CareCaseLogItem, CareCaseLogCreateInput, CareCaseLogUpdateInput } from '@/types/care-case-log'
import { api } from '@/api'

export const careCaseLogApi = api.injectEndpoints({
    endpoints: build => ({
        getCareCaseLogs: build.query<ApiResponse<CareCaseLogItem[]>, number>({
            query: care_case_id => ({
                url: '/admin/care-case-logs',
                method: 'GET',
                params: { care_case_id },
            }),
        }),
        addCareCaseLog: build.mutation<ApiResponse<CareCaseLogItem>, { payload: CareCaseLogCreateInput }>({
            query: ({ payload }) => ({
                url: '/admin/care-case-logs',
                method: 'POST',
                body: payload,
            }),
        }),
        updateCareCaseLog: build.mutation<
            ApiResponse<CareCaseLogItem>,
            {
                log_id: number
                care_case_id: number
                payload: CareCaseLogUpdateInput
            }
        >({
            query: ({ log_id, payload }) => ({
                url: `/admin/care-case-logs/${log_id}`,
                method: 'PATCH',
                body: payload,
            }),
        }),
        deleteCareCaseLog: build.mutation<ApiResponse<null>, number>({
            query: log_id => ({
                url: `/admin/care-case-logs/${log_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetCareCaseLogsQuery,
    useAddCareCaseLogMutation,
    useUpdateCareCaseLogMutation,
    useDeleteCareCaseLogMutation,
} = careCaseLogApi

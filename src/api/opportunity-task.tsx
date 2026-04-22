import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    OpportunityTaskItem,
    OpportunityTaskCreateInput,
    OpportunityTaskUpdateInput,
} from '@/types/opportunity-task'

export const opportunityTaskApi = api.injectEndpoints({
    endpoints: builder => ({
        getTasksByOpportunity: builder.query<ApiResponse<OpportunityTaskItem[]>, number>({
            query: opportunity_id => ({
                url: `/admin/opportunity-tasks`,
                params: { opportunity_id },
            }),
        }),
        createOpportunityTask: builder.mutation<
            ApiResponse<OpportunityTaskItem>,
            { opportunity_id: number; payload: OpportunityTaskCreateInput }
        >({
            query: ({ opportunity_id, payload }) => ({
                url: `/admin/opportunity-tasks`,
                method: 'POST',
                params: { opportunity_id },
                body: payload,
            }),
        }),
        updateOpportunityTask: builder.mutation<
            ApiResponse<OpportunityTaskItem>,
            { task_id: number; payload: OpportunityTaskUpdateInput }
        >({
            query: ({ task_id, payload }) => ({
                url: `/admin/opportunity-tasks/${task_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteOpportunityTask: builder.mutation<ApiResponse<void>, number>({
            query: task_id => ({
                url: `/admin/opportunity-tasks/${task_id}`,
                method: 'DELETE',
            }),
        }),
    }),
})

export const {
    useGetTasksByOpportunityQuery,
    useCreateOpportunityTaskMutation,
    useUpdateOpportunityTaskMutation,
    useDeleteOpportunityTaskMutation,
} = opportunityTaskApi

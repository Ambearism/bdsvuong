import type {
    OpportunityCreateInput,
    OpportunityListResponse,
    OpportunityListParams,
    OpportunityItem,
    OpportunityUpdateInput,
    ConvertToTransactionInput,
    StageHistoryItem,
    OpportunityStatistics,
    PipelineStatisticsResponse,
    LeadSourceChartResponse,
    OpportunityUpdatePositionInput,
} from '@/types/opportunity'
import type { ApiResponse } from '@/types'

import { api } from '@/api'
import { normalizeFileUrls } from '@/lib/utils'

export const opportunityApi = api.injectEndpoints({
    endpoints: build => ({
        getOpportunityList: build.query<ApiResponse<OpportunityListResponse>, OpportunityListParams>({
            query: params => ({
                url: '/admin/opportunities',
                method: 'GET',
                params,
            }),
        }),
        getOpportunityDetail: build.query<ApiResponse<OpportunityItem>, { opportunity_id: number }>({
            query: ({ opportunity_id }) => ({
                url: `/admin/opportunities/${opportunity_id}`,
                method: 'GET',
            }),
        }),
        getOpportunityHistory: build.query<ApiResponse<StageHistoryItem[]>, { opportunity_id: number }>({
            query: ({ opportunity_id }) => ({
                url: `/admin/opportunities/${opportunity_id}/history`,
                method: 'GET',
            }),
        }),
        createOpportunity: build.mutation<ApiResponse<OpportunityItem>, OpportunityCreateInput>({
            query: rawPayload => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as OpportunityCreateInput & { file_urls?: string[] | string })

                return {
                    url: '/admin/opportunities',
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        updateOpportunity: build.mutation<
            ApiResponse<OpportunityItem>,
            { opportunity_id: number; payload: OpportunityUpdateInput }
        >({
            query: ({ opportunity_id, payload: rawPayload }) => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as OpportunityCreateInput & { file_urls?: string[] | string })

                return {
                    url: `/admin/opportunities/${opportunity_id}`,
                    method: 'PUT',
                    body: payload,
                }
            },
        }),
        changeOpportunityStage: build.mutation<
            ApiResponse<OpportunityItem>,
            { opportunity_id: number; payload: OpportunityUpdateInput }
        >({
            query: ({ opportunity_id, payload }) => ({
                url: `/admin/opportunities/${opportunity_id}/change-stage`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteOpportunity: build.mutation<ApiResponse<string>, { opportunity_id: number }>({
            query: ({ opportunity_id }) => ({
                url: `/admin/opportunities/${opportunity_id}`,
                method: 'DELETE',
            }),
        }),
        convertToTransaction: build.mutation<
            ApiResponse<unknown>,
            { opportunity_id: number; payload: ConvertToTransactionInput }
        >({
            query: ({ opportunity_id, payload }) => ({
                url: `/admin/opportunities/${opportunity_id}/convert-to-transaction`,
                method: 'POST',
                body: payload,
            }),
        }),
        logOpportunityActivity: build.mutation<
            ApiResponse<StageHistoryItem>,
            {
                opportunity_id: number
                payload: {
                    action_type: number
                    notes?: string
                    title?: string
                    assigned_to?: number
                    due_date?: string
                    status?: string
                }
            }
        >({
            query: ({ opportunity_id, payload }) => ({
                url: `/admin/opportunities/${opportunity_id}/activity`,
                method: 'POST',
                body: payload,
            }),
        }),
        getOpportunityStatistics: build.query<ApiResponse<OpportunityStatistics>, void>({
            query: () => ({
                url: '/admin/opportunities/statistics',
                method: 'GET',
            }),
        }),
        getPipelineStatistics: build.query<ApiResponse<PipelineStatisticsResponse>, OpportunityListParams>({
            query: params => ({
                url: '/admin/opportunities/pipeline-statistics',
                method: 'GET',
                params,
            }),
        }),
        getLeadSourceCharts: build.query<ApiResponse<LeadSourceChartResponse>, { period_type?: string }>({
            query: params => ({
                url: '/admin/opportunities/charts/lead-source',
                method: 'GET',
                params,
            }),
        }),
        getPipelineOpportunities: build.query<ApiResponse<OpportunityListResponse>, OpportunityListParams>({
            query: params => ({
                url: '/admin/opportunities/pipeline',
                method: 'GET',
                params,
            }),
        }),
        updateOpportunityPositions: build.mutation<ApiResponse<void>, OpportunityUpdatePositionInput>({
            query: payload => ({
                url: '/admin/opportunities/update-positions',
                method: 'PUT',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetOpportunityListQuery,
    useGetOpportunityDetailQuery,
    useGetOpportunityHistoryQuery,
    useCreateOpportunityMutation,
    useUpdateOpportunityMutation,
    useChangeOpportunityStageMutation,
    useDeleteOpportunityMutation,
    useConvertToTransactionMutation,
    useLogOpportunityActivityMutation,
    useGetOpportunityStatisticsQuery,
    useGetPipelineStatisticsQuery,
    useLazyGetOpportunityHistoryQuery,
    useGetLeadSourceChartsQuery,
    useGetPipelineOpportunitiesQuery,
    useUpdateOpportunityPositionsMutation,
} = opportunityApi

import type {
    ExpertListResponse,
    ExpertListParams,
    ExpertItem,
    ExpertCreateInput,
    ExpertUpdateInput,
} from '@/types/expert'
import type { ApiResponse } from '@/types'
import { api } from '@/api'

const EXPERT_API_PREFIX = '/admin/experts'

export const expertApi = api.injectEndpoints({
    endpoints: build => ({
        getExpertList: build.query<ApiResponse<ExpertListResponse>, ExpertListParams>({
            query: params => ({
                url: EXPERT_API_PREFIX,
                method: 'GET',
                params,
            }),
        }),

        getExpertDetail: build.query<ApiResponse<ExpertItem>, { expert_id: number }>({
            query: ({ expert_id }) => ({
                url: `${EXPERT_API_PREFIX}/${expert_id}`,
                method: 'GET',
            }),
        }),

        createExpert: build.mutation<ApiResponse<ExpertItem>, ExpertCreateInput>({
            query: payload => ({
                url: EXPERT_API_PREFIX,
                method: 'POST',
                body: payload,
            }),
        }),

        updateExpert: build.mutation<ApiResponse<ExpertItem>, { expert_id: number; payload: ExpertUpdateInput }>({
            query: ({ expert_id, payload }) => ({
                url: `${EXPERT_API_PREFIX}/${expert_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),

        deleteExpert: build.mutation<ApiResponse<string>, { expert_id: number }>({
            query: ({ expert_id }) => ({
                url: `${EXPERT_API_PREFIX}/${expert_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetExpertListQuery,
    useGetExpertDetailQuery,
    useCreateExpertMutation,
    useUpdateExpertMutation,
    useDeleteExpertMutation,
} = expertApi

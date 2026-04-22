import type { ApiResponse } from '@/types'

import { api } from '@/api'
import type { ConsignItem, ConsignListRequest, ConsignListResponse } from '@/types/consign'

export const consignApi = api.injectEndpoints({
    endpoints: build => ({
        getConsignList: build.query<ApiResponse<ConsignListResponse>, ConsignListRequest>({
            query: params => ({
                url: '/admin/consigns',
                method: 'GET',
                params,
            }),
        }),
        getConsignDetail: build.query<ApiResponse<ConsignItem>, { consign_id: number }>({
            query: ({ consign_id }) => ({
                url: `/admin/consigns/${consign_id}`,
                method: 'GET',
            }),
        }),
        deleteConsign: build.mutation<ApiResponse<string>, { consign_id: number }>({
            query: ({ consign_id }) => ({
                url: `/admin/consigns/${consign_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetConsignListQuery, useGetConsignDetailQuery, useDeleteConsignMutation } = consignApi

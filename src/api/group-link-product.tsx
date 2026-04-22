import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type {
    GroupLinkProductListParams,
    GroupLinkProductListResponse,
    GroupLinkProductItem,
    GroupLinkProductUpdateInput,
} from '@/types/group-link-product'

export const groupLinkProductApi = api.injectEndpoints({
    endpoints: build => ({
        getGroupLinkProductList: build.query<ApiResponse<GroupLinkProductListResponse>, GroupLinkProductListParams>({
            query: params => ({ url: '/admin/group-link-products', method: 'GET', params }),
        }),
        getGroupLinkProductDetail: build.query<ApiResponse<GroupLinkProductItem>, { id: number }>({
            query: ({ id }) => ({ url: `/admin/group-link-products/${id}`, method: 'GET' }),
        }),
        updateGroupLinkProduct: build.mutation<
            ApiResponse<GroupLinkProductItem>,
            { id: number; payload: GroupLinkProductUpdateInput }
        >({
            query: ({ id, payload }) => ({ url: `/admin/group-link-products/${id}`, method: 'PUT', body: payload }),
        }),
    }),
    overrideExisting: false,
})

export const { useGetGroupLinkProductListQuery, useGetGroupLinkProductDetailQuery, useUpdateGroupLinkProductMutation } =
    groupLinkProductApi

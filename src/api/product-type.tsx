import type {
    ProductTypeListResponse,
    ProductTypeCreateInput,
    ProductTypeOutput,
    ProductTypeUpdateInput,
} from '@/types/product-type'
import type { ApiResponse, SearchParams } from '@/types'

import { api } from '@/api'

export const productTypeApi = api.injectEndpoints({
    endpoints: build => ({
        getProductTypeList: build.query<ApiResponse<ProductTypeListResponse>, SearchParams>({
            query: params => ({
                url: '/admin/products/types',
                method: 'GET',
                params,
            }),
        }),
        getProductTypeDetail: build.query<ApiResponse<ProductTypeOutput>, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/products/types/${id}`,
                method: 'GET',
            }),
        }),
        createProductType: build.mutation<ApiResponse<ProductTypeOutput>, ProductTypeCreateInput>({
            query: payload => ({
                url: '/admin/products/types',
                method: 'POST',
                body: payload,
            }),
        }),
        updateProductType: build.mutation<
            ApiResponse<ProductTypeOutput>,
            { id: number; payload: ProductTypeUpdateInput }
        >({
            query: ({ id, payload }) => ({
                url: `/admin/products/types/${id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteProductType: build.mutation<ApiResponse<string>, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/products/types/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetProductTypeListQuery,
    useGetProductTypeDetailQuery,
    useCreateProductTypeMutation,
    useUpdateProductTypeMutation,
    useDeleteProductTypeMutation,
} = productTypeApi

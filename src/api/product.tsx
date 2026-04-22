import type {
    ProductListResponse,
    ProductListParams,
    ProductCreateInput,
    ProductUpdateInput,
    ProductOutput,
    ProductCheckDuplicateInput,
    ProductCheckDuplicateIdentifierCodeInput,
    ProductCheckDuplicateProductCodeInput,
    ProductDuplicateCheckResponse,
    ProductMaxIdResponse,
    ProductTimelineResponse,
    ProductPermissionItem,
    UpdateProductPermissionRequest,
    ProductLocationListResponse,
} from '@/types/product'

import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const productApi = api.injectEndpoints({
    endpoints: build => ({
        getProductList: build.query<ApiResponse<ProductListResponse>, ProductListParams>({
            query: params => ({
                url: '/admin/product',
                method: 'GET',
                params,
            }),
        }),
        getProductsLeaseOptions: build.query<
            ApiResponse<ProductListResponse>,
            { page?: number; per_page?: number; keyword?: string }
        >({
            query: params => ({
                url: '/admin/product/lease-options',
                method: 'GET',
                params,
            }),
        }),

        getProductDetail: build.query<ApiResponse<ProductOutput>, { product_id: number }>({
            query: ({ product_id }) => ({
                url: `/admin/product/${product_id}`,
                method: 'GET',
            }),
        }),
        createProduct: build.mutation<ApiResponse<ProductOutput>, ProductCreateInput>({
            query: payload => ({
                url: '/admin/product',
                method: 'POST',
                body: payload,
            }),
        }),
        updateProduct: build.mutation<ApiResponse<ProductOutput>, { product_id: number; payload: ProductUpdateInput }>({
            query: ({ product_id, payload }) => ({
                url: `/admin/product/${product_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteProduct: build.mutation<ApiResponse<string>, { product_id: number }>({
            query: ({ product_id }) => ({
                url: `/admin/product/${product_id}`,
                method: 'DELETE',
            }),
        }),
        getProductMaxId: build.query<ApiResponse<ProductMaxIdResponse>, void>({
            query: () => ({
                url: '/admin/product/max-id',
                method: 'GET',
            }),
        }),
        getProductLocations: build.query<ApiResponse<ProductLocationListResponse>, ProductListParams>({
            query: params => ({
                url: '/admin/product/locations',
                method: 'GET',
                params,
            }),
        }),
        exportProductLocations: build.query<Blob, void>({
            query: () => ({
                url: '/admin/product/locations/export-excel',
                method: 'GET',
                responseHandler: (response: Response) => response.blob(),
                cache: 'no-cache',
            }),
        }),
        checkDuplicate: build.query<ApiResponse<ProductDuplicateCheckResponse>, ProductCheckDuplicateInput>({
            query: params => ({
                url: `/admin/product/check-duplicate`,
                method: 'GET',
                params,
            }),
        }),
        checkDuplicateIdentifierCode: build.query<
            ApiResponse<ProductDuplicateCheckResponse>,
            ProductCheckDuplicateIdentifierCodeInput
        >({
            query: params => ({
                url: `/admin/product/check-duplicate-identifier-code`,
                method: 'GET',
                params,
            }),
        }),
        checkDuplicateProductCode: build.query<
            ApiResponse<ProductDuplicateCheckResponse>,
            ProductCheckDuplicateProductCodeInput
        >({
            query: params => ({
                url: `/admin/product/check-duplicate-product-code`,
                method: 'GET',
                params,
            }),
        }),
        getTimeline: build.query<ApiResponse<ProductTimelineResponse>, { product_id: number }>({
            query: ({ product_id }) => ({
                url: `/admin/product/${product_id}/timeline`,
                method: 'GET',
            }),
        }),
        getProductAccountPermissions: build.query<ApiResponse<ProductPermissionItem[]>, number>({
            query: product_id => ({
                url: `/admin/product/${product_id}/permissions`,
                method: 'GET',
            }),
        }),
        updateProductAccountPermissions: build.mutation<
            ApiResponse<unknown>,
            { product_id: number; payload: UpdateProductPermissionRequest }
        >({
            query: ({ product_id, payload }) => ({
                url: `/admin/product/${product_id}/permissions`,
                method: 'PUT',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetProductListQuery,
    useGetProductDetailQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useLazyCheckDuplicateQuery,
    useLazyCheckDuplicateIdentifierCodeQuery,
    useLazyCheckDuplicateProductCodeQuery,
    useGetProductMaxIdQuery,
    useGetProductLocationsQuery,
    useLazyExportProductLocationsQuery,
    useGetTimelineQuery,
    useGetProductAccountPermissionsQuery,
    useUpdateProductAccountPermissionsMutation,
    useLazyGetProductDetailQuery,
    useGetProductsLeaseOptionsQuery,
} = productApi

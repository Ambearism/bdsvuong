import type { ApiResponse } from '@/types'
import type {
    CategoryListResponse,
    CategoryListParams,
    CategoryItem,
    CategoryCreateInput,
    CategoryOutput,
    CategoryUpdateInput,
} from '@/types/category'
import { api } from '@/api'

export const categoryApi = api.injectEndpoints({
    endpoints: build => ({
        getCategoryList: build.query<ApiResponse<CategoryListResponse>, CategoryListParams | void>({
            query: params => ({ url: '/admin/categories', ...(params && { params }) }),
        }),
        getCategoryDetail: build.query<ApiResponse<CategoryOutput>, { category_id: number }>({
            query: ({ category_id }) => `/admin/categories/${category_id}`,
        }),
        createCategory: build.mutation<ApiResponse<CategoryItem>, CategoryCreateInput>({
            query: payload => ({ url: '/admin/categories', method: 'POST', body: payload }),
        }),
        updateCategory: build.mutation<
            ApiResponse<CategoryItem>,
            { category_id: number; payload: CategoryUpdateInput }
        >({
            query: ({ category_id, payload }) => ({
                url: `/admin/categories/${category_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteCategory: build.mutation<ApiResponse<string>, { category_id: number }>({
            query: ({ category_id }) => ({ url: `/admin/categories/${category_id}`, method: 'DELETE' }),
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetCategoryListQuery,
    useGetCategoryDetailQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi

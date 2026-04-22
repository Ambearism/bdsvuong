import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    CostCategoryGroup,
    CostCategoryItem,
    CostCategoryGroupCreateInput,
    CostCategoryGroupUpdateInput,
    CostCategoryItemCreateInput,
    CostCategoryItemUpdateInput,
} from '@/types/cost-category'

export const costCategoryApi = api.injectEndpoints({
    endpoints: build => ({
        getCostCategoryGroups: build.query<ApiResponse<CostCategoryGroup[]>, void>({
            query: () => ({ url: '/admin/cost-categories/groups' }),
        }),
        createCostCategoryGroup: build.mutation<ApiResponse<CostCategoryGroup>, CostCategoryGroupCreateInput>({
            query: payload => ({ url: '/admin/cost-categories/groups', method: 'POST', body: payload }),
        }),
        updateCostCategoryGroup: build.mutation<
            ApiResponse<CostCategoryGroup>,
            { id: number; payload: CostCategoryGroupUpdateInput }
        >({
            query: ({ id, payload }) => ({ url: `/admin/cost-categories/groups/${id}`, method: 'PUT', body: payload }),
        }),
        deleteCostCategoryGroup: build.mutation<ApiResponse<string>, number>({
            query: id => ({ url: `/admin/cost-categories/groups/${id}`, method: 'DELETE' }),
        }),

        getCostCategoryItems: build.query<ApiResponse<CostCategoryItem[]>, void>({
            query: () => ({ url: '/admin/cost-categories/items' }),
        }),
        createCostCategoryItem: build.mutation<ApiResponse<CostCategoryItem>, CostCategoryItemCreateInput>({
            query: payload => ({ url: '/admin/cost-categories/items', method: 'POST', body: payload }),
        }),
        updateCostCategoryItem: build.mutation<
            ApiResponse<CostCategoryItem>,
            { id: number; payload: CostCategoryItemUpdateInput }
        >({
            query: ({ id, payload }) => ({ url: `/admin/cost-categories/items/${id}`, method: 'PUT', body: payload }),
        }),
        deleteCostCategoryItem: build.mutation<ApiResponse<string>, number>({
            query: id => ({ url: `/admin/cost-categories/items/${id}`, method: 'DELETE' }),
        }),
        reorderItems: build.mutation<ApiResponse<string>, { item_ids: number[] }>({
            query: payload => ({ url: '/admin/cost-categories/items/reorder', method: 'POST', body: payload }),
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetCostCategoryGroupsQuery,
    useCreateCostCategoryGroupMutation,
    useUpdateCostCategoryGroupMutation,
    useDeleteCostCategoryGroupMutation,
    useGetCostCategoryItemsQuery,
    useCreateCostCategoryItemMutation,
    useUpdateCostCategoryItemMutation,
    useDeleteCostCategoryItemMutation,
    useReorderItemsMutation,
} = costCategoryApi

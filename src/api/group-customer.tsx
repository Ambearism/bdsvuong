import type {
    GroupCustomerListParams,
    GroupCustomerListResponse,
    GroupCustomerOutput,
    GroupCustomerCreateInput,
    GroupCustomerUpdateInput,
} from '@/types/group-customer'
import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const customerApi = api.injectEndpoints({
    endpoints: build => ({
        getGroupCustomerList: build.query<ApiResponse<GroupCustomerListResponse>, GroupCustomerListParams>({
            query: params => ({
                url: '/admin/customer-group',
                method: 'GET',
                params,
            }),
        }),
        getChildrenGroupCustomer: build.query<ApiResponse<GroupCustomerListResponse>, { customer_group_id: number }>({
            query: ({ customer_group_id }) => ({
                url: `/admin/customer-group/${customer_group_id}/children`,
                method: 'GET',
            }),
        }),
        getGroupCustomerDetail: build.query<ApiResponse<GroupCustomerOutput>, { customer_group_id: number }>({
            query: ({ customer_group_id }) => ({
                url: `/admin/customer-group/${customer_group_id}`,
                method: 'GET',
            }),
        }),
        createGroupCustomer: build.mutation<ApiResponse<GroupCustomerOutput>, GroupCustomerCreateInput>({
            query: payload => ({
                url: '/admin/customer-group',
                method: 'POST',
                body: payload,
            }),
        }),
        updateGroupCustomer: build.mutation<
            ApiResponse<GroupCustomerOutput>,
            { customer_group_id: number; payload: GroupCustomerUpdateInput }
        >({
            query: ({ customer_group_id, payload }) => ({
                url: `/admin/customer-group/${customer_group_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteGroupCustomer: build.mutation<ApiResponse<string>, { customer_group_id: number }>({
            query: ({ customer_group_id }) => ({
                url: `/admin/customer-group/${customer_group_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetGroupCustomerListQuery,
    useGetChildrenGroupCustomerQuery,
    useGetGroupCustomerDetailQuery,
    useCreateGroupCustomerMutation,
    useUpdateGroupCustomerMutation,
    useDeleteGroupCustomerMutation,
} = customerApi

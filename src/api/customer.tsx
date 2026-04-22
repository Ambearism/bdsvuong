import type {
    CustomerCreateInput,
    CustomerListResponse,
    CustomerListParams,
    CustomerItem,
    CustomerUpdateInput,
    CustomerPermissionItem,
    UpdateCustomerPermissionRequest,
    CustomerTimeline,
} from '@/types/customer'
import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const customerApi = api.injectEndpoints({
    endpoints: build => ({
        getCustomerList: build.query<ApiResponse<CustomerListResponse>, CustomerListParams>({
            query: params => ({
                url: '/admin/customer',
                method: 'GET',
                params,
            }),
        }),
        getCustomerDetail: build.query<ApiResponse<CustomerItem>, { customer_id: number }>({
            query: ({ customer_id }) => ({
                url: `/admin/customer/${customer_id}`,
                method: 'GET',
            }),
        }),
        createCustomer: build.mutation<ApiResponse<CustomerItem>, CustomerCreateInput>({
            query: payload => ({
                url: '/admin/customer',
                method: 'POST',
                body: payload,
            }),
        }),
        getCustomerByGroupCustomer: build.query<ApiResponse<CustomerListResponse>, { customer_group_id: number }>({
            query: ({ customer_group_id }) => ({
                url: `/admin/customer/group-customer/${customer_group_id}`,
                method: 'GET',
            }),
        }),
        updateCustomer: build.mutation<
            ApiResponse<CustomerItem>,
            { customer_id: number; payload: CustomerUpdateInput }
        >({
            query: ({ customer_id, payload }) => ({
                url: `/admin/customer/${customer_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteCustomer: build.mutation<ApiResponse<string>, { customer_id: number }>({
            query: ({ customer_id }) => ({
                url: `/admin/customer/${customer_id}`,
                method: 'DELETE',
            }),
        }),
        getCustomerAccountPermissions: build.query<ApiResponse<CustomerPermissionItem[]>, number>({
            query: customer_id => ({
                url: `/admin/customer/${customer_id}/permissions`,
                method: 'GET',
            }),
        }),
        updateCustomerAccountPermissions: build.mutation<
            ApiResponse<unknown>,
            { customer_id: number; payload: UpdateCustomerPermissionRequest }
        >({
            query: ({ customer_id, payload }) => ({
                url: `/admin/customer/${customer_id}/permissions`,
                method: 'PUT',
                body: payload,
            }),
        }),
        getCustomerTimeline: build.query<ApiResponse<CustomerTimeline[]>, { customer_id: number }>({
            query: ({ customer_id }) => ({
                url: `/admin/customer/${customer_id}/history`,
                method: 'GET',
            }),
        }),
        addCustomerRelative: build.mutation<
            ApiResponse<CustomerItem>,
            { customer_id: number; payload: { relative_customer_id: number; relation_type: string } }
        >({
            query: ({ customer_id, payload }) => ({
                url: `/admin/customer/${customer_id}/relative`,
                method: 'POST',
                body: payload,
            }),
        }),
        deleteCustomerRelative: build.mutation<
            ApiResponse<CustomerItem>,
            { customer_id: number; relative_customer_id: number }
        >({
            query: ({ customer_id, relative_customer_id }) => ({
                url: `/admin/customer/${customer_id}/relative/${relative_customer_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetCustomerListQuery,
    useLazyGetCustomerListQuery,
    useGetCustomerDetailQuery,
    useCreateCustomerMutation,
    useGetCustomerByGroupCustomerQuery,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetCustomerAccountPermissionsQuery,
    useUpdateCustomerAccountPermissionsMutation,
    useGetCustomerTimelineQuery,
    useAddCustomerRelativeMutation,
    useDeleteCustomerRelativeMutation,
} = customerApi

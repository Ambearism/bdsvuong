import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    AccountItem,
    AccountListParams,
    AccountListResponse,
    CreateAccountRequest,
    UpdateAccountRequest,
    UpdateAccountRoleRequest,
    UpdateAccountStatusRequest,
    AccountStatisticsResponse,
    AccountOptionResponse,
} from '@/types/account'

export const accountApi = api.injectEndpoints({
    endpoints: build => ({
        getAccountList: build.query<ApiResponse<AccountListResponse>, AccountListParams>({
            query: params => ({
                url: '/admin/accounts',
                method: 'GET',
                params,
            }),
        }),
        getAccountListAll: build.query<ApiResponse<AccountListResponse>, AccountListParams>({
            query: params => ({
                url: '/admin/accounts/all',
                method: 'GET',
                params,
            }),
        }),
        getAccountDetail: build.query<ApiResponse<AccountItem>, number>({
            query: id => ({
                url: `/admin/accounts/${id}`,
                method: 'GET',
            }),
        }),
        createAccount: build.mutation<ApiResponse<AccountItem>, CreateAccountRequest>({
            query: payload => ({
                url: '/admin/accounts',
                method: 'POST',
                body: payload,
            }),
        }),
        updateAccount: build.mutation<ApiResponse<AccountItem>, { id: number; payload: UpdateAccountRequest }>({
            query: ({ id, payload }) => ({
                url: `/admin/accounts/${id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteAccount: build.mutation<ApiResponse<unknown>, number>({
            query: id => ({
                url: `/admin/accounts/${id}`,
                method: 'DELETE',
            }),
        }),
        updateAccountRole: build.mutation<ApiResponse<unknown>, { id: number; payload: UpdateAccountRoleRequest }>({
            query: ({ id, payload }) => ({
                url: `/admin/accounts/${id}/role`,
                method: 'PUT',
                body: payload,
            }),
        }),
        updateAccountStatus: build.mutation<ApiResponse<unknown>, { id: number; payload: UpdateAccountStatusRequest }>({
            query: ({ id, payload }) => ({
                url: `/admin/accounts/${id}/status`,
                method: 'PUT',
                body: payload,
            }),
        }),
        getAccountStatistics: build.query<ApiResponse<AccountStatisticsResponse>, void>({
            query: () => ({
                url: '/admin/accounts/statistics',
                method: 'GET',
            }),
        }),
        getAccountOptions: build.query<ApiResponse<AccountOptionResponse>, AccountListParams>({
            query: params => ({
                url: '/admin/options/accounts',
                method: 'GET',
                params,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetAccountListQuery,
    useGetAccountListAllQuery,
    useGetAccountDetailQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
    useUpdateAccountRoleMutation,
    useUpdateAccountStatusMutation,
    useGetAccountStatisticsQuery,
    useGetAccountOptionsQuery,
} = accountApi

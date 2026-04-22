import type {
    TransactionChartStatistics,
    TransactionChartStatisticsParams,
    TransactionCreateInput,
    TransactionListResponse,
    TransactionListParams,
    TransactionItem,
    TransactionUpdateInput,
    TransactionStatistics,
} from '@/types/opportunity'
import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const transactionApi = api.injectEndpoints({
    endpoints: build => ({
        getTransactionList: build.query<ApiResponse<TransactionListResponse>, TransactionListParams>({
            query: params => ({
                url: '/admin/transactions',
                method: 'GET',
                params,
            }),
        }),
        getTransactionDetail: build.query<ApiResponse<TransactionItem>, { transaction_id: number }>({
            query: ({ transaction_id }) => ({
                url: `/admin/transactions/${transaction_id}`,
                method: 'GET',
            }),
        }),
        createTransaction: build.mutation<ApiResponse<TransactionItem>, TransactionCreateInput>({
            query: payload => ({
                url: '/admin/transactions',
                method: 'POST',
                body: payload,
            }),
        }),
        updateTransaction: build.mutation<
            ApiResponse<TransactionItem>,
            { transaction_id: number; payload: TransactionUpdateInput }
        >({
            query: ({ transaction_id, payload }) => ({
                url: `/admin/transactions/${transaction_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        changeTransactionStage: build.mutation<
            ApiResponse<TransactionItem>,
            { transaction_id: number; payload: TransactionUpdateInput }
        >({
            query: ({ transaction_id, payload }) => ({
                url: `/admin/transactions/${transaction_id}/change-stage`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteTransaction: build.mutation<ApiResponse<string>, { transaction_id: number }>({
            query: ({ transaction_id }) => ({
                url: `/admin/transactions/${transaction_id}`,
                method: 'DELETE',
            }),
        }),
        getTransactionStatistics: build.query<ApiResponse<TransactionStatistics>, TransactionListParams>({
            query: params => ({
                url: '/admin/transactions/statistics',
                method: 'GET',
                params,
            }),
        }),
        getTransactionChartStatistics: build.query<
            ApiResponse<TransactionChartStatistics>,
            TransactionChartStatisticsParams
        >({
            query: params => ({
                url: '/admin/transactions/statistics/revenue-chart',
                method: 'GET',
                params,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetTransactionListQuery,
    useGetTransactionDetailQuery,
    useCreateTransactionMutation,
    useUpdateTransactionMutation,
    useChangeTransactionStageMutation,
    useDeleteTransactionMutation,
    useGetTransactionStatisticsQuery,
    useGetTransactionChartStatisticsQuery,
} = transactionApi

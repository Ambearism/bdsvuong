import type { ApiResponse } from '@/types'
import type {
    TaxPaymentHistoryItem,
    TaxPaymentHistoryCreateInput,
    TaxPaymentHistoryUpdateInput,
    ListTaxPaymentHistoryOutput,
} from '@/types/tax-payment-history'
import { api } from '@/api'

export const taxPaymentHistoryApi = api.injectEndpoints({
    endpoints: build => ({
        getTaxPaymentHistories: build.query<ApiResponse<ListTaxPaymentHistoryOutput>, number>({
            query: care_case_id => ({
                url: `/admin/tax-payment-histories/case/${care_case_id}`,
                method: 'GET',
            }),
        }),
        getTaxPaymentHistoryDetail: build.query<ApiResponse<TaxPaymentHistoryItem>, number>({
            query: id => ({
                url: `/admin/tax-payment-histories/${id}`,
                method: 'GET',
            }),
        }),
        createTaxPaymentHistory: build.mutation<ApiResponse<TaxPaymentHistoryItem>, TaxPaymentHistoryCreateInput>({
            query: payload => ({
                url: '/admin/tax-payment-histories',
                method: 'POST',
                body: payload,
            }),
        }),
        updateTaxPaymentHistory: build.mutation<
            ApiResponse<TaxPaymentHistoryItem>,
            { id: number; payload: TaxPaymentHistoryUpdateInput; care_case_id: number }
        >({
            query: ({ id, payload }) => ({
                url: `/admin/tax-payment-histories/${id}`,
                method: 'PATCH',
                body: payload,
            }),
        }),
        deleteTaxPaymentHistory: build.mutation<ApiResponse<boolean>, { id: number; care_case_id: number }>({
            query: ({ id }) => ({
                url: `/admin/tax-payment-histories/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetTaxPaymentHistoriesQuery,
    useGetTaxPaymentHistoryDetailQuery,
    useCreateTaxPaymentHistoryMutation,
    useUpdateTaxPaymentHistoryMutation,
    useDeleteTaxPaymentHistoryMutation,
} = taxPaymentHistoryApi

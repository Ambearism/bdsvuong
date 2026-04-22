import type { ApiResponse } from '@/types'
import type {
    LeaseContractCreateInput,
    LeaseContractBase,
    LeaseContractListParams,
    LeaseContractListResponse,
    LeaseContractInvoiceBase,
    LeaseContractInvoiceCreateInput,
    LeaseContractPaymentBase,
    LeaseContractPaymentCreateInput,
    LeaseContractPaymentAllocationUpdateInput,
    LeaseContractPaymentListParams,
    LeaseContractPaymentListResponse,
    LeaseContractPaymentUpdateInput,
    LeaseContractTransferInput,
    LeaseContractTransferBase,
    LeaseContractItem,
    LeaseContractRenewInput,
    LeaseContractUpdateInput,
    LeaseContractStatusUpdateInput,
} from '@/types/lease-contract'
import { api } from '@/api'
import { normalizeFileUrls } from '@/lib/utils'
import type { DebtNoteBase, DebtNoteCreateInput, DebtNoteListResponse } from '@/types/debt-note'
import type { LeaseContractTimelineResponse } from '@/types/lease-contract'

export const leaseContractApi = api.injectEndpoints({
    endpoints: build => ({
        getLeaseContractList: build.query<ApiResponse<LeaseContractListResponse>, LeaseContractListParams>({
            query: params => ({
                url: '/admin/lease-contracts',
                method: 'GET',
                params,
            }),
        }),
        createLeaseContract: build.mutation<ApiResponse<LeaseContractBase>, LeaseContractCreateInput>({
            query: rawPayload => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as LeaseContractCreateInput & { file_urls?: string[] | string })

                return {
                    url: '/admin/lease-contracts',
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        renewLeaseContract: build.mutation<ApiResponse<LeaseContractItem>, LeaseContractRenewInput>({
            query: ({ lease_contract_id, ...rawPayload }) => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as Omit<LeaseContractRenewInput, 'lease_contract_id'> & { file_urls?: string[] | string })

                return {
                    url: `/admin/lease-contracts/${lease_contract_id}/renew`,
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        updateLeaseContract: build.mutation<
            ApiResponse<LeaseContractItem>,
            { lease_contract_id: number; payload: LeaseContractUpdateInput }
        >({
            query: ({ lease_contract_id, payload }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        updateLeaseContractStatus: build.mutation<
            ApiResponse<LeaseContractItem>,
            { lease_contract_id: number; payload: LeaseContractStatusUpdateInput }
        >({
            query: ({ lease_contract_id, payload }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}/status`,
                method: 'PUT',
                body: payload,
            }),
        }),
        getLeaseContractInvoices: build.query<ApiResponse<LeaseContractInvoiceBase[]>, { lease_contract_id: number }>({
            query: ({ lease_contract_id }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}/invoices`,
                method: 'GET',
            }),
        }),
        createLeaseContractInvoice: build.mutation<
            ApiResponse<LeaseContractInvoiceBase>,
            LeaseContractInvoiceCreateInput
        >({
            query: ({ lease_contract_id, ...rawPayload }) => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as LeaseContractInvoiceCreateInput & { file_urls?: string[] | string })

                return {
                    url: `/admin/lease-contracts/${lease_contract_id}/invoices`,
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        getLeaseContractDebtNotes: build.query<ApiResponse<DebtNoteListResponse>, { lease_contract_id: number }>({
            query: ({ lease_contract_id }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}/debt-notes`,
                method: 'GET',
            }),
        }),
        getLeaseContractDetail: build.query<ApiResponse<LeaseContractItem>, { lease_contract_id: number }>({
            query: ({ lease_contract_id }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}`,
                method: 'GET',
            }),
        }),
        getLeaseContractPaymentList: build.query<
            ApiResponse<LeaseContractPaymentListResponse>,
            LeaseContractPaymentListParams
        >({
            query: params => ({
                url: '/admin/lease-contracts/payments',
                method: 'GET',
                params,
            }),
        }),
        createLeaseContractPayment: build.mutation<
            ApiResponse<LeaseContractPaymentBase>,
            LeaseContractPaymentCreateInput
        >({
            query: rawPayload => {
                const payload = normalizeFileUrls({
                    ...rawPayload,
                } as LeaseContractPaymentCreateInput & { file_urls?: string[] | string })

                return {
                    url: '/admin/lease-contracts/payments',
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        createLeaseContractTransfer: build.mutation<ApiResponse<LeaseContractTransferBase>, LeaseContractTransferInput>(
            {
                query: rawPayload => {
                    const payload = normalizeFileUrls({
                        ...rawPayload,
                    } as LeaseContractTransferInput & { file_urls?: string[] | string })

                    return {
                        url: '/admin/lease-contracts/transfer',
                        method: 'POST',
                        body: payload,
                    }
                },
            },
        ),
        updateLeaseContractPayment: build.mutation<
            ApiResponse<LeaseContractPaymentBase>,
            { payment_id: number; payload: LeaseContractPaymentUpdateInput }
        >({
            query: ({ payment_id, payload }) => ({
                url: `/admin/lease-contracts/payments/${payment_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        updateLeaseContractPaymentAllocations: build.mutation<
            ApiResponse<LeaseContractPaymentBase>,
            { payment_id: number; payload: LeaseContractPaymentAllocationUpdateInput }
        >({
            query: ({ payment_id, payload }) => ({
                url: `/admin/lease-contracts/payments/${payment_id}/allocations`,
                method: 'PATCH',
                body: payload,
            }),
        }),
        createLeaseContractDebtNote: build.mutation<ApiResponse<DebtNoteBase>, DebtNoteCreateInput>({
            query: payload => ({
                url: `/admin/lease-contracts/${payload.target_id}/debt-notes`,
                method: 'POST',
                body: payload,
            }),
        }),
        deleteLeaseContractDebtNote: build.mutation<ApiResponse<{ message: string }>, { debt_note_id: number }>({
            query: ({ debt_note_id }) => ({
                url: `/admin/debt-notes/${debt_note_id}`,
                method: 'DELETE',
            }),
        }),
        getLeaseContractTimeline: build.query<
            ApiResponse<LeaseContractTimelineResponse>,
            { lease_contract_id: number }
        >({
            query: ({ lease_contract_id }) => ({
                url: `/admin/lease-contracts/${lease_contract_id}/timeline`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetLeaseContractListQuery,
    useCreateLeaseContractMutation,
    useRenewLeaseContractMutation,
    useUpdateLeaseContractMutation,
    useUpdateLeaseContractStatusMutation,
    useGetLeaseContractInvoicesQuery,
    useCreateLeaseContractInvoiceMutation,
    useGetLeaseContractDebtNotesQuery,
    useGetLeaseContractDetailQuery,
    useGetLeaseContractPaymentListQuery,
    useCreateLeaseContractPaymentMutation,
    useCreateLeaseContractTransferMutation,
    useUpdateLeaseContractPaymentMutation,
    useUpdateLeaseContractPaymentAllocationsMutation,
    useCreateLeaseContractDebtNoteMutation,
    useDeleteLeaseContractDebtNoteMutation,
    useGetLeaseContractTimelineQuery,
} = leaseContractApi

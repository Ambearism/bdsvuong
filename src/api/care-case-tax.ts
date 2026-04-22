import type { ApiResponse } from '@/types'
import type { CareCaseRevenueOutput, CareCaseRevenueParams } from '@/types/care-case-tax'
import type { LeaseContractItem } from '@/types/lease-contract'
import { api } from '@/api'

export const careCaseTaxApi = api.injectEndpoints({
    endpoints: build => ({
        getCareCaseRevenue: build.query<ApiResponse<CareCaseRevenueOutput>, CareCaseRevenueParams>({
            query: ({ care_case_id, start_date, end_date }) => ({
                url: `/admin/care-cases/${care_case_id}/revenue`,
                method: 'GET',
                params: { start_date, end_date },
            }),
        }),
        getCareCaseContracts: build.query<ApiResponse<LeaseContractItem[]>, number>({
            query: care_case_id => ({
                url: `/admin/care-cases/${care_case_id}/contracts`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetCareCaseRevenueQuery, useGetCareCaseContractsQuery } = careCaseTaxApi

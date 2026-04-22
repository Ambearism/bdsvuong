import type {
    DashboardInventoryByPeriodParams,
    DashboardInventoryByPeriodResponse,
    DashboardInventoryResponse,
    DashboardOverviewInventoryResponse,
    DashboardProductLogsResponse,
    DashboardStatisticResponse,
    EmployeeConversionRateItem,
    EmployeeTransactionValueResponse,
} from '@/types/dashboard'

import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const dashboardApi = api.injectEndpoints({
    endpoints: build => ({
        getDashboardInventory: build.query<
            ApiResponse<DashboardInventoryByPeriodResponse>,
            DashboardInventoryByPeriodParams
        >({
            query: params => ({
                url: '/admin/statistics/inventory',
                method: 'GET',
                params,
            }),
        }),
        getDashboardDetailsInventory: build.query<ApiResponse<DashboardInventoryResponse>, void>({
            query: () => ({
                url: '/admin/statistics/details-inventory',
                method: 'GET',
            }),
        }),
        getDashboardProductLogsDaily: build.query<
            ApiResponse<DashboardProductLogsResponse>,
            DashboardInventoryByPeriodParams
        >({
            query: params => ({
                url: '/admin/product/logs',
                method: 'GET',
                params,
            }),
        }),
        getDashboardOverviewInventory: build.query<
            ApiResponse<DashboardOverviewInventoryResponse>,
            DashboardInventoryByPeriodParams
        >({
            query: params => ({
                url: '/admin/statistics/overview-inventory',
                method: 'GET',
                params,
            }),
        }),
        getDashboardStatistics: build.query<ApiResponse<DashboardStatisticResponse>, DashboardInventoryByPeriodParams>({
            query: params => ({
                url: '/admin/statistics/dashboard',
                method: 'GET',
                params,
            }),
        }),
        getEmployeeConversionRate: build.query<
            ApiResponse<EmployeeConversionRateItem[]>,
            DashboardInventoryByPeriodParams
        >({
            query: params => ({
                url: '/admin/statistics/employee-conversion-rate',
                method: 'GET',
                params,
            }),
        }),
        getEmployeeTransactionValue: build.query<
            ApiResponse<EmployeeTransactionValueResponse>,
            DashboardInventoryByPeriodParams
        >({
            query: params => ({
                url: '/admin/statistics/employee-transaction-value',
                method: 'GET',
                params,
            }),
        }),
    }),
})

export const {
    useGetDashboardInventoryQuery,
    useGetDashboardDetailsInventoryQuery,
    useGetDashboardOverviewInventoryQuery,
    useGetDashboardProductLogsDailyQuery,
    useGetDashboardStatisticsQuery,
    useGetEmployeeConversionRateQuery,
    useGetEmployeeTransactionValueQuery,
} = dashboardApi

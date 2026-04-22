import type {
    CHART_LOG_TYPE,
    DASHBOARD_TABLE_SHOW_ONLY,
    PRODUCT_LOG_TYPE,
    PRODUCT_TRANSACTION,
} from '@/config/constant'
import type { PeriodType } from '@/types'

export type DashboardTransactionKeyType = keyof typeof PRODUCT_TRANSACTION

export type DashboardTableShowOnlyType = (typeof DASHBOARD_TABLE_SHOW_ONLY)[keyof typeof DASHBOARD_TABLE_SHOW_ONLY]

export interface DashboardInventoryLocalFilter {
    product_transaction_type: DashboardTransactionKeyType | undefined
    product_show_only: DashboardTableShowOnlyType | undefined
    product_type_ids: number[]
}

export type DashboardProductValueItem = {
    SELL: {
        count: number
        value: number
        fee: number
    }
    RENT: {
        count: number
        value: number
        fee: number
    }
}

export type DashboardProductDetailsAndValueItem = {
    type_product_name_or_total: string
    owner: DashboardProductValueItem
    broker: DashboardProductValueItem
    total_by_type: DashboardProductValueItem
    waiting_sale: DashboardProductValueItem
    not_sold: DashboardProductValueItem
    deposited: DashboardProductValueItem
    sold: DashboardProductValueItem
    cancelled: DashboardProductValueItem
    total: DashboardProductValueItem
}

export interface DashboardInventoryByPeriodParams {
    period_type: PeriodType
    start_date?: string
    end_date?: string
}

export interface DashboardInventoryByPeriodResponse {
    total_sell_value_billion: number
    total_rent_value_million: number
    by_type_data: ByTypeData[]
}

export interface DashboardInventoryResponse {
    total_sell_value_billion: number
    total_rent_value_million: number
    by_type_data: ByTypeData[]
}

export interface ByTypeData {
    product_type_id: number
    product_type_name: string
    sell_value: number
    rent_value: number
    quantity: number
    sell_count: number
    rent_count: number
    sell_fee: number
    rent_fee: number
    sell_owner_count: number
    sell_owner_value: number
    sell_owner_fee: number
    sell_broker_count: number
    sell_broker_value: number
    sell_broker_fee: number
    sell_waiting_count: number
    sell_waiting_value: number
    sell_waiting_fee: number
    sell_not_waiting_count: number
    sell_not_waiting_value: number
    sell_not_waiting_fee: number
    sell_deposit_count: number
    sell_deposit_value: number
    sell_deposit_fee: number
    sell_sold_count: number
    sell_sold_value: number
    sell_sold_fee: number
    sell_cancelled_count: number
    sell_cancelled_value: number
    sell_cancelled_fee: number
    rent_owner_count: number
    rent_owner_value: number
    rent_owner_fee: number
    rent_broker_count: number
    rent_broker_value: number
    rent_broker_fee: number
    rent_waiting_count: number
    rent_waiting_value: number
    rent_waiting_fee: number
    rent_not_waiting_count: number
    rent_not_waiting_value: number
    rent_not_waiting_fee: number
    rent_deposit_count: number
    rent_deposit_value: number
    rent_deposit_fee: number
    rent_sold_count: number
    rent_sold_value: number
    rent_sold_fee: number
    rent_cancelled_count: number
    rent_cancelled_value: number
    rent_cancelled_fee: number
}

export interface OverviewByTypeData {
    product_type_id: number
    product_type_name: string
    sell_value: number
    rent_value: number
}

export interface DashboardOverviewInventoryResponse {
    value_inventory_by_type_chart: OverviewByTypeData[]
}

export interface DashboardProductLogPayload {
    price?: number
    [key: string]: unknown
}
export interface DashboardProductLogItem {
    id: number
    product_id: number
    type: ProductLogTypeKey
    old: DashboardProductLogPayload | null
    new: DashboardProductLogPayload | null
    reason: string
    created_at: string
    updated_at: string | null
    created_by: number
    updated_by: number | null
    created_by_name: string
}
export interface DashboardProductLogsResponse {
    items: DashboardProductLogItem[]
    total: number
}

export type ProductLogTypeKey = keyof typeof PRODUCT_LOG_TYPE

export type ChartLogType = (typeof CHART_LOG_TYPE)[keyof typeof CHART_LOG_TYPE]

export interface AggregatedLogData {
    CREATE: number
    EDIT_PRICE: number
    CHANGE_STATUS: number
    EDIT_INFO: number
    TOTAL: number
}

export interface DashboardStatisticOverviewItem {
    value: number
    unit: string | null
    change_value: number
    change_percent: number
    trend: string
}

export interface DashboardStatisticOverview {
    new_leads: DashboardStatisticOverviewItem
    open_deals: DashboardStatisticOverviewItem
    won_deals: DashboardStatisticOverviewItem
    completed_transactions: DashboardStatisticOverviewItem
    inventory_value: DashboardStatisticOverviewItem
    lead_to_transaction_rate: DashboardStatisticOverviewItem
}

export interface DashboardStatisticFunnelItem {
    stage_name: string
    stage_id: number
    count: number
    conversion_rate: number
}

export interface DashboardStatisticResponse {
    overview: DashboardStatisticOverview
    funnel: DashboardStatisticFunnelItem[]
}

export interface EmployeeConversionRateItem {
    name: string
    value: number
}

export interface EmployeeTransactionValueSeriesItem {
    name: string
    data: number[]
}

export interface EmployeeTransactionValueResponse {
    categories: string[]
    series: EmployeeTransactionValueSeriesItem[]
}

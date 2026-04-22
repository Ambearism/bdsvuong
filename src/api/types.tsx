import { api } from '@/api'
import type { ApiResponse } from '@/types'

export type ApiEnumType =
    | 'account_types'
    | 'category_status'
    | 'category_targets'
    | 'category_types'
    | 'direction_types'
    | 'exchange_status'
    | 'fit_types'
    | 'interaction_types'
    | 'priority_types'
    | 'product_status'
    | 'product_types'
    | 'project_types'
    | 'publish_status'
    | 'publish_types'
    | 'rent_status'
    | 'sell_status'
    | 'share_account_status'
    | 'status_work_types'
    | 'supplier_types'
    | 'tax_types'
    | 'transaction_types'
    | 'furniture_types'
    | 'convenient_types'
    | 'view_types'
    | 'project_status'
    | 'legal_status'
    | 'lead_source'
    | 'opportunity_stage'
    | 'transaction_stage'

export type EnumItem = {
    value: number | string
    label: string
}

export type EnumData = {
    [key: string]: EnumItem[]
}

export const typesApi = api.injectEndpoints({
    endpoints: build => ({
        getEnumOptions: build.query<ApiResponse<EnumData>, string[]>({
            query: enumNames => {
                const params = new URLSearchParams()
                enumNames.forEach(name => params.append('enum_names', name))
                return `/public/enums?${params.toString()}`
            },
        }),
    }),
})

export const { useGetEnumOptionsQuery } = typesApi

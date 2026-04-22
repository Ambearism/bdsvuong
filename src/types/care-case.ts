import type { StatusValue } from '@/config/constant'

export interface CareCaseItem {
    id: number
    case_code: string
    customer_name: string
    customer_id?: number
    linked_assets: number
    link_contracts_count: number
    related_bds?: number | number[]
    care_fee?: number
    care_fee_display?: string
    last_interaction_display?: string
    assigned_to_name?: string
    assigned_to?: number
    assigned_to_initial: string
    links?: string
    note?: string
    status: StatusValue
    contract_files?: string
    updated_at: string
    images?: string[]
    tax_threshold?: number
    tax_rate?: number
    tax_method?: string
    customer?: {
        id: number
        name: string
        phone: string
        full_name?: string
    }
    product_info?: Array<{
        id: number
        product_code: string
        name: string
        type?: string
    }>
}

export interface CareCaseListParams {
    page?: number
    per_page?: number
    status?: StatusValue
    keyword?: string
}

export interface CareCaseCreateInput {
    customer_id: number
    related_bds: number[]
    links?: string
    care_fee?: number
    assigned_to?: number
    note?: string
    status?: StatusValue
    contract_files?: string
    tax_threshold?: number
    tax_rate?: number
    tax_method?: string
}

export interface CareCaseUpdateInput {
    customer_id?: number
    related_bds?: number[]
    links?: string
    care_fee?: number
    assigned_to?: number
    note?: string
    contract_files?: string
    tax_threshold?: number
    tax_rate?: number
    tax_method?: string
}

export interface CareCaseFormValues {
    customer_id?: number | string
    related_bds?: number[]
    assigned_to?: number | string
    care_fee?: number
    note?: string
    contract_files?: string
    images?: { originFileObj?: File; [key: string]: unknown }[]
}

export interface CustomerSelectOption {
    data: {
        name?: string
        phone?: string
        label?: string
    }
}

export interface RealEstateSelectOption {
    value: number
    data: {
        label: string
    }
}

export interface CareCaseStatisticsOutput {
    total_cases: number
    linked_assets: number
    total_contracts: number
    total_care_costs: string
}

import type { SearchParams } from '@/types'

export interface AccountItem {
    id: number
    account_name: string
    full_name: string
    phone: string
    email: string
    birthday: string | null
    image_url: string | null
    job_title: string | null
    experience_years: string | null
    specialized: string | null
    facebook: string | null
    is_admin: boolean
    is_active: boolean
    is_block: boolean
    is_reputation: boolean
    is_publish_store: boolean
    is_publish_product: boolean
    is_news_store: boolean
    is_classified_store: boolean
    is_off: boolean
    type_account_id: string
    last_ip_login: string | null
    last_time_login: string | null
    otp_login: string | null
    share_store: boolean
    role_id: number | null
    created_at: string
    updated_at: string
    google_access_token?: string
}

export interface AccountSimpleReponse {
    id: number
    account_name?: string
    full_name?: string
    email?: string
    phone?: string
}

export type AccountListResponse = {
    list: AccountItem[]
    total: number
}

export type CreateAccountRequest = {
    account_name: string
    password?: string
    full_name: string
    phone: string
    email: string
    type_account_id: 'STAFF' | string
    role_id: number
    is_active: boolean

    specialized?: string
    job_title?: string
    experience_years?: string
    facebook?: string
    birthday?: string
    image_url?: string
}

export type UpdateAccountRequest = CreateAccountRequest

export type UpdateAccountRoleRequest = {
    role_id: number
}

export type UpdateAccountStatusRequest = {
    is_active: boolean
    replacement_id?: number
}

export type AccountListParams = SearchParams

export interface AccountStats {
    lead_stats: {
        new: number
        nurturing: number
        cancelled: number
    }
    deal_stats: {
        open: number
        traded: number
        cancelled: number
    }
    successful_transactions: number
    contract_stats: {
        buy: number
        rent: number
    }
    conversion_rates: {
        lead_to_deal: number
        lead_to_gd: number
        deal_to_gd: number
    }
    revenue_stats: {
        total: number
        avg_per_deal: number
        commission: number
    }
}

export interface AccountStatisticItem {
    account_id: number
    account_name: string
    full_name: string
    stats: AccountStats
}

export interface AccountStatisticsResponse {
    list: AccountStatisticItem[]
    total: number
}

export interface AccountOption {
    value: number
    label: string
}

export interface AccountOptionResponse {
    items: AccountOption[]
    total: number
}

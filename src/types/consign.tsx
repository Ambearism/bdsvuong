import type { ListResponse, SearchParams } from '@/types'

export type ConsignBase = {
    name_customer: string
    phone_customer: string
    email_customer: string
    type_transaction_id: string
    type_product_id: number
    note: string
    files: string[]
}

export type ConsignItem = ConsignBase & {
    id: number
    created_at: string
    updated_at: string

    type_transaction_name: string
    type_product_name: string
}

export type ConsignListRequest = SearchParams & {
    id?: number
    type_transaction_id?: string
    type_product_id?: number
    start_date?: string | null
    end_date?: string | null
}

export type ConsignListResponse = ListResponse<ConsignItem>

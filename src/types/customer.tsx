import type { ListResponse, SearchParams } from '@/types'
import type { AccountItem } from '@/types/account'
import type { Dayjs } from 'dayjs'

export type CustomerBase = {
    name: string
    gender: boolean
    phone: string
    email?: string
    zone_province_id?: number
    zone_ward_id?: number
    address?: string
    work_place?: string
    facebook?: string
    birthday?: string | Dayjs
    note?: string
    phone_other?: string
    is_supplier: boolean
    is_agency: boolean
    is_master: boolean
    is_relative: boolean
    is_relatived: boolean
    is_share: boolean
    product_ids?: string
    group_ids?: string
    lead_source?: number
    assigned_to?: number
}

export type CustomerItem = CustomerBase & {
    id: number

    created_at: string
    updated_at: string
    zone_province_name: string
    zone_ward_name: string

    assigned_to_info?: AccountItem
    total_leads: number
    total_deals: number
    customer_permissions?: string[]
    relatives_from?: CustomerRelativeItem[]
    relatives_to?: CustomerRelativeItem[]
    relatives?: CustomerRelativeItem[]
}

export type CustomerRelativeItem = {
    id: number
    customer_id: number
    relative_customer_id: number
    relation_type: string
    relative_customer?: CustomerItem
    customer_rel?: CustomerItem
    relative_customer_rel?: CustomerItem
    created_at?: string
    displayRelative?: CustomerItem
    isFrom?: boolean
}

export type CustomerCreateInput = Partial<CustomerBase> & {
    name: string
    phone: string
}

export type CustomerRelativeCreateInput = {
    relative_customer_id: number
    relation_type: string
}

export type CustomerUpdateInput = Partial<CustomerBase>

export type CustomerListParams = SearchParams & {
    keyword?: string
    response?: string
}

export type CustomerListResponse = ListResponse<CustomerItem>

export type CustomerPermissionItem = {
    account_id: number
    action: string
}

export type UpdateCustomerPermissionRequest = {
    items: CustomerPermissionItem[]
}

export type CustomerTimeline = {
    created_at: string
    updated_at?: string | null
    created_by?: number | null
    updated_by?: number | null
    id: number
    customer_id: number
    type?: string
    entity_type?: string
    entity_id?: number
    action_type?: number | string
    from_stage?: number | null
    to_stage?: number | null
    duration_in_previous_stage?: number
    changed_by?: number | null
    changed_at?: string
    title?: string | null
    notes?: string | null
    assigned_to?: number | null
    due_date?: string | null
    status?: string | null
    old?: Record<string, unknown> | null
    new?: Record<string, unknown> | null
    reason?: string
    created_by_name?: string
    changed_by_name?: string
    changed_by_info?: {
        id: number
        account_name: string
        full_name?: string
    } | null
}

export type LinkedProductItem = {
    id: number
    name: string
    code?: string
    role: string
    rawRole: number
    price?: number
    ownership?: string
    note?: string
    slug?: string
    status_label?: string
    isTransaction?: boolean
    transactionStage?: number
}

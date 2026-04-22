import type { ListResponse, SearchParams } from '@/types'

export type GroupCustomerBase = {
    name: string
    content?: string | null
    parent_id?: number | null
}

export type GroupCustomerItem = GroupCustomerBase & {
    id: number
    created_at: string
    updated_at: string
}

export type GroupCustomerUpdateInput = GroupCustomerBase

export type GroupCustomerCreateInput = GroupCustomerBase

export type GroupCustomerOutput = GroupCustomerItem

export type GroupCustomerListParams = SearchParams

export type GroupCustomerListResponse = ListResponse<GroupCustomerItem>

export type GroupCustomerNode = GroupCustomerItem & {
    children?: GroupCustomerNode[]
}

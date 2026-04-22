import type { ListResponse, SearchParams } from '@/types'

export type RoleItem = {
    id: number
    name: string
    created_at: string
    updated_at: string | null
    created_by: string | null
    updated_by: string | null
}

export type RoleCreatePayload = {
    name: string
}

export type RoleUpdatePayload = {
    name: string
}

export type RoleListParams = SearchParams

export type RoleListResponse = ListResponse<RoleItem>

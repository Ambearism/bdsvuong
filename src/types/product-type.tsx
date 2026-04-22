import type { ListResponse } from '@/types'
export type ProductTypeBase = {
    id?: number
    name: string
    slug: string
    color: string
    status: boolean
    description?: string
    meta_title?: string
    meta_description?: string
    meta_robots?: string
}

export type ProductTypeCreateInput = ProductTypeBase

export type ProductTypeUpdateInput = Partial<ProductTypeBase>

export type ProductTypeItem = ProductTypeBase & {
    id: number
    created_at: string
    updated_at: string
}

export type ProductTypeOutput = ProductTypeItem

export type ProductTypeListResponse = ListResponse<ProductTypeItem>

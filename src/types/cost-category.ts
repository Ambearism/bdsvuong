import { COST_CATEGORY_TYPE } from '@/config/constant'

export type CostCategoryType = (typeof COST_CATEGORY_TYPE)[keyof typeof COST_CATEGORY_TYPE]

export interface CostCategoryGroup {
    id: number
    code: string
    name: string
    description?: string
    type: CostCategoryType
    display_order: number
    is_active: boolean
    is_default_seeded: boolean
    items?: CostCategoryItem[]
}

export interface CostCategoryItem {
    id: number
    group_id: number
    code: string
    name: string
    description?: string
    examples?: string
    tenant_related_flag: boolean
    is_tax_deductible: boolean
    requires_attachment: boolean
    is_active: boolean
    display_order: number
    is_default_seeded: boolean
}

export interface CostCategoryGroupCreateInput {
    code: string
    name: string
    description?: string
    type: CostCategoryType
    display_order?: number
    is_active?: boolean
}

export interface CostCategoryGroupUpdateInput {
    code?: string
    name?: string
    description?: string
    type?: CostCategoryType
    display_order?: number
    is_active?: boolean
    is_default_seeded?: boolean
}

export interface CostCategoryItemCreateInput {
    group_id: number
    code: string
    name: string
    description?: string
    examples?: string
    tenant_related_flag?: boolean
    is_tax_deductible?: boolean
    requires_attachment?: boolean
    is_active?: boolean
    display_order?: number
}

export interface CostCategoryItemUpdateInput {
    group_id?: number
    code?: string
    name?: string
    description?: string
    examples?: string
    tenant_related_flag?: boolean
    is_tax_deductible?: boolean
    requires_attachment?: boolean
    is_active?: boolean
    display_order?: number
    is_default_seeded?: boolean
}

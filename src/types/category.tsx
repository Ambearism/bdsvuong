import type { CATEGORY_MAP } from '@/config/constant'
import type { ListResponse, SearchParams } from '@/types'

export type CategoryBase = {
    id: number
    name: string
    name_id?: string
    url?: string
    status?: string
    type?: string
    parent_id?: number | null
    project_id?: number | null
    description?: string
    target?: string
    accept_news?: boolean
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    seo_robots?: string
    is_home?: number
    position_home?: number
    position?: number
    is_del?: boolean
}

export type CategoryCreateInput = Omit<CategoryBase, 'id'>
export type CategoryUpdateInput = Partial<CategoryCreateInput>

export type CategoryItem = CategoryBase & {
    created_at: string
    updated_at: string
    parent_name?: string
    project_name?: string
    children?: CategoryItem[]
}

export type CategoryOutput = CategoryItem

export type CategoryListParams = SearchParams & {
    type?: string
    parent_id?: number
    project_id?: number
    accept_news?: boolean
}

export type CategoryType = keyof typeof CATEGORY_MAP

export type CategoryListResponse = ListResponse<CategoryItem>

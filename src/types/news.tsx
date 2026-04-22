import type { ListResponse, SearchParams } from '@/types'

export type NewsBase = {
    id: number
    name: string
    name_slug?: string
    brief?: string
    description?: string
    type?: string
    publish?: boolean
    image_url?: string
    hitcount?: number
    position?: number
    keywords?: string
    tags?: string
    category_ids?: number[]
    for_project?: boolean
    project_ids?: number[]
    project_category_ids?: number[]
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    seo_robots?: string
    is_primary?: boolean
    portal_id?: string
    is_hot?: boolean
    is_del?: boolean
}

export type NewsCreateInput = Omit<NewsBase, 'id'>
export type NewsUpdateInput = Partial<NewsCreateInput>

export type NewsItem = NewsBase & {
    created_at: string
    updated_at: string
    category_names?: string[]
    project_names?: string[]
}

export type NewsOutput = NewsItem

export type NewsSortField = 'name' | 'created_at' | 'updated_at' | 'hitcount' | 'is_hot'

export type NewsListParams = SearchParams & {
    category_id?: number
    project_id?: number
    is_hot?: boolean
    publish?: boolean
    order_by?: NewsSortField
    order_dir?: 'asc' | 'desc'
}

export type NewsListResponse = ListResponse<NewsItem>

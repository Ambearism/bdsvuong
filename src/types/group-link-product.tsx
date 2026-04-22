import type { ListResponse, SearchParams } from '@/types'

export type GroupLinkProductBase = {
    id: number
    title: string | null
    url: string | null
    cond: Record<string, unknown> | null
    project_id: number | null
    hitcount: number | null
    description: string | null
    not_show_description: boolean
    seo_keywords: string | null
    seo_robots: string | null
    extra_code: string | null
}

export type GroupLinkProductUpdateInput = Partial<Omit<GroupLinkProductBase, 'id'>>

export type GroupLinkProductItem = GroupLinkProductBase & {
    created_at?: string
    updated_at?: string
}

export type GroupLinkProductListParams = SearchParams & {
    //
}

export type GroupLinkProductListResponse = ListResponse<GroupLinkProductItem>

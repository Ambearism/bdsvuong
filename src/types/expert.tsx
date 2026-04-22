import type { ListResponse, SearchParams } from '@/types'

export type ExpertBase = {
    id?: number
    full_name: string
    slug?: string
    job_title?: string
    email?: string
    phone_number?: string
    image_url?: string
    experience_years?: number
    rating?: number
    facebook_url?: string
}

export type ExpertCreateInput = ExpertBase

export type ExpertUpdateInput = Partial<ExpertBase>

export type ExpertItem = ExpertBase & {
    id: number
    created_at: string
    updated_at: string
}

export type ExpertListParams = SearchParams & {}

export type ExpertListResponse = ListResponse<ExpertItem>

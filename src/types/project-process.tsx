import type { ListResponse, SearchParams } from '@/types'

export type ProjectProcessCreateInput = {
    project_id: number
    date_progress: string
    description: string
}

export type ProjectProcessUpdateInput = Partial<ProjectProcessCreateInput>

export type ProjectProcessItem = {
    id: number
    project_id: number
    date_progress: string
    description: string
    created_at: string
    updated_at: string
}

export type ProjectProcessListParams = SearchParams & {
    project_id: number
}

export type ProjectProcessListResponse = ListResponse<ProjectProcessItem>

export interface CareCaseLogItem {
    id: number
    care_case_id: number
    interaction_type: string
    content: string
    follow_up: boolean
    created_at: string
    updated_at?: string
    created_by?: number
    created_by_rel?: {
        id: number
        full_name: string
    }
}

export interface CareCaseLogCreateInput {
    care_case_id: number
    interaction_type: string
    content: string
    follow_up?: boolean
}

export interface CareCaseLogUpdateInput {
    interaction_type?: string
    content?: string
    follow_up?: boolean
}

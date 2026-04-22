export type OpportunityTaskItem = {
    id: number
    opportunity_id: number
    title: string
    notes?: string
    assigned_to?: number
    start_date?: string
    end_date?: string
    status: number
    created_at: string
    updated_at: string
    created_by?: number
    assigned_to_info?: {
        id: number
        account_name: string
        full_name?: string
    }
}

export type OpportunityTaskCreateInput = {
    title: string
    notes?: string
    assigned_to?: number
    start_date?: string
    end_date?: string
    status: number
}

export type OpportunityTaskUpdateInput = Partial<OpportunityTaskCreateInput>

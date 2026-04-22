export interface CareCaseTaskItem {
    id: number
    care_case_id: number
    customer_id: number
    title: string
    notes?: string
    assigned_to?: number
    due_date?: string
    status: number
    created_at: string
    updated_at?: string
    created_by?: number
    assigned_to_rel?: {
        id: number
        full_name: string
    }
    customer_rel?: {
        id: number
        name: string
    }
}

export interface CareCaseTaskCreateInput {
    care_case_id: number
    title: string
    notes?: string
    assigned_to?: number
    due_date?: string
    status?: number
}

export interface CareCaseTaskUpdateInput {
    title?: string
    notes?: string
    assigned_to?: number
    due_date?: string
    status?: number
}

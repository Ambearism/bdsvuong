export interface RevenueCategorySummary {
    category_id: number
    category_code: string
    category_name: string
    group_name: string
    revenue: number
    cost: number
    taxable_cost: number
    type: string
}

export interface RevenueDetailItem {
    id: number
    payment_date: string
    content: string
    group_name: string
    group_code: string
    group_id: number
    amount: number
    status: string
    type: string
    is_tax_deductible: boolean
}

export interface CareCaseRevenueOutput {
    total_revenue: number
    total_cost: number
    total_taxable_cost: number
    categories: RevenueCategorySummary[]
    details: RevenueDetailItem[]
}

export interface CareCaseRevenueParams {
    care_case_id: number
    start_date?: string
    end_date?: string
}

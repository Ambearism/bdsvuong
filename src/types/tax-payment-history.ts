export interface TaxPaymentHistoryItem {
    id: number
    care_case_id: number
    period: string
    payment_date: string
    amount: number
    note?: string
    created_at?: string
    updated_at?: string
}

export interface TaxPaymentHistoryCreateInput {
    care_case_id: number
    period: string
    payment_date: string
    amount: number
    note?: string
}

export interface TaxPaymentHistoryUpdateInput {
    period?: string
    payment_date?: string
    amount?: number
    note?: string
}

export interface ListTaxPaymentHistoryOutput {
    items: TaxPaymentHistoryItem[]
    total: number
}

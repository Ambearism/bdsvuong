import type {
    BILLING_CYCLE_OPTIONS,
    DEBT_AGE_OPTIONS_TEMPLATE,
    DUE_DATE_RULE_TABS,
    LEASE_CONTRACT_DUE_DATE_RULE,
    LEASE_CONTRACT_INVOICE_STATUS,
    LEASE_CONTRACT_LOG_TYPE,
    LEASE_CONTRACT_PAYMENT_METHOD,
    LEASE_CONTRACT_PAYMENT_STATUS,
    LEASE_CONTRACT_PAYMENT_SUBTYPE,
    LEASE_CONTRACT_STATUS,
    PAYMENT_STATUS_OPTIONS,
    TRANSFER_TYPE,
} from '@/config/constant'
import type { ListResponse, SearchParams } from '@/types'
import type { AccountSimpleReponse } from '@/types/account'
import type { CustomerItem } from '@/types/customer'

export type LeaseContractBillingUnit = 'MONTH' | 'YEAR'

export type LeaseContractDueDateRule = (typeof LEASE_CONTRACT_DUE_DATE_RULE)[keyof typeof LEASE_CONTRACT_DUE_DATE_RULE]
export type LeaseContractInvoiceStatus =
    (typeof LEASE_CONTRACT_INVOICE_STATUS)[keyof typeof LEASE_CONTRACT_INVOICE_STATUS]
export type LeaseContractPaymentMethod =
    (typeof LEASE_CONTRACT_PAYMENT_METHOD)[keyof typeof LEASE_CONTRACT_PAYMENT_METHOD]
export type LeaseContractPaymentStatus =
    (typeof LEASE_CONTRACT_PAYMENT_STATUS)[keyof typeof LEASE_CONTRACT_PAYMENT_STATUS]
export type LeaseContractPaymentSubtype =
    (typeof LEASE_CONTRACT_PAYMENT_SUBTYPE)[keyof typeof LEASE_CONTRACT_PAYMENT_SUBTYPE]
export type LeaseContractStatus = (typeof LEASE_CONTRACT_STATUS)[keyof typeof LEASE_CONTRACT_STATUS]

export type PaymentStatusValue = (typeof PAYMENT_STATUS_OPTIONS)[number]['value']
export type DebtAgeValue = (typeof DEBT_AGE_OPTIONS_TEMPLATE)[number]['value']
export type BillingCycleValue = (typeof BILLING_CYCLE_OPTIONS)[number]['value']
export type DueDateRuleValue = (typeof DUE_DATE_RULE_TABS)[number]['key']

export type LeaseContractBase = {
    id: number
    care_case_id?: number
    product_id: number
    unit_product?: string
    tenant_id: number
    landlord_id: number
    price: number
    deposit?: number
    billing_unit?: LeaseContractBillingUnit
    billing_period?: number
    status: LeaseContractStatus
    start_date: string
    end_date: string
    due_date_rule?: LeaseContractDueDateRule
    close_day?: number
    grace_period_days?: number
    note?: string
    files?: string[]
    product_value?: number
}

export type SimpleLeaseContractItem = {
    id: number
    price: number
    billing_unit?: LeaseContractBillingUnit
    billing_period?: number
    start_date: string
    end_date: string
    status: LeaseContractStatus
}

export type LeaseContractItem = LeaseContractBase & {
    product_rel?: {
        id: number
        name: string
        product_value?: number
    }
    tenant_rel: CustomerItem
    landlord_rel: CustomerItem
    child_lease_contracts_rel?: SimpleLeaseContractItem[]
    nearest_unpaid_invoice_rel?: LeaseContractInvoiceBase
    has_pending_approval_payments?: boolean
    has_debt_notes?: boolean
}

export type LeaseContractCreateInput = Omit<LeaseContractBase, 'id' | 'status'> & {
    file_urls?: string | string[]
}

export type LeaseContractUpdateInput = {
    start_date: string
    end_date: string
    billing_unit?: LeaseContractBillingUnit
    billing_period?: number
    price: number
    deposit?: number
    product_value?: number
}

export type LeaseContractRenewInput = {
    lease_contract_id: number
    price: number
    billing_unit?: LeaseContractBillingUnit
    billing_period?: number
    start_date: string
    end_date: string
    note?: string
    file_urls?: string | string[]
}

export type LeaseContractStatusUpdateInput = {
    status: LeaseContractStatus
}

export type LeaseContractListParams = SearchParams & {
    status?: string
    payment_status?: PaymentStatusValue
    aging_from?: number
    aging_to?: number
}

export type LeaseContractListResponse = ListResponse<LeaseContractItem>

export type LeaseContractPaymentBase = {
    id: number
    lease_contract_id: number
    lease_contract_invoice_ids: number[]
    amount: number
    payment_date: string
    payment_method: LeaseContractPaymentMethod
    cost_category_group_id: number
    cost_category_item_id: number
    taxable: boolean
    status: LeaseContractPaymentStatus
    note?: string
    files?: string[]
    paid_by: number
    paid_by_rel: CustomerItem
    created_by_rel: AccountSimpleReponse
    landlord_rel: CustomerItem
}

export type LeaseContractPaymentListParams = SearchParams & {
    status?: LeaseContractPaymentStatus
    lease_contract_id?: number
}

export type LeaseContractPaymentListResponse = ListResponse<LeaseContractPaymentBase>

export type LeaseContractPaymentCreateInput = Omit<
    LeaseContractPaymentBase,
    'id' | 'files' | 'created_by_rel' | 'paid_by_rel' | 'landlord_rel' | 'lease_contract_invoice_ids'
> & {
    lease_contract_invoice_ids?: number[]
    file_urls?: string | string[]
}

export type LeaseContractPaymentUpdateInput = LeaseContractPaymentCreateInput

export type LeaseContractPaymentAllocationItemInput = {
    lease_contract_invoice_id: number
    matched_amount: number
}

export type LeaseContractPaymentAllocationUpdateInput = {
    allocations: LeaseContractPaymentAllocationItemInput[]
}

export type LeaseContractInvoiceBase = {
    id: number
    title?: string | null
    lease_contract_id: number
    period_start: string | null
    period_end: string | null
    due_date: string
    amount: number
    received_amount?: number | null
    status: LeaseContractInvoiceStatus
    files?: string[]
    has_pending_payment?: boolean
    has_approved_payment?: boolean
}

export type LeaseContractInvoiceCreateInput = {
    lease_contract_id: number
    title?: string
    period_start?: string | null
    period_end?: string | null
    due_date: string
    amount: number
    status?: LeaseContractInvoiceStatus
    file_urls?: string | string[]
}

export type TransferType = (typeof TRANSFER_TYPE)[keyof typeof TRANSFER_TYPE]

export type LeaseContractTransferBase = {
    id: number
    lease_contract_id: number
    target_type: TransferType
    target_id: number
    target_unit?: string
    effective_date: string
    note?: string
    files?: string[]
}

export type LeaseContractTransferInput = Omit<LeaseContractTransferBase, 'id'> & {
    file_urls?: string | string[]
}

export type AllocationRow = {
    id: number
    title: string
    dueDate: string
    amount: number
    receivedAmount: number | null
}

export type AllocationTableRow = AllocationRow & {
    key: number
    matched: number
    remaining: number
}

export type LeaseContractLogTypeValue = (typeof LEASE_CONTRACT_LOG_TYPE)[keyof typeof LEASE_CONTRACT_LOG_TYPE]

export type LeaseContractTimelineItem = {
    id: number
    lease_contract_id: number
    type: LeaseContractLogTypeValue
    old: Record<string, unknown> | null
    new: Record<string, unknown> | null
    reason: string | null
    target_id: number | null
    target_type: string | null
    created_by_name: string | null
    created_at: string
}

export type LeaseContractTimelineResponse = {
    items: LeaseContractTimelineItem[]
}

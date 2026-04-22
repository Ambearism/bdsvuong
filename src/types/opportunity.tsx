import type { ListResponse, PeriodType, SearchParams, TypeOfOpportunityType } from '@/types'
import type { CustomerItem } from '@/types/customer'
import type { OpportunityTaskItem } from '@/types/opportunity-task'

export {
    OpportunityStage,
    OpportunityStageLabels,
    OpportunityStageColors,
    LEAD_STAGES,
    DEAL_STAGES,
    OPPORTUNITY_STAGE_OPTIONS,
    TransactionStage,
    TransactionStageLabels,
    TransactionStageColors,
    TRANSACTION_STAGE_OPTIONS,
    LeadSource,
    LeadSourceLabels,
    LEAD_SOURCE_OPTIONS,
    NeedType,
    NeedTypeLabels,
    NeedTypeTagColors,
    NEED_TYPE_OPTIONS,
    EXPECTED_DATE_OPTIONS,
    ActivityType,
    OpportunityPriority,
    OpportunityPriorityLabels,
    OPPORTUNITY_PRIORITY_OPTIONS,
    OPPORTUNITY_TYPE,
} from '@/config/constant'

export type {
    OpportunityStageType,
    TransactionStageType,
    LeadSourceType,
    NeedTypeType,
    OpportunityPriorityType,
    OpportunityType,
} from '@/config/constant'

import type {
    OpportunityStageType,
    TransactionStageType,
    LeadSourceType,
    NeedTypeType,
    ActivityTypeType,
    OpportunityPriorityType,
    OpportunityType,
} from '@/config/constant'

export type ActivityType = ActivityTypeType

export type OpportunityStage = OpportunityStageType
export type TransactionStage = TransactionStageType
export type LeadSource = LeadSourceType
export type NeedType = NeedTypeType
export type OpportunityPriority = OpportunityPriorityType

export type OpportunityBase = {
    name: string
    type?: TypeOfOpportunityType
    code?: string
    customer_id?: number
    phone?: string
    email?: string
    product_id?: number
    stage: OpportunityStage
    lead_source?: LeadSource
    source_notes?: string
    priority?: OpportunityPriority
    lost_reason?: string
    need?: NeedType
    product_type_id?: number
    zone_province_id?: number
    zone_ward_id?: number
    project_id?: number
    budget_min?: number
    budget_max?: number
    min_acreage?: number
    max_acreage?: number
    payment_method?: string
    gender?: boolean
    expected_date?: string
    notes?: string
    file_urls?: string[] | string

    assigned_to?: number
}

export type OpportunityCreateInput = OpportunityBase & {
    created_by?: number
}
export type OpportunityUpdateInput = Partial<OpportunityBase> & {
    updated_by?: number
}

export type OpportunityItem = OpportunityBase & {
    id: number
    code?: string
    customer_rel?: CustomerItem
    product_rel?: {
        id: number
        name: string
        code?: string
    }
    zone_province_rel?: {
        id: number
        name: string
    }
    zone_ward_rel?: {
        id: number
        name: string
    }
    project_rel?: {
        id: number
        name: string
    }
    assigned_to_rel?: {
        id: number
        account_name: string
        full_name?: string
    }

    created_at: string
    updated_at: string
    created_by?: number
    updated_by?: number

    zone_province_name?: string
    zone_ward_name?: string
    assigned_to_info?: {
        id: number
        account_name: string
        full_name?: string
        phone?: string
        email?: string
    }
    tasks?: OpportunityTaskItem[]
    files: string[] | null
}

export type OpportunityListParams = SearchParams & {
    stage?: number
    product_type_id?: number
    assigned_to?: number
    zone_province_id?: number
    zone_ward_id?: number
    project_id?: number
    from_date?: string
    to_date?: string
    lead_source_ids?: number | number[]
    product_id?: number
    type?: TypeOfOpportunityType
    period_type?: string
    customer_id?: number
    budget?: string
    position?: number
}

export type OpportunityUpdatePositionItem = {
    id: number
    position: number
}

export type OpportunityUpdatePositionInput = {
    items: OpportunityUpdatePositionItem[]
}

export type OpportunityListResponse = ListResponse<OpportunityItem>

export type ParsedChange = {
    field: string
    oldValue: unknown
    newValue: unknown
}

export type LookupMap = Record<string | number, string>

export type StageHistoryItem = {
    id: number
    entity_id: number
    entity_type: string
    action_type: number
    customer_id?: number
    from_stage: number | null
    to_stage: number | null
    duration_in_previous_stage?: number
    changed_by: number
    changed_at: string
    notes?: string
    changed_by_name?: string
    changed_by_rel?: {
        id: number
        account_name: string
        full_name?: string
    }
    title?: string
    assigned_to?: number
    assigned_to_rel?: {
        id: number
        account_name: string
        full_name?: string
    }
    due_date?: string
    status?: string
    old?: Record<string, unknown>
    new?: Record<string, unknown>
}

export type ConvertToTransactionInput = {
    transaction_code?: string
    stage: TransactionStage
    final_price?: number
    deposit_amount?: number
    commission_total?: number
    payment_method?: string
    notes?: string
    transaction_type?: string
}

export type TransactionBase = {
    transaction_code?: string
    customer_id?: number
    new_customer_name?: string
    new_customer_phone?: string
    product_id?: number
    opportunity_id?: number
    transaction_type?: string
    stage: TransactionStage
    final_price?: number
    deposit_amount?: number
    deposit_date?: string
    payment_method?: string
    payment_status?: string
    commission_total?: number
    commission_paid?: number
    payment_note?: string
    contract_number?: string
    contract_date?: string
    contract_file_url?: string
    completed_at?: string
    handover_date?: string
    lost_reason?: string
    assigned_to: number
    notes?: string
}

export type TransactionCreateInput = TransactionBase
export type TransactionUpdateInput = Partial<TransactionBase>

export type TransactionItem = TransactionBase & {
    id: number
    customer_name?: string
    assigned_to_name?: string
    customer?: CustomerItem
    product?: {
        id: number
        name: string
        slug?: string
        product_code?: string
        address?: string
        project_id?: number
    }
    opportunity?: OpportunityItem
    assigned_to_info?: {
        id: number
        account_name: string
        full_name?: string
        email?: string
    }

    customer_rel?: CustomerItem
    product_rel?: {
        id: number
        name: string
        code?: string
        project_id?: number
    }
    opportunity_rel?: OpportunityItem
    assigned_to_rel?: {
        id: number
        account_name: string
        full_name?: string
    }

    created_at: string
    updated_at: string
    created_by?: number
    updated_by?: number
}

export type TransactionListParams = SearchParams & {
    transaction_code?: string
    stage?: TransactionStage
    assigned_to?: number
    customer_id?: number
    transaction_type?: string
}

export type TransactionListResponse = ListResponse<TransactionItem>

export type TaskRecord =
    | StageHistoryItem
    | {
          id: string
          notes: string
          action_type: string | number
          changed_at: string
          changed_by?: number
          changed_by_rel: null
          assigned_to?: number
          assigned_to_rel?: null
      }

export type OpportunityStatistics = {
    total_leads: number
    total_deals: number
    new_leads_week: number
    new_deals_week: number
    won_deals: number
    lead_to_deal_count: number
    lead_to_deal_rate: number
    deal_to_won_rate: number
}

export type PipelineStatisticsResponse = {
    total_leads: number

    conversion_rates: {
        lead_moi_to_hen_xem_nha: number
        deal_mo_to_dam_phan: number
        dam_phan_to_dat_coc: number
        dat_coc_to_gd_hoan_tat: number
        lead_to_that_bai: number
        deal_to_that_bai: number
    }
}

export type TransactionStatistics = {
    total_count: number
    processing_count: number
    completed_count: number
    total_value: number
    total_commission: number
    this_month_count: number
}

export type LeadSourceChartItem = {
    id: number
    lead_source: number | null
    stage: number
}

export type LeadSourceChartResponse = {
    items: LeadSourceChartItem[]
    total: number
}

export type TransactionChartStatisticsParams = {
    period_type?: PeriodType
    start_date?: string
    end_date?: string
}

export type TransactionChartStatisticSeries = {
    stage: number
    total: number
    data: number[]
}

export type TransactionChartStatistics = {
    categories: string[]
    series: TransactionChartStatisticSeries[]
}

import type { Dayjs } from 'dayjs'
import type { FormInstance } from 'antd'

export type TransactionFormValues = Omit<TransactionBase, 'contract_date' | 'deposit_date' | 'handover_date'> & {
    contract_date?: Dayjs
    deposit_date?: Dayjs
    handover_date?: Dayjs
    new_customer_email?: string
    project_id?: number
}

export type OpportunityFormProps = {
    form: FormInstance<OpportunityBase>
    onFinish: (values: OpportunityBase) => void
    initialValues?: Partial<OpportunityItem>
    loading?: boolean
    onCancel?: () => void
    isEdit?: boolean
    type?: OpportunityType
}

export type TransactionFormProps = {
    form: FormInstance<TransactionFormValues>
    onFinish: (values: TransactionBase) => void
    initialValues?: Partial<TransactionBase>
    loading?: boolean
    onCancel?: () => void
    isEdit?: boolean
}

export type ProductSelectOption = {
    value: number
    label: string
    name?: string
    product_code?: string
    project_id?: number
}

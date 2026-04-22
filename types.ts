
export interface KPIItem {
    id: string;
    label: string;
    value: number;
    unit?: string;
    changeValue?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    tooltip?: string;
}

export interface FunnelStage {
    key: string;
    label: string;
    count: number;
    percent: number;
    side: 'left' | 'right';
    color: string;
}

export interface LeadSource {
    name: string;
    value: number;
    deals?: number;
    color: string;
    percent?: number;
}

export interface RevenueData {
    name: string;
    completed: number;
    pending: number;
    cancelled: number;
}

export interface InventoryCategory {
    category: string;
    sell: number;
    rent: number;
}

export interface InventoryDetailedItem {
    type: string;
    sell: { count: number; value: number; fee: number };
    rent: { count: number; value: number; fee: number };
}

export interface DashboardData {
    kpi: KPIItem[];
    funnel: FunnelStage[];
    leadSources: LeadSource[];
    revenue: RevenueData[];
    inventory: InventoryCategory[];
    inventoryDetailed: InventoryDetailedItem[];
}

// Projects
export interface Project {
    id: string;
    name: string;
    alias: string;
    parentProject?: string;
    province: string;
    district: string;
    address: string;
    type: string;
    assignee: string;
    status: string;
    isVisible: boolean;
    isFeatured: boolean;

    // Detailed Info
    developer?: string;
    totalArea?: string; // e.g: 363,000 m2
    totalUnits?: number;
    totalBlocks?: number;
    blockHeight?: string;
    elevatorsPerBlock?: string;
    propertyTypes?: string;
    constructionDensity?: string;
    legalStatus?: string;
    designStandardMin?: number;
    designStandardMax?: number;
    startingPrice?: number;
    pricePerSqm?: number;
    hotline?: string;
    fanpage?: string;

    // Misc
    description?: string;
    highlightLinks?: { title: string; url: string }[];

    totalZones: number;
    createdAt: string;
    updatedAt: string;

    coverImage?: string;
    images?: string[];
}

export interface ProjectProperty {
    id: string;
    projectId: string;
    name: string;
    unitNo: string;
    block: string;
    zone: string;
    image: string;
}

// Staff & Roles
export interface Permission {
    id: string;
    name: string;
    key: string;
    category: string;
    description: string;
    isEnabled: boolean;
}

export interface PermissionGroup {
    category: string;
    permissions: Permission[];
}

export interface Role {
    id: string;
    name: string;
    color: string;
    permissions: string[]; // keys of permissions
}

export interface Staff {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    email: string;
    title: string; // Chức danh
    yearsOfExp: number; // Năm KN
    facebook?: string;
    roleId: string;
    roleName: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'inactive';
}

export interface StaffFilterState {
    search: string;
    role: string;
    status: string;
    page: number;
    pageSize: number;
}
export interface FilterState {
    timeRange: string;
}

export type PropertyType = 'tat_ca' | 'chung_cu' | 'lien_ke' | 'biet_thu' | 'nha_rieng' | 'dat_nen' | 'shophouse_kiosk' | 'nghi_duong' | 'bds_khac' | 'trang_trai' | 'trang_trai_nha_vuon';
export type ItemType = 'tat_ca' | 'ban' | 'cho_thue';
export type MetricMode = 'so_luong' | 'gia_tri' | 'phi';

export interface DetailedFilterState extends FilterState {
    propertyType: PropertyType;
    itemType: ItemType;
    metricMode: MetricMode;
}

// Leads
export type LeadStatus = 'lead_moi' | 'dang_cham' | 'hen_xem_nha' | 'deal_mo' | 'dam_phan' | 'dat_coc' | 'gd_hoan_tat' | 'that_bai';
export type FunnelStageKey = LeadStatus;

export interface Lead {
    id: string;
    customerName: string;
    phone: string;
    need: string; // mua, thue, ky_gui_ban
    propertyType: string;
    area: string;
    budgetTy: number;
    source: string;
    assignee: string;
    status: LeadStatus;
    createdAt: string;
    updatedAt: string;
    hasDeal?: boolean;
    dealId?: string;
    email?: string;
}

export interface LeadFilterState {
    search: string;
    source: string;
    status: string;
    assignee: string;
    need: string;
    propertyType: string;
    area: string;
    budget: string;
    page: number;
    pageSize: number;
}

export interface LeadDashboardData {
    leads: Lead[];
    totalCount: number;
    kpi: {
        total: number;
        newThisWeek: number;
        leadToDeal: number;
        conversionRate: number;
    };
}

export interface TaskItem {
    id: string;
    title: string;
    task?: string;
    assigneeName?: string;
    assignee: string;
    dueAt?: string;
    deadline?: string;
}

export interface LeadDraft {
    name: string;
    email: string;
    need: string;
    propertyTypeInterest: string;
    gender: string;
    phone: string;
    refPropertyId: string;
    projectArea: string;
    city: string;
    ward: string;
    projectDetail: string;
    areaMin: string;
    areaMax: string;
    address: string;
    budgetMin: string;
    budgetMax: string;
    paymentMethod: string;
    timeframe: string;
    source: string;
    assignee: string;
    status: string;
    sourceDetail: string;
    note: string;
    tasks: TaskItem[];
}

// Deals
export type DealStage = 'deal_mo' | 'dam_phan' | 'dat_coc' | 'gd_hoan_tat' | 'huy_that_bai' | 'huy';

export interface Deal {
    id: string;
    leadId: string;
    customerId: string;
    customerName: string;
    phone: string;
    need: string;
    propertyType: string;
    area: string;
    budgetTy: number;
    source: string;
    assignee: string;
    stage: DealStage;
    createdAt: string;
    updatedAt: string;
}

export interface DealFilterState {
    quickRange?: string;
    dateRange: { from: string | null; to: string | null };
    search: string;
    source: string;
    stage: string;
    assignee: string;
    need: string;
    propertyType: string;
    area: string;
    budget: string;
    page: number;
    pageSize: number;
}

export interface DealDashboardData {
    deals: Deal[];
    totalCount: number;
    kpi: {
        totalDeals: number;
        newThisWeek: number;
        wonDeals: number;
        conversionRate: number;
    };
}

export type DealLinkMode = 'from_lead' | 'direct';

export interface DealTaskItem {
    id: string;
    title: string;
    assigneeId: string;
    assigneeName: string;
    dueAt: string;
}

export interface DealDraft {
    linkMode: DealLinkMode;
    leadId: string;
    customerName: string;
    phone: string;
    email: string;
    gender: string;
    need: string;
    propertyType: string;
    propertyId: string;
    projectOrAreaAuto: string;
    ward: string;
    areaText: string;
    addressDetail: string;
    province: string;
    minArea: string;
    maxArea: string;
    minBudgetTy: string;
    maxBudgetTy: string;
    expectedCloseWindow: string;
    paymentMethodNote: string;
    dealValueTy: string;
    depositAmountTy: string;
    dealSource: string;
    assigneeId: string;
    dealStage: string;
    sourceDetail: string;
    note: string;
    tasks: DealTaskItem[];
    id?: string;
}

// Care
export type CareCaseStatus = 'active' | 'inactive';

export interface CareCase {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerPhone: string;
    status: CareCaseStatus;
    riskScore: number;
    lastContactDate: string;
    assignedTo: string;
    linkedProperties: { id: string, code: string, name: string }[];
    linkedLeases: { id: string, code: string }[];
    createdAt: string;
    updatedAt: string;
    careFeeMillion?: number; // Added for KPI tracking
}

export interface CareCaseHubData {
    case: CareCase;
    stats: {
        openTasks: number;
        overdueTasks: number;
        totalLogs: number;
    };
    tasks: any[];
    logs: any[];
}

export interface CashflowEntry {
    id: string;
    refNo: string;
    date: string;
    amountTy: number;
    currency: string;
    method: string;
    payer: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdBy: string;
    createdAt: string;
    isEnteredOnBehalf: boolean;
    onBehalfNote?: string;
    allocatedAmountTy: number;
    unappliedAmountTy: number;
    attachments: { id: string, fileName: string, sizeKb?: number, url: string }[];
    note: string;
    isTaxable: boolean;
    leaseId?: string;
    transactionId?: string;
    category?: CashflowCategory;
    subtype?: CashflowSubtype;
    revenueCode?: string;
}

export interface LeaseScheduleItem {
    id: string;
    periodLabel: string;
    fromDate: string;
    toDate: string;
    dueDate: string;
    amountTy: number;
    amountPaidTy: number;
    status: 'unpaid' | 'paid' | 'partial' | 'overdue';
}

export interface Lease {
    id: string;
    code: string;
    ownerId: string;
    ownerName: string;
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    propertyId: string;
    propertyName: string;
    unitCode: string;
    rentAmountTy: number;
    depositAmountTy: number;
    cycle: PaymentCycle;
    startDate: string;
    endDate: string;
    status: LeaseStatus;
    nextDueDate: string;
    outstandingAmountTy: number;
    assigneeName: string;
    createdAt: string;
    updatedAt: string;
    isOverdue: boolean;
    isAutoSchedule: boolean;
    overdueAmountTy: number;
    unappliedCreditTy: number;
    maxOverdueDays: number;
    hasDebtNote: boolean;
    hasPendingCashflow: boolean;
    inspectionRisk: boolean;
}

export interface TaxCase {
    id: string;
    ownerId: string;
    year: number;
    revenueYtdTy: number;
    thresholdTy: number;
    isThresholdExceeded: boolean;
    exceededDate?: string;
    status: 'unfiled' | 'filed' | 'paid';
    notes: string;
    updatedAt: string;
}

export interface HistoryLog {
    id: string;
    action: 'create' | 'update' | 'status_change' | 'delete' | 'call' | 'note';
    title: string;
    description: string;
    actor: string;
    timestamp: string;
}

// Added Pipeline Types
export type PipelineStageKey = LeadStatus;

export interface PipelineCard {
    id: string;
    customerName: string;
    phone: string;
    propertyType: string;
    need: string;
    source: string;
    budgetRangeText: string;
    areaText: string;
    notes: string[];
    tasks: TaskItem[];
    stage: PipelineStageKey;
    hasDeal: boolean;
    updatedAt: string;
    createdAt: string;
    assignee: string;
}

// Added Inventory Detail Types
export type OwnerBucket = 'chinh_chu' | 'moi_gioi' | 'cho_ban' | 'chua_ban' | 'da_coc' | 'da_ban' | 'huy_hang';

export interface CellMetric {
    count: number;
    valueBillion: number;
    feeBillion: number;
}

export interface RowData {
    id: string;
    propertyType: string;
    propertyKey: string;
    byBucket: Record<OwnerBucket, CellMetric>;
}

// Added Transaction Types
export type TransactionStatus = 'dat_coc' | 'dang_xu_ly_hs' | 'ky_hop_dong' | 'thanh_toan_dot1' | 'thanh_toan_day_du' | 'hoan_tat' | 'huy';
export type TxSource = 'auto_from_deal' | 'manual_admin';

export interface TxDocument {
    id: string;
    fileName: string;
    fileType: string;
    fileSizeKb: number;
    uploadedAt: string;
    uploadedBy: string;
    category: string;
}

export interface Transaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    source: TxSource;
    dealId?: string;
    customerId: string;
    customerCode: string;
    customerName: string;
    customerPhone: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    propertyType: string;
    purpose: 'ban' | 'cho_thue';
    project: string;
    ward: string;
    areaM2: number;
    dealValueTy: number;
    depositAmountTy: number;
    commissionFee: string;
    status: TransactionStatus;
    legalStatus: string;
    assigneeName: string;
    internalNote: string;
    documents: TxDocument[];
    hasContract: boolean;
    hasDepositProof: boolean;
    riskFlag: 'ok' | 'warning' | 'danger';
}

export interface TransactionFilterState {
    search: string;
    status: string;
    source: string;
    assignee: string;
    propertyType: string;
    purpose: string;
    project: string;
    page: number;
    pageSize: number;
}

// Added Lease Filter and Data types
export type LeaseStatus = 'active' | 'expiring' | 'expired' | 'pending_deposit' | 'terminated' | 'paused' | 'transferred';
export type PaymentCycle = '1_month' | '3_months' | '6_months' | '12_months' | 'one_time';
export type DueDateRule = 'fixed_day' | 'every_n_days';

export interface LeaseFilterState {
    search: string;
    status: string;
    paymentStatus: string;
    agingBucket: string;
    dateRange: { from: string | null; to: string | null };
    page: number;
    pageSize: number;
}

export interface LeaseDashboardData {
    leases: Lease[];
    totalCount: number;
    kpi: {
        nextDueDate: string;
        outstandingTy: number;
        overdueCount: number;
        paidYTD: number;
        taxLiabilityTy: number;
    };
}

export interface LeaseDraft {
    id?: string;
    code?: string;
    ownerId: string;
    tenantId: string;
    propertyId: string;
    unitCode: string;
    rentAmountTy: number;
    depositAmountTy: number;
    currency: string;
    cycle: PaymentCycle;
    startDate: string;
    endDate: string;
    dueDateRule: DueDateRule;
    dueDayOfMonth: number;
    graceDays: number;
    status: LeaseStatus;
    notes: string;
    schedule: LeaseScheduleItem[];
    isAutoSchedule: boolean;
}

export interface LeaseAllocation {
    id: string;
    cashflowId: string;
    scheduleItemId: string;
    amountTy: number;
    createdAt: string;
}

export interface DebtNote {
    id: string;
    leaseId: string;
    title: string;
    content: string;
    tag: string;
    isInternal: boolean;
    createdAt: string;
    createdBy: string;
    amountMillion?: number;
}

export interface ArAgingItem {
    leaseId: string;
    ownerName: string;
    tenantName: string;
    propertyUnit: string;
    totalOutstandingTy: number;
    buckets: {
        current: number;
        days_1_30: number;
        days_31_60: number;
        days_61_90: number;
        days_over_90: number;
    };
    creditBalanceTy: number;
}

export interface LeaseHubData {
    lease: Lease;
    kpi: {
        nextDueDate: string;
        outstandingTy: number;
        overdueCount: number;
        paidYTD: number;
        taxLiabilityTy: number;
    };
    schedule: LeaseScheduleItem[];
    cashflows: CashflowEntry[];
    allocations: LeaseAllocation[];
    debtNotes: DebtNote[];
    taxCase: TaxCase;
    history: HistoryLog[];
}

// Added Inspection types
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type InspectionCategory = 'electric' | 'water' | 'structure' | 'interior' | 'other';

export interface Inspection {
    id: string;
    propertyId: string;
    inspectionDate: string;
    inspectorName: string;
    category: InspectionCategory;
    riskLevel: RiskLevel;
    findings: string;
    recommendation: string;
    nextInspectionDate?: string;
    purposeCompliance: 'yes' | 'no';
}

// Added Setting & Tax types
export interface TaxConfig {
    taxYearBasis: 'PAID_DATE' | 'ACCRUAL';
    includePrepaidRevenue: boolean;
    thresholdEnabled: boolean;
    thresholdAmount: number;
    alertThresholdPercent: number;
    filingCycle: 'MONTH' | 'QUARTER' | 'YEAR';
    filingDeadlineDay: number;
    reminderDaysBefore: number[];
    updatedAt: string;
    updatedBy: string;
}

export type RevenueCategory = 'RENT' | 'SERVICE' | 'UTILITY' | 'PENALTY' | 'DEPOSIT_FORFEIT' | 'OTHER';

export interface RevenueCode {
    id: string;
    code: string;
    name: string;
    category: RevenueCategory;
    isTaxable: boolean;
    isSystem: boolean;
    description: string;
    isActive: boolean;
}

export interface SettingsAuditLog {
    id: string;
    section: string;
    action: string;
    actor: string;
    timestamp: string;
    changes: string;
}

export interface RentalCategory {
    id: string;
    code: string;
    name: string;
    taxRatePercent: number;
    isDefault: boolean;
    description: string;
}

export interface AssetCareFeeConfig {
    id: string;
    cycle: 'MONTH' | 'QUARTER';
    basis: 'REVENUE_ALL' | 'REVENUE_RENT_ONLY';
    excludeDeposits: boolean;
    formula: 'PERCENT' | 'FIXED' | 'HYBRID';
    fixedAmount: number;
    percentRate: number;
    minFee: number;
    maxFee: number;
    updatedAt: string;
    updatedBy: string;
}

// Added Finance/Cashflow types
export type CashflowCategory = 'RENT_INCOME' | 'ASSET_OTHER_INCOME' | 'NON_REVENUE' | 'COMPENSATION_IRREGULAR';

export type CashflowSubtype =
    | 'RENT_MONTHLY' | 'RENT_PERIODIC' | 'RENT_ADVANCE' | 'RENT_LATE' | 'RENT_DISCOUNT'
    | 'SERVICE_FEE_TENANT' | 'UTILITY_MARKUP' | 'PENALTY_FEE' | 'CONTRACT_CHANGE_FEE' | 'EXTRA_SPACE_RENTAL' | 'REVENUE_SHARING_COOP'
    | 'SECURITY_DEPOSIT' | 'REFUND_DEPOSIT' | 'REIMBURSEMENT_PASS_THROUGH' | 'LOAN_BORROW'
    | 'DAMAGE_COMPENSATION' | 'CONTRACT_BREACH_COMPENSATION' | 'DEPOSIT_FORFEIT' | 'RECOVER_COST';

export interface CostCategoryGroup {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'REVENUE' | 'EXPENSE';
    displayOrder: number;
    isActive: boolean;
    isDefaultSeeded: boolean;
}

export interface CostCategoryItem {
    id: string;
    groupId: string;
    code: string;
    name: string;
    description: string;
    examples: string;
    type: 'REVENUE' | 'EXPENSE';
    tenantRelatedFlag: boolean;
    isTaxDeductible: boolean;
    requiresAttachment: boolean;
    isActive: boolean;
    displayOrder: number;
    isDefaultSeeded: boolean;
}

export interface CostEntry {
    id: string;
    refNo: string;
    date: string;
    amountTy: number;
    groupId: string;
    itemId: string;
    assetId: string;
    leaseId?: string;
    tenantId?: string;
    note: string;
    attachments: { id: string, fileName: string, url: string }[];
    createdBy: string;
    createdAt: string;
}

export interface TaxPayment {
    id: string;
    taxCaseId: string;
    year: number;
    period: string;
    amountTy: number;
    paymentDate: string;
    status: 'verified' | 'pending' | 'rejected';
    notes: string;
}

// Added Reminder types
export type ReminderType = 'payment' | 'tax' | 'fee' | 'cost' | 'contract' | 'care' | 'legal' | 'other';
export type ReminderLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReminderStatus = 'new' | 'processing' | 'done' | 'cancelled';

export interface ReminderLog {
    id: string;
    reminderId: string;
    actor: string;
    action: string;
    content: string;
    timestamp: string;
}

export interface Reminder {
    id: string;
    code: string;
    type: ReminderType;
    title: string;
    description: string;
    ownerId: string;
    ownerName: string;
    leaseId?: string;
    leaseCode?: string;
    propertyName?: string;
    relatedAmountTy?: number;
    paidAmountTy?: number;
    remainingAmountTy?: number;
    dueDate: string;
    status: ReminderStatus;
    level: ReminderLevel;
    assigneeName: string;
    checklist: { id: string, label: string, isDone: boolean }[];
    logs: ReminderLog[];
    createdAt: string;
    updatedAt: string;
    tags: string[];
}

export interface ReminderRuleConfig {
    id: string;
    category: ReminderType;
    name: string;
    isEnabled: boolean;
    conditions: { metric: string, operator: string, value: number }[];
    actions: { setLevel: ReminderLevel, template: string, autoChecklist: string[] };
}

export interface ReminderFilterState {
    search: string;
    type: string;
    status: string;
    level: string;
    assignee: string;
    timeRange: string;
}

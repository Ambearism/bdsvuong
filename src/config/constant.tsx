import type { ProductUpdateLogType } from '@/types'
import type { DashboardTableShowOnlyType, DashboardTransactionKeyType } from '@/types/dashboard'
import type {
    BillingCycleValue,
    LeaseContractPaymentMethod,
    LeaseContractPaymentStatus,
    LeaseContractStatus,
} from '@/types/lease-contract'
import { colors } from '@/config/colors'
import type { PresetColorType } from 'antd/es/_util/colors'
import type { DefaultOptionType } from 'antd/es/select'

export const authAction = {
    LOGOUT: 'LOGOUT',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
}

export const COST_CATEGORY_TYPE = {
    REVENUE: 'REVENUE',
    EXPENSE: 'EXPENSE',
} as const

export const TAX_METHOD = {
    REVENUE: 'revenue',
    PROFIT: 'profit',
} as const

export const DEFAULT_TAX_RATE = 10
export const DEFAULT_TAX_THRESHOLD = 500_000_000
export const TAX_GROUP_CODE = 'CP_THUE_PHAP_LY'
export const MULTIPLIER = 1_000_000
export const ONE_BILLION_THRESHOLD = 1_000_000_000
export const MONTHS_IN_YEAR = 12
export const QUARTERS_IN_YEAR = 4
export const EMPTY_TEXT = 'N/A'
export const MIN_POSITIVE_VALUE = 0.000001
export const MIN_BROKERAGE_FEE = 0
export const MIN_COMMISSION_RATE = 0
export const MAX_LENGTH_255 = 255
export const MAX_LENGTH_1000 = 1000
export const MAX_LENGTH_2000 = 2000

export const PAYMENT_TYPE = {
    THU: 'THU',
    CHI: 'CHI',
} as const

export const COST_CATEGORY_TYPE_OPTIONS = [
    { value: COST_CATEGORY_TYPE.REVENUE, label: 'Doanh thu' },
    { value: COST_CATEGORY_TYPE.EXPENSE, label: 'Chi phí' },
]

export const ACCOUNT_TYPE = {
    ADMIN: 'ADMIN',
} as const

export const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const

export type StatusValue = (typeof STATUS)[keyof typeof STATUS]

export const STATUS_LABEL_MAP: Record<StatusValue, string> = {
    [STATUS.ACTIVE]: 'Đang care',
    [STATUS.INACTIVE]: 'Tạm ngưng',
}

export const DYNAMIC_PARAM_REGEX = /:\w+/g
export const REGEX_PHONE = /^(?:(?:(?:\+|)84|0)(?:3|5|7|8|9)\d{8}|(?:(?:\+|)84|0)(?:24[236789]|28[23679])\d{7})$/
export const REGEX_HISTORY_LOG = /old\s*[:=]?\s*({[\s\S]*?})[\s,]*->\s*new\s*[:=]?\s*({[\s\S]*?})/i
export const REGEX_DATE_YMD = /^(\d{4})-(\d{2})-(\d{2})/
export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const REGEX_ACCOUNT_NAME = /^[a-zA-Z0-9_]+$/
export const REGEX_NO_SPACE = /^\S*$/
export const REGEX_URL = /^(https?:\/\/)?([\w.-]+)\.[a-zA-Z]{2,}(:[0-9]+)?(\/[^\s]*)?$/
export const REGEX_YOUTUBE = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^#&?]*).*/
export const REGEX_IFRAME_SRC = /src=["'](.*?)["']/
export const REGEX_IFRAME_WIDTH = /width=["'](.*?)["']/
export const REGEX_IFRAME_HEIGHT = /height=["'](.*?)["']/
export const REGEX_SLUG = /^[a-zA-Z0-9_-]+(\.html)?$/
export const REGEX_FACEBOOK = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9.]+(\/)?$/
export const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed'
export const CHUNK_SIZE = 20 * 1024 * 1024 // 20MB
export const MILLION_PER_BILLION = 1000
export const MIN_VISIBLE_COLUMN_RATIO = 0.015
export const REGEX_NUMBER_DOT = /[^0-9.]/g
export const REGEX_THOUSAND_SEPARATOR = /\B(?=(\d{3})+(?!\d))/g
export const REGEX_CLEAN_NON_NUMERIC = /[^\d.-]/g

export const MAX_PROJECT_ACREAGE = 1000000000

export const REGEX_NUMBER_COMMA_DOT = /^[0-9.,]+$/

export const PRODUCT_TYPE = {
    APARTMENT: 'Chung cư',
    KIOSK: 'Ki-ốt & Sàn thương mại',
    TOWNHOUSE: 'Liền kề',
    VILLA: 'Biệt thự',
    PRIVATE_HOUSE: 'Nhà riêng',
    LAND: 'Đất nền',
    FARM_VILLA: 'Biệt thự nhà vườn - Trang trại',
    OTHER: 'BĐS Khác',
    RESORT: 'Khách sạn nghỉ dưỡng',
}

export const PRODUCT_TYPE_ID = {
    APARTMENT: 1,
    TOWNHOUSE: 2,
    VILLA: 3,
    PRIVATE_HOUSE: 4,
    LAND: 5,
    FARM_VILLA: 6,
    OTHER: 7,
    KIOSK: 8,
    RESORT: 9,
}

export const EXPLORE_ENABLED_TYPES = [
    PRODUCT_TYPE_ID.APARTMENT,
    PRODUCT_TYPE_ID.TOWNHOUSE,
    PRODUCT_TYPE_ID.VILLA,
    PRODUCT_TYPE_ID.KIOSK,
]

export const PRODUCT_TRANSACTION = {
    RENT: 'RENT',
    SELL: 'SELL',
    ALL: 'ALL',
} as const

export const PRODUCT_TRANSACTION_LABEL_MAPPED = {
    RENT: 'Cho Thuê',
    SELL: 'Bán',
    ALL: 'Cho Thuê & Bán',
} as const

export const PRODUCT_IDENTIFIER_CODE_CHECK_STATUS = {
    UNCHECKED: 'unchecked',
    AVAILABLE: 'available',
    DUPLICATED: 'duplicated',
} as const

export const CATEGORY_MAP = {
    NEWS: {
        value: 'NEWS',
        label: 'Tin tức',
        acceptNews: true,
        requireProjectId: false,
    },
    PROJECT: {
        value: 'PROJECT',
        label: 'Dự án',
        acceptNews: true,
        requireProjectId: true,
    },
} as const

export const PRODUCT_TYPES = [
    { key: 'apartment', label: 'Chung cư' },
    { key: 'townhouse', label: 'Liền kề' },
    { key: 'villa', label: 'Biệt thự' },
    { key: 'private-house', label: 'Nhà riêng' },
    { key: 'land-plot', label: 'Đất nền' },
    { key: 'garden-villa-farm', label: 'Biệt thự nhà vườn - Trạng trại' },
    { key: 'other-real-estate', label: 'BĐS khác' },
    { key: 'kiosk-commercial-floor', label: 'Ki-ot & Sàn thương mại' },
    { key: 'resort-hotel', label: 'Khách sạn nghỉ dưỡng' },
] as const

export const SUPPLIER_TYPE = {
    CUA_TOI: 1,
    MOI_GIOI: 2,
    CHU_NHA: 3,
}

export const LEGAL_STATUS = {
    CO_SO_DO: 'Đã có sổ đỏ',
    DANG_CHO_SO: 'Đang chờ sổ',
    GIAY_TO_KHAC: 'Giấy tờ khác',
}

export const PRODUCT_STATUS = {
    CO_SO_DO: 1,
    CHUA_SO_DO: 2,
    DONG_TIEN_DO: 3,
}

export const PROJECT_STATUS = {
    SAP_MO_BAN: 1,
    DANG_MO_BAN: 2,
    DA_BAN_GIAO: 3,
} as const

export const ROOT_FOLDER = 'root'

export const IMAGE_TYPE = {
    PRODUCT: 1,
    PRODUCT_REPRESENT: 2,
    PROJECT: 3,
    PROJECT_REPRESENT: 4,
    PROJECT_LOGO: 5,
    EXCHANGE: 6,
    CUSTOMER: 7,
    EXPLORE: 8,
    ACCOUNT_AVATAR: 9,
    NEWS_THUMBNAIL: 10,
    TOUR360_THUMBNAIL: 11,
    VIEW360_THUMBNAIL: 12,
    VIEW360_PANORAMA: 13,
    PROJECT_AMENITY: 14,
    IMAGE_EDITOR: 15,
    PROJECT_FLOOR_PLAN: 16,
    PRODUCT_FLOOR_PLAN: 17,
    TRANSACTION_IMAGE: 18,
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
export const UPLOAD = {
    MAX_FILE_UPLOAD: 5,
    MAX_FILE_UPLOAD_DOCS: 10,
    MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_FILE_SIZE_DOCS: 10 * 1024 * 1024, // 10MB
    SINGLE_FILE_LIMIT: 1,
    ALLOWED_IMAGE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'],
    ALLOWED_DOCUMENT_FORMATS: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ACCEPTED_EXTENSIONS: '.jpg,.jpeg,.png,.pdf,.doc,.docx',
    IMAGE_EXTENSIONS,
}

export const FILE_PREVIEW = {
    IMAGE_EXTENSIONS,
    DOCUMENT_EXTENSIONS: ['pdf'] as const,
} as const

export const FILE_PREVIEW_EXTENSIONS = [...FILE_PREVIEW.IMAGE_EXTENSIONS, ...FILE_PREVIEW.DOCUMENT_EXTENSIONS] as const

export const HA_NOI_LOCATION = {
    LAT: 21.0278,
    LONG: 105.8342,
}

export const ZOOM_SIZE = {
    SMALL: 12,
    MEDIUM: 15,
    BIG: 17,
}

export const PREDEFINED_AMENITIES = [
    {
        title: 'Bể Bơi',
        items: [
            { name: 'Bể bơi ngoài trời 500m²', description: '' },
            { name: 'Bể bơi trẻ em', description: '' },
            { name: 'Bể Bơi Bốn Mùa', description: '' },
        ],
    },
    {
        title: 'Thể thao & Gym',
        items: [
            { name: 'Phòng Gym Hiện Đại', description: '' },
            { name: 'Sân thể thao đa năng', description: '' },
        ],
    },
    {
        title: 'Khu vui chơi trẻ em',
        items: [
            { name: 'Khu vui chơi trẻ em trong nhà', description: '' },
            { name: 'Khu vui chơi trẻ em ngoài trời', description: '' },
        ],
    },
    {
        title: 'Cảnh quan & thư giãn',
        items: [
            { name: 'Đường dạo bộ', description: '' },
            { name: 'Vườn hoa', description: '' },
            { name: 'Công viên mini', description: '' },
            { name: 'Quảng trường trung tâm', description: '' },
            { name: 'Vườn tĩnh tâm', description: '' },
            { name: 'Hồ Điều Hòa', description: '' },
        ],
    },
    {
        title: 'Không gian làm việc & học tập',
        items: [
            { name: 'Co-working space', description: '' },
            { name: 'Thư viện', description: '' },
        ],
    },
    {
        title: 'Sinh hoạt cộng đồng',
        items: [{ name: 'Phòng sinh hoạt cộng đồng chuẩn', description: '' }],
    },
    {
        title: 'Giao thông nội khu',
        items: [{ name: 'Hầm để xe thông minh', description: '' }],
    },
    {
        title: 'An ninh',
        items: [
            { name: 'Cổng an ninh quản lý bằng thẻ từ', description: '' },
            { name: 'Phòng Monitor bảo an', description: '' },
        ],
    },
    {
        title: 'Sảnh',
        items: [{ name: 'Lễ Tân', description: '' }],
    },
]

export const PRODUCT_SORT_OPTIONS = [
    { value: 1, label: 'Giá bán tăng dần' },
    { value: 2, label: 'Giá bán giảm dần' },
    { value: 5, label: 'Diện tích tăng dần' },
    { value: 6, label: 'Diện tích giảm dần' },
    { value: 7, label: 'Phí môi giới tăng dần' },
    { value: 8, label: 'Phí môi giới giảm dần' },
    { value: 9, label: 'Thời gian tác động gần đây' },
    { value: 10, label: 'Thời gian tác động lâu ngày' },
]

export const NEWS_SORT_OPTIONS = [
    { value: 1, label: 'Đăng gần đây' },
    { value: 2, label: 'Đăng lâu ngày' },
    { value: 3, label: 'Lượt xem' },
    { value: 4, label: 'Nổi bật' },
]

export const ANTD_PRESETS: PresetColorType[] = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
]

export const TABS_TYPE = {
    CONTENT: 'content',
} as const

export const OpportunityStage = {
    LEAD_MOI: 1,
    DANG_CHAM: 2,
    HEN_XEM_NHA: 3,
    DEAL_MO: 4,
    DAM_PHAN: 5,
    DAT_COC: 6,
    GD_HOAN_TAT: 7,
    HUY: 8,
} as const

export type OpportunityStageType = (typeof OpportunityStage)[keyof typeof OpportunityStage]

export const LEAD_STAGES: OpportunityStageType[] = [OpportunityStage.LEAD_MOI, OpportunityStage.DANG_CHAM]

export const DEAL_STAGES: OpportunityStageType[] = [
    OpportunityStage.HEN_XEM_NHA,
    OpportunityStage.DEAL_MO,
    OpportunityStage.DAM_PHAN,
    OpportunityStage.DAT_COC,
    OpportunityStage.GD_HOAN_TAT,
    OpportunityStage.HUY,
]

export const OpportunityStageLabels: Record<OpportunityStageType, string> = {
    [OpportunityStage.LEAD_MOI]: 'Lead mới',
    [OpportunityStage.DANG_CHAM]: 'Đang chăm',
    [OpportunityStage.HEN_XEM_NHA]: 'Hẹn xem nhà',
    [OpportunityStage.DEAL_MO]: 'Deal mở',
    [OpportunityStage.DAM_PHAN]: 'Đàm phán',
    [OpportunityStage.DAT_COC]: 'Đặt cọc',
    [OpportunityStage.GD_HOAN_TAT]: 'GD hoàn tất',
    [OpportunityStage.HUY]: 'Hủy',
}

export const OpportunityStageColors: Record<OpportunityStageType, string> = {
    [OpportunityStage.LEAD_MOI]: '#37A753',
    [OpportunityStage.DANG_CHAM]: '#FFD359',
    [OpportunityStage.HEN_XEM_NHA]: '#EA9939',
    [OpportunityStage.DEAL_MO]: '#FF6159',
    [OpportunityStage.DAM_PHAN]: '#5A5EBE',
    [OpportunityStage.DAT_COC]: '#6BA3FF',
    [OpportunityStage.GD_HOAN_TAT]: '#00C8B3',
    [OpportunityStage.HUY]: '#AC7F5E',
}

export const OPPORTUNITY_STAGE_OPTIONS = Object.entries(OpportunityStageLabels).map(([value, label]) => ({
    value: Number(value),
    label,
}))

export const OpportunityPriority = {
    URGENT: 1,
    HOT: 2,
    WARM: 3,
    COLD: 4,
    LOST: 5,
} as const

export type OpportunityPriorityType = (typeof OpportunityPriority)[keyof typeof OpportunityPriority]

export const OpportunityPriorityLabels: Record<OpportunityPriorityType, string> = {
    [OpportunityPriority.URGENT]: 'Deal hoả tốc',
    [OpportunityPriority.HOT]: 'Deal nóng',
    [OpportunityPriority.WARM]: 'Deal ấm',
    [OpportunityPriority.COLD]: 'Deal lạnh',
    [OpportunityPriority.LOST]: 'Lost',
}

export const OpportunityPriorityColors: Record<OpportunityPriorityType, string> = {
    [OpportunityPriority.URGENT]: '#FF4D4F',
    [OpportunityPriority.HOT]: '#FF7A45',
    [OpportunityPriority.WARM]: '#FFA940',
    [OpportunityPriority.COLD]: '#36CFC9',
    [OpportunityPriority.LOST]: '#BFBFBF',
}

export const OPPORTUNITY_PRIORITY_OPTIONS = Object.entries(OpportunityPriorityLabels).map(([value, label]) => ({
    value: Number(value),
    label,
}))

export const TransactionStage = {
    GD_HOAN_TAT: 1,
    THAT_BAI: 2,
    DAT_COC: 3,
} as const

export type TransactionStageType = (typeof TransactionStage)[keyof typeof TransactionStage]

export const TransactionStageLabels: Record<TransactionStageType, string> = {
    [TransactionStage.GD_HOAN_TAT]: 'Giao dịch hoàn tất',
    [TransactionStage.THAT_BAI]: 'Thất bại',
    [TransactionStage.DAT_COC]: 'Đặt cọc',
}

export const TransactionStageColors: Record<TransactionStageType, string> = {
    [TransactionStage.GD_HOAN_TAT]: '#03953D',
    [TransactionStage.THAT_BAI]: '#AC7F5E',
    [TransactionStage.DAT_COC]: '#0088FF',
}

export const TRANSACTION_REVENUE_CHART_STAGE = {
    COMPLETED: TransactionStage.GD_HOAN_TAT,
    PROCESSING: OpportunityStage.DAT_COC,
    CANCELLED: OpportunityStage.HUY,
} as const

export type TransactionRevenueChartStageType =
    (typeof TRANSACTION_REVENUE_CHART_STAGE)[keyof typeof TRANSACTION_REVENUE_CHART_STAGE]

export const TransactionRevenueChartStageLabels: Record<TransactionRevenueChartStageType, string> = {
    [TRANSACTION_REVENUE_CHART_STAGE.COMPLETED]: 'Hoàn tất',
    [TRANSACTION_REVENUE_CHART_STAGE.PROCESSING]: 'Đang thanh toán',
    [TRANSACTION_REVENUE_CHART_STAGE.CANCELLED]: 'Hủy',
}

export const TransactionRevenueChartStageColors: Record<TransactionRevenueChartStageType, string> = {
    [TRANSACTION_REVENUE_CHART_STAGE.COMPLETED]: colors.blue,
    [TRANSACTION_REVENUE_CHART_STAGE.PROCESSING]: colors.green,
    [TRANSACTION_REVENUE_CHART_STAGE.CANCELLED]: colors.yellow,
}

export const TRANSACTION_STAGE_OPTIONS = Object.entries(TransactionStageLabels).map(([value, label]) => ({
    value: Number(value),
    label,
}))

export const LeadSource = {
    WEBSITE: 1,
    ZALO: 2,
    FACEBOOK: 3,
    HOTLINE: 4,
    CTV: 5,
    VAN_PHONG: 6,
    GIOI_THIEU: 7,
} as const

export type LeadSourceType = (typeof LeadSource)[keyof typeof LeadSource]

export const LeadSourceLabels: Record<LeadSourceType, string> = {
    [LeadSource.WEBSITE]: 'Website',
    [LeadSource.ZALO]: 'Zalo',
    [LeadSource.FACEBOOK]: 'Facebook',
    [LeadSource.HOTLINE]: 'Hotline',
    [LeadSource.CTV]: 'CTV',
    [LeadSource.VAN_PHONG]: 'Văn phòng',
    [LeadSource.GIOI_THIEU]: 'Giới thiệu',
}

export const LEAD_SOURCE_OPTIONS = Object.entries(LeadSourceLabels).map(([value, label]) => ({
    value: Number(value),
    label,
}))

export const NeedType = {
    MUA: 'MUA',
    THUE: 'THUE',
    KY_GUI_BAN: 'KY_GUI_BAN',
    KY_GUI_CHO_THUE: 'KY_GUI_CHO_THUE',
    TU_VAN: 'TU_VAN',
} as const

export type NeedTypeType = (typeof NeedType)[keyof typeof NeedType]

export const NeedTypeLabels: Record<NeedTypeType, string> = {
    [NeedType.MUA]: 'Mua',
    [NeedType.THUE]: 'Thuê',
    [NeedType.KY_GUI_BAN]: 'Ký gửi bán',
    [NeedType.KY_GUI_CHO_THUE]: 'Ký gửi cho thuê',
    [NeedType.TU_VAN]: 'Tư vấn',
}

export const NeedTypeTagColors: Record<NeedTypeType, string> = {
    [NeedType.MUA]: 'volcano',
    [NeedType.THUE]: 'cyan',
    [NeedType.KY_GUI_BAN]: 'orange',
    [NeedType.KY_GUI_CHO_THUE]: 'green',
    [NeedType.TU_VAN]: 'blue',
}

export const NEED_TYPE_OPTIONS = Object.entries(NeedTypeLabels).map(([value, label]) => ({
    value,
    label,
}))

export const BUDGET_OPTIONS = [
    { label: 'Dưới 5 tỷ', value: 'duoi_5' },
    { label: '5→10 tỷ', value: '5_10' },
    { label: '10→15 tỷ', value: '10_15' },
    { label: '15→20 tỷ', value: '15_20' },
    { label: 'Trên 20 tỷ', value: 'tren_20' },
]

export const EXPECTED_DATE_OPTIONS = [
    { value: '1_month', label: 'Trong 1 tháng' },
    { value: '3_months', label: 'Trong 3 tháng' },
    { value: '6_months', label: 'Trong 6 tháng' },
    { value: '1_year', label: 'Trong 1 năm' },
    { value: 'undefined', label: 'Không xác định' },
] as const

export const ActivityType = {
    STAGE_CHANGE: 1,
    TASK: 2,
    NOTE: 3,
    CALL: 4,
    EMAIL: 5,
    MEETING: 6,
    SMS: 7,
} as const

export type ActivityTypeType = (typeof ActivityType)[keyof typeof ActivityType]

export const ActivityTypeLabels: Record<ActivityTypeType, string> = {
    [ActivityType.STAGE_CHANGE]: 'Thay đổi trạng thái',
    [ActivityType.TASK]: 'Tác vụ',
    [ActivityType.NOTE]: 'Ghi chú',
    [ActivityType.CALL]: 'Cuộc gọi',
    [ActivityType.EMAIL]: 'Email',
    [ActivityType.MEETING]: 'Cuộc họp',
    [ActivityType.SMS]: 'Tin nhắn',
}

export const DASHBOARD_TABLE_SHOW_ONLY = {
    COUNT: 'count',
    VALUE: 'value',
    FEE: 'fee',
} as const

export const SELECTED_BG_COLOR = '!bg-blue-500/30'
export const HIGHLIGHT_BG_COLOR = '!bg-blue-400/10'

export const PRODUCT_TRANSACTION_OPTION: {
    value: DashboardTransactionKeyType
    label: string
}[] = [
    { value: PRODUCT_TRANSACTION.RENT, label: PRODUCT_TRANSACTION_LABEL_MAPPED[PRODUCT_TRANSACTION.RENT] },
    { value: PRODUCT_TRANSACTION.SELL, label: PRODUCT_TRANSACTION_LABEL_MAPPED[PRODUCT_TRANSACTION.SELL] },
]

export const SHOW_ONLY_OPTION: {
    value: DashboardTableShowOnlyType
    label: string
}[] = [
    { value: DASHBOARD_TABLE_SHOW_ONLY.COUNT, label: 'Chỉ số lượng' },
    { value: DASHBOARD_TABLE_SHOW_ONLY.VALUE, label: 'Chỉ giá trị' },
    { value: DASHBOARD_TABLE_SHOW_ONLY.FEE, label: 'Chỉ phí' },
]

export const PRODUCT_UPDATE_LOGS = {
    CREATE: 'CREATE',
    EDIT_SUPPLIER: 'EDIT_SUPPLIER',
    EDIT_PRICE: 'EDIT_PRICE',
    EDIT_SELL_STATUS: 'EDIT_SELL_STATUS',
    EDIT_INFO: 'EDIT_INFO',
    CHANGE_STATUS: 'CHANGE_STATUS',
    LINK_LEAD: 'LINK_LEAD',
    LINK_DEAL: 'LINK_DEAL',
    LINK_TRANSACTION: 'LINK_TRANSACTION',
    LINK_CARE: 'LINK_CARE',
    LINK_LEASE_CONTRACT: 'LINK_LEASE_CONTRACT',
    LINK_PANORAMA: 'LINK_PANORAMA',
    LINK_TOUR: 'LINK_TOUR',
} as const

export const PRODUCT_LOG_TYPE = {
    CREATE: 'CREATE',
    EDIT_SUPPLIER: 'EDIT_SUPPLIER',
    EDIT_PRICE: 'EDIT_PRICE',
    EDIT_SELL_STATUS: 'EDIT_SELL_STATUS',
    EDIT_INFO: 'EDIT_INFO',
    CHANGE_STATUS: 'CHANGE_STATUS',
} as const

export const CHART_LOG_TYPE = {
    CREATE: 'CREATE',
    EDIT_PRICE: 'EDIT_PRICE',
    CHANGE_STATUS: 'CHANGE_STATUS',
    EDIT_INFO: 'EDIT_INFO',
} as const

export const PRODUCT_UPDATE_LOGS_HAS_CHANGES: ProductUpdateLogType[] = [
    PRODUCT_UPDATE_LOGS.EDIT_SUPPLIER,
    PRODUCT_UPDATE_LOGS.EDIT_PRICE,
    PRODUCT_UPDATE_LOGS.EDIT_SELL_STATUS,
    PRODUCT_UPDATE_LOGS.EDIT_INFO,
    PRODUCT_UPDATE_LOGS.CHANGE_STATUS,
] as const

export const PRODUCT_UPDATE_LOGS_LABEL_MAPPED = {
    [PRODUCT_UPDATE_LOGS.CREATE]: 'Thêm mới hàng hoá',
    [PRODUCT_UPDATE_LOGS.EDIT_SUPPLIER]: 'Thay đổi nhà cung cấp',
    [PRODUCT_UPDATE_LOGS.EDIT_PRICE]: 'Cập nhật giá',
    [PRODUCT_UPDATE_LOGS.EDIT_SELL_STATUS]: 'Thay đổi trạng thái bán',
    [PRODUCT_UPDATE_LOGS.EDIT_INFO]: 'Chỉnh sửa thông tin chi tiết',
    [PRODUCT_UPDATE_LOGS.CHANGE_STATUS]: 'Thay đổi trạng thái',
    [PRODUCT_UPDATE_LOGS.LINK_LEAD]: 'Lead #{{target_id}} quan tâm',
    [PRODUCT_UPDATE_LOGS.LINK_DEAL]: 'Deal #{{target_id}} được tạo',
    [PRODUCT_UPDATE_LOGS.LINK_TRANSACTION]: 'Giao dịch #{{target_id}} được tạo',
    [PRODUCT_UPDATE_LOGS.LINK_CARE]: 'Chăm sóc #{{target_id}} được liên kết',
    [PRODUCT_UPDATE_LOGS.LINK_LEASE_CONTRACT]: 'Hợp đồng thuê #{{target_id}} được liên kết',
    [PRODUCT_UPDATE_LOGS.LINK_PANORAMA]: 'Liên kết ảnh panorama',
    [PRODUCT_UPDATE_LOGS.LINK_TOUR]: 'Liên kết tour 360',
}

export const PRODUCT_FIELD_LABELS: Record<string, string> = {
    uploaded_images: 'Ảnh BĐS',
    expert_id: 'Chuyên viên',
    sub_id: 'Mã phụ',
    type_transaction_id: 'Loại giao dịch',
    type_product_id: 'Loại hình',
    status_product_id: 'Trạng thái',
    name: 'Tên',
    slug: 'Đường dẫn',
    zone_province_id: 'Tỉnh/Thành phố',
    zone_ward_id: 'Phường/Xã',
    project_id: 'Dự án',
    address: 'Địa chỉ',
    latitude: 'Vĩ độ',
    longitude: 'Kinh độ',
    divisive: 'Khu/Lô',
    parcel: 'Thửa đất',
    apartment: 'Căn hộ',
    number: 'Số nhà',
    is_corner: 'Vị trí góc',
    street_frontage: 'Mặt tiền',
    gateway: 'Cổng',
    number_floor: 'Số tầng',
    number_bedrooms: 'Số phòng ngủ',
    number_toilets: 'Số toilet',
    furniture_ids: 'Nội thất',
    convenient_ids: 'Tiện ích',
    direction_house_id: 'Hướng nhà',
    direction_balcony_id: 'Hướng ban công',
    note: 'Ghi chú',
    acreage: 'Diện tích',
    is_build: 'Xây dựng',
    price_build: 'Giá xây',
    price_contact: 'Giá hợp đồng',
    total_contact: 'Tổng hợp đồng',
    difference: 'Chênh lệch',
    percent_closed: '% Đã chốt',
    total_closed: 'Tổng đã chốt',
    price_receive: 'Giá nhận',
    total_price_receive: 'Tổng giá nhận',
    price_sell: 'Giá bán',
    total_price_sell: 'Tổng giá bán',
    price_rent: 'Giá thuê',
    deposit_rent: 'Tiền cọc',
    cycle_rent: 'Chu kỳ thuê',
    is_percent_agency: '% Hoa hồng',
    percent_brokerage: '% Môi giới',
    price_brokerage: 'Giá môi giới',
    price_rent_brokerage: 'Môi giới thuê',
    price_note: 'Ghi chú giá',
    tax_type_id: 'Loại thuế',
    supplier_type_id: 'Loại NCC',
    customer_id: 'Khách hàng',
    customer_relation: 'Quan hệ KH',
    supplier_name: 'Tên NCC',
    supplier_phone: 'SĐT NCC',
    supplier_note: 'Ghi chú NCC',
    ref_id: 'Người giới thiệu',
    ref_name: 'Tên người GT',
    ref_phone: 'SĐT người GT',
    send_date: 'Ngày gửi',
    status_transaction_sell_id: 'TT giao dịch bán',
    status_transaction_rent_id: 'TT giao dịch thuê',
    exchange_sub_id: 'Mã GD phụ',
    keywords: 'Từ khóa',
    account_responsible_id: 'TK phụ trách',
    publish_status: 'TT đăng tin',
    highlight_status: 'Nổi bật',
    publish_type_id: 'Loại đăng',
    publish_web: 'Web đăng',
    show_parcel: 'Hiện thửa đất',
    show_floor: 'Hiện tầng',
    show_position: 'Hiện vị trí',
    show_address: 'Hiện địa chỉ',
    show_image: 'Hiện hình ảnh',
    publish_system: 'Đăng hệ thống',
    status_publish_system: 'TT đăng HT',
    note_publish_system: 'Ghi chú đăng HT',
    total_user_sale: 'Tổng user sale',
    user_sale_ids: 'User sale',
    rate: 'Đánh giá',
    fit_ids: 'Phù hợp',
    description: 'Mô tả',
    finish_house: 'Hoàn thiện',
    new_ids: 'Tin',
    created_by: 'Người tạo',
    seo_title: 'Tiêu đề SEO',
    seo_description: 'Mô tả SEO',
    seo_keywords: 'Từ khóa SEO',
    seo_robots: 'SEO Robots',
    product_code: 'Mã hàng hoá',
}

export const LEGEND_ITEM = {
    SELL: 'Hàng Hoá Bán',
    RENT: 'Hàng Hoá Cho Thuê',
} as const

export const PERIOD_TYPE = {
    ALL: 'all',
    LAST_7_DAYS: 'last_7_days',
    THIS_MONTH: 'this_month',
    CUSTOM: 'custom',
} as const

export const ROI_PERIOD_TYPE = {
    MONTH: 'month',
    QUARTER: 'quarter',
} as const

export const TAX_PERIOD = {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
    ALL: 'TẤT CẢ',
} as const

export const QUARTER_DATE_RANGES: Record<string, { start: string; end: string }> = {
    [TAX_PERIOD.Q1]: { start: '01-01', end: '03-31' },
    [TAX_PERIOD.Q2]: { start: '04-01', end: '06-30' },
    [TAX_PERIOD.Q3]: { start: '07-01', end: '09-30' },
    [TAX_PERIOD.Q4]: { start: '10-01', end: '12-31' },
}

export const PERIOD_TYPE_OPTIONS = [
    { value: PERIOD_TYPE.LAST_7_DAYS, label: '7 Ngày Gần Nhất' },
    { value: PERIOD_TYPE.THIS_MONTH, label: '30 Ngày Gần Nhất' },
    { value: PERIOD_TYPE.ALL, label: 'Tất cả' },
]

export const DASHBOARD_SELL_BAR_COLOR = '#FFC533'
export const DASHBOARD_RENT_BAR_COLOR = '#2FA84F'

export const OPPORTUNITY_TYPE = {
    LEAD: 'lead',
    DEAL: 'deal',
} as const

export type OpportunityType = (typeof OPPORTUNITY_TYPE)[keyof typeof OPPORTUNITY_TYPE]

export const CUSTOMER_UPDATE_LOGS = {
    CREATE: 'CREATE',
    EDIT_INFO: 'EDIT_INFO',
} as const

export const CUSTOMER_UPDATE_LOGS_LABEL_MAPPED = {
    [CUSTOMER_UPDATE_LOGS.CREATE]: 'Tạo mới khách hàng',
    [CUSTOMER_UPDATE_LOGS.EDIT_INFO]: 'Chỉnh sửa thông tin',
}

export const CUSTOMER_FIELD_LABELS: Record<string, string> = {
    name: 'Tên',
    phone: 'Số điện thoại',
    email: 'Email',
    gender: 'Giới tính',
    zone_province_id: 'Tỉnh/Thành phố',
    zone_ward_id: 'Phường/Xã',
    address: 'Địa chỉ',
    work_place: 'Nơi làm việc',
    facebook: 'Facebook',
    birthday: 'Ngày sinh',
    note: 'Ghi chú',
    phone_other: 'SĐT khác',
    is_supplier: 'Là NCC',
    is_agency: 'Là Môi giới',
    is_master: 'Là Chủ nhà',
    is_relative: 'Là Người thân',
    is_relatived: 'Là Người giới thiệu',
    is_share: 'Chia sẻ',
    lead_source: 'Nguồn Lead',
    assigned_to: 'Người phụ trách',
}

export const OPPORTUNITY_FIELD_LABELS: Record<string, string> = {
    name: 'Tên Customer',
    phone: 'Số điện thoại',
    email: 'Email',
    product_id: 'Bất động sản',
    stage: 'Trạng thái',
    lead_source: 'Nguồn Lead',
    source_notes: 'Chi tiết nguồn',
    need: 'Nhu cầu',
    product_type_id: 'Loại BĐS quan tâm',
    zone_province_id: 'Tỉnh/Thành phố',
    zone_ward_id: 'Phường/Xã',
    project_id: 'Dự án',
    budget_min: 'Ngân sách tối thiểu',
    budget_max: 'Ngân sách tối đa',
    min_acreage: 'Diện tích tối thiểu',
    max_acreage: 'Diện tích tối đa',
    payment_method: 'Hình thức thanh toán',
    gender: 'Giới tính',
    expected_date: 'Thời gian mong muốn',
    notes: 'Ghi chú',
    assigned_to: 'Người phụ trách',
    customer_id: 'Khách hàng',
    priority: 'Độ ưu tiên',
    lost_reason: 'Lý do thất bại',
}

export const TRANSACTION_FIELD_LABELS: Record<string, string> = {
    ...OPPORTUNITY_FIELD_LABELS,
    contract_date: 'Ngày hợp đồng',
    handover_date: 'Ngày bàn giao',
    final_price: 'Giá chốt',
    stage: 'Trạng thái GD',
    commission_total: 'Tổng hoa hồng',
    commission_paid: 'Hoa hồng đã chi',
    payment_note: 'Ghi chú thanh toán',
    contract_file_url: 'Hợp đồng đính kèm',
    lost_reason: 'Lý do thất bại',
}

export const CUSTOMER_HUB_TIMELINE_ENTITY_TYPE = {
    OPPORTUNITY: 'opportunity',
    TRANSACTION: 'transaction',
    CUSTOMER: 'customer',
} as const

export const CUSTOMER_HUB_TIMELINE_UI_TEXT = {
    EMPTY_VALUE: 'Empty',
    YES: 'Có',
    NO: 'Không',
    SYSTEM: 'Hệ thống',
    INITIAL: 'Khởi tạo',
    NO_DATA: 'Không có dữ liệu',
    NO_CHANGE: 'Không có chi tiết thay đổi',
    CHANGE_DETAILS: 'Chi tiết thay đổi',
    UPDATE_INFO: 'Cập nhật thông tin',
    STAGE_CHANGE: 'Thay đổi trạng thái',
    RECORD: 'Bản ghi',
    LEAD: 'Lead',
    DEAL: 'Deal',
    TRANSACTION: 'Giao dịch',
    CUSTOMER: 'Khách hàng',
} as const

export const CUSTOMER_HUB_TIMELINE_COLOR = {
    STAGE_CHANGE: 'green',
    DEFAULT: 'blue',
} as const

export const CUSTOMER_HUB_TIMELINE_DATE_FORMAT = {
    TIME: 'HH:mm:ss',
    DATE: 'DD/MM/YYYY',
} as const

export const CUSTOMER_HUB_TIMELINE_LEAD_STAGE_SET = new Set<number>(LEAD_STAGES as number[])

export const LEASE_STATUS_OPTIONS = [
    { value: 'UPCOMING', label: 'Chưa có hiệu lực' },
    { value: 'ACTIVE', label: 'Còn hiệu lực' },
    { value: 'EXPIRED', label: 'Đã hết hạn' },
    { value: 'PAUSED', label: 'Đã tạm dừng' },
] as const satisfies DefaultOptionType[]

export const PAYMENT_STATUS_OPTIONS = [
    { value: 'ON_TIME', label: 'Đúng hạn' },
    { value: 'OVERDUE', label: 'Quá hạn' },
] as const satisfies DefaultOptionType[]

export const DEBT_AGE_OPTIONS_TEMPLATE = [
    { value: 'ALL', label: 'Tất cả thời gian nợ' },
    { value: 'DUE_0_30', label: '0 - 30 ngày' },
    { value: 'DUE_31_60', label: '31 - 60 ngày' },
    { value: 'DUE_61_90', label: '61 - 90 ngày' },
    { value: 'DUE_90_PLUS', label: '> 90 ngày' },
] as const satisfies DefaultOptionType[]

export const LEASE_CONTRACT_STATUS = {
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    PAUSED: 'PAUSED',
} as const

export const LEASE_STATUS_COLOR_MAP: Record<string, string> = {
    [LEASE_CONTRACT_STATUS.UPCOMING]: 'default',
    [LEASE_CONTRACT_STATUS.ACTIVE]: 'green',
    [LEASE_CONTRACT_STATUS.EXPIRED]: 'default',
    [LEASE_CONTRACT_STATUS.PAUSED]: 'orange',
}

export const LEASE_STATUS_LABEL_MAP: Record<LeaseContractStatus, string> = {
    [LEASE_CONTRACT_STATUS.UPCOMING]: 'Chưa có hiệu lực',
    [LEASE_CONTRACT_STATUS.ACTIVE]: 'Còn hiệu lực',
    [LEASE_CONTRACT_STATUS.EXPIRED]: 'Đã hết hạn',
    [LEASE_CONTRACT_STATUS.PAUSED]: 'Đã tạm dừng',
}

export const BILLING_CYCLE_VALUE = {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    HALF_YEARLY: 'HALF_YEARLY',
    YEARLY: 'YEARLY',
    ONE_TIME: 'ONE_TIME',
}

export const BILLING_CYCLE_OPTIONS = [
    { value: BILLING_CYCLE_VALUE.MONTHLY, label: '1 Tháng / lần' },
    { value: BILLING_CYCLE_VALUE.QUARTERLY, label: '3 Tháng / lần' },
    { value: BILLING_CYCLE_VALUE.HALF_YEARLY, label: '6 Tháng / lần' },
    { value: BILLING_CYCLE_VALUE.YEARLY, label: '1 Năm / lần' },
    { value: BILLING_CYCLE_VALUE.ONE_TIME, label: 'Thanh toán 1 lần' },
] as const satisfies DefaultOptionType[]

export const BILLING_CYCLE_VALUE_MAP: Record<
    BillingCycleValue,
    { billing_period?: number; billing_unit?: 'MONTH' | 'YEAR' }
> = {
    [BILLING_CYCLE_VALUE.MONTHLY]: { billing_period: 1, billing_unit: 'MONTH' },
    [BILLING_CYCLE_VALUE.QUARTERLY]: { billing_period: 3, billing_unit: 'MONTH' },
    [BILLING_CYCLE_VALUE.HALF_YEARLY]: { billing_period: 6, billing_unit: 'MONTH' },
    [BILLING_CYCLE_VALUE.YEARLY]: { billing_period: 1, billing_unit: 'YEAR' },
    [BILLING_CYCLE_VALUE.ONE_TIME]: { billing_period: undefined, billing_unit: undefined },
}

export const DUE_DATE_RULE_TABS = [
    { key: 'FIXED', label: 'Cố định ngày' },
    { key: 'START_OF_PERIOD', label: 'Đầu mỗi kỳ' },
] as const

export const LEASE_CONTRACT_DUE_DATE_RULE = {
    FIXED: 'FIXED',
    START_OF_PERIOD: 'START_OF_PERIOD',
} as const

export const LEASE_CONTRACT_INVOICE_STATUS = {
    UNPAID: 'UNPAID',
    PAID: 'PAID',
} as const

export const LEASE_CONTRACT_PAYMENT_METHOD = {
    CASH: 'CASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
} as const

export const LEASE_CONTRACT_PAYMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const

export const LEASE_CONTRACT_PAYMENT_SUBTYPE = {
    MONTH: 'MONTH',
    PERIOD: 'PERIOD',
    ADVANCE: 'ADVANCE',
    LATE: 'LATE',
    RENT_DEDUCTION: 'RENT_DEDUCTION',
} as const

export const TRANSFER_TYPE = {
    TENANT: 'TENANT',
    LANDLORD: 'LANDLORD',
    PRODUCT: 'PRODUCT',
} as const

export const LEASE_CONTRACT_LOG_TYPE = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    RENEW: 'RENEW',
    UPDATE_STATUS: 'UPDATE_STATUS',
    ADD_INVOICE: 'ADD_INVOICE',
    ADD_PAYMENT: 'ADD_PAYMENT',
    UPDATE_PAYMENT: 'UPDATE_PAYMENT',
    APPROVE_PAYMENT: 'APPROVE_PAYMENT',
    REJECT_PAYMENT: 'REJECT_PAYMENT',
    UPDATE_PAYMENT_ALLOCATIONS: 'UPDATE_PAYMENT_ALLOCATIONS',
    ADD_TRANSFER: 'ADD_TRANSFER',
    APPLY_TRANSFER: 'APPLY_TRANSFER',
    ADD_DEBT_NOTE: 'ADD_DEBT_NOTE',
    DELETE_DEBT_NOTE: 'DELETE_DEBT_NOTE',
} as const

export const LEASE_CONTRACT_LOG_TYPE_LABEL: Record<string, string> = {
    [LEASE_CONTRACT_LOG_TYPE.CREATE]: 'Tạo mới hợp đồng',
    [LEASE_CONTRACT_LOG_TYPE.UPDATE]: 'Cập nhật hợp đồng',
    [LEASE_CONTRACT_LOG_TYPE.RENEW]: 'Gia hạn hợp đồng',
    [LEASE_CONTRACT_LOG_TYPE.UPDATE_STATUS]: 'Cập nhật trạng thái hợp đồng',
    [LEASE_CONTRACT_LOG_TYPE.ADD_INVOICE]: 'Thêm kỳ hạn',
    [LEASE_CONTRACT_LOG_TYPE.ADD_PAYMENT]: 'Thêm dòng tiền',
    [LEASE_CONTRACT_LOG_TYPE.UPDATE_PAYMENT]: 'Cập nhật dòng tiền',
    [LEASE_CONTRACT_LOG_TYPE.APPROVE_PAYMENT]: 'Duyệt dòng tiền',
    [LEASE_CONTRACT_LOG_TYPE.REJECT_PAYMENT]: 'Từ chối duyệt dòng tiền',
    [LEASE_CONTRACT_LOG_TYPE.UPDATE_PAYMENT_ALLOCATIONS]: 'Cập nhật phân bổ dòng tiền',
    [LEASE_CONTRACT_LOG_TYPE.ADD_TRANSFER]: 'Tạo chuyển nhượng hợp đồng',
    [LEASE_CONTRACT_LOG_TYPE.APPLY_TRANSFER]: 'Áp dụng chuyển nhượng',
    [LEASE_CONTRACT_LOG_TYPE.ADD_DEBT_NOTE]: 'Thêm ghi nợ',
    [LEASE_CONTRACT_LOG_TYPE.DELETE_DEBT_NOTE]: 'Xóa ghi nợ',
}
export const MEDIA_TYPE = {
    TOUR: 'TOUR',
    PANORAMA: 'PANORAMA',
} as const

export type TypeOfMediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE]
export const TRANSACTION_FORM_SECTIONS = {
    MAIN_INFO: '1',
    VALUE_PROCESS: '2',
    CONTRACT_DOCS: '3',
    INTERNAL_NOTES: '4',
} as const

export const TRANSACTION_SECTION_FIELDS: Record<string, string[]> = {
    [TRANSACTION_FORM_SECTIONS.MAIN_INFO]: [
        'customer_id',
        'new_customer_name',
        'new_customer_phone',
        'assigned_to',
        'product_id',
        'opportunity_id',
        'transaction_type',
    ],
    [TRANSACTION_FORM_SECTIONS.VALUE_PROCESS]: [
        'contract_date',
        'handover_date',
        'final_price',
        'stage',
        'commission_total',
        'commission_paid',
        'payment_note',
    ],
    [TRANSACTION_FORM_SECTIONS.CONTRACT_DOCS]: ['contract_file_url'],
    [TRANSACTION_FORM_SECTIONS.INTERNAL_NOTES]: ['notes'],
}
export const DEBT_NOTE_TYPE = {
    GENERAL: 'GENERAL',
    PUNISHMENT: 'PUNISHMENT',
    SERVICE: 'SERVICE',
    OTHER: 'OTHER',
} as const

export const DEBT_NOTE_TARGET_TYPE = {
    LEASE_CONTRACT: 'LEASE_CONTRACT',
} as const

export type TypeOfDebtNoteType = (typeof DEBT_NOTE_TYPE)[keyof typeof DEBT_NOTE_TYPE]
export type TypeOfDebtNoteTargetType = (typeof DEBT_NOTE_TARGET_TYPE)[keyof typeof DEBT_NOTE_TARGET_TYPE]

export const DEBT_NOTE_TYPE_LABELS: Record<TypeOfDebtNoteType, string> = {
    [DEBT_NOTE_TYPE.GENERAL]: 'Chung',
    [DEBT_NOTE_TYPE.PUNISHMENT]: 'Phạt',
    [DEBT_NOTE_TYPE.SERVICE]: 'Dịch vụ',
    [DEBT_NOTE_TYPE.OTHER]: 'Khác',
}

export const DEBT_NOTE_TYPE_TAG_COLORS: Record<TypeOfDebtNoteType, PresetColorType | string> = {
    [DEBT_NOTE_TYPE.GENERAL]: 'gold',
    [DEBT_NOTE_TYPE.PUNISHMENT]: 'volcano',
    [DEBT_NOTE_TYPE.SERVICE]: 'blue',
    [DEBT_NOTE_TYPE.OTHER]: 'default',
}

export const ANTD_SORT_ORDER = {
    ASCEND: 'ascend',
    DESCEND: 'descend',
} as const

export type AntdSortOrder = (typeof ANTD_SORT_ORDER)[keyof typeof ANTD_SORT_ORDER]

export const SORT_DIR = {
    ASC: 'asc',
    DESC: 'desc',
} as const

export type SortDir = (typeof SORT_DIR)[keyof typeof SORT_DIR]

export const antdOrderToApiDir = (order: string | undefined | null): SortDir =>
    order === ANTD_SORT_ORDER.ASCEND ? SORT_DIR.ASC : SORT_DIR.DESC

export const EXPLORE_COLUMNS_CONFIG: Record<string, { title: string; key: string; width: number }> = {
    divisive: { title: 'Phân khu', key: 'divisive', width: 120 },
    parcel: { title: 'Phân lô', key: 'parcel', width: 100 },
    number: { title: 'Số căn/Số ô', key: 'number', width: 120 },
    apartment: { title: 'Mã căn hộ', key: 'apartment', width: 120 },
    floor: { title: 'Tầng', key: 'floor', width: 80 },
    block: { title: 'Block', key: 'block', width: 100 },
    acreage: { title: 'Diện tích', key: 'acreage', width: 120 },
    acreage_build: { title: 'DT XD', key: 'acreage_build', width: 120 },
    frontispiece: { title: 'Mặt tiền', key: 'frontispiece', width: 100 },
    backside: { title: 'Mặt hậu', key: 'backside', width: 100 },
    gateway_1: { title: 'Mặt đường 1', key: 'gateway_1', width: 150 },
    gateway_2: { title: 'Mặt đường 2', key: 'gateway_2', width: 150 },
    number_floor: { title: 'Số tầng', key: 'number_floor', width: 100 },
    number_bedrooms: { title: 'Phòng ngủ', key: 'number_bedrooms', width: 100 },
    number_toilets: { title: 'WC', key: 'number_toilets', width: 80 },
    furniture: { title: 'Nội thất', key: 'furniture', width: 150 },
    direction_house: { title: 'Hướng nhà', key: 'direction_house', width: 120 },
    direction_house_1: { title: 'Hướng nhà 2', key: 'direction_house_1', width: 120 },
    direction_balcony: { title: 'Hướng ban công', key: 'direction_balcony', width: 140 },
    is_corner: { title: 'Căn góc', key: 'is_corner', width: 100 },
    is_corner_center: { title: 'Góc trung tâm', key: 'is_corner_center', width: 120 },
    is_rough: { title: 'Xây thô', key: 'is_rough', width: 100 },
    is_complete: { title: 'Hoàn thiện', key: 'is_complete', width: 100 },
    status_building: { title: 'Trạng thái XD', key: 'status_building', width: 150 },
    status: { title: 'Trạng thái', key: 'status', width: 120 },
    hitcount: { title: 'Lượt xem', key: 'hitcount', width: 100 },
    url: { title: 'URL', key: 'url', width: 200 },
    note: { title: 'Ghi chú', key: 'note', width: 200 },
}

export const HOUSE_DIRECTION_OPTIONS = [
    { label: 'Đông', value: 'Đông' },
    { label: 'Tây', value: 'Tây' },
    { label: 'Nam', value: 'Nam' },
    { label: 'Bắc', value: 'Bắc' },
    { label: 'Đông Bắc', value: 'Đông Bắc' },
    { label: 'Đông Nam', value: 'Đông Nam' },
    { label: 'Tây Bắc', value: 'Tây Bắc' },
    { label: 'Tây Nam', value: 'Tây Nam' },
]

export const FILTERABLE_FIELDS = [
    { key: 'divisive', label: 'Phân khu', type: 'text' },
    { key: 'parcel', label: 'Lô', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'number', label: 'Số căn/Số ô', type: 'text' },
    { key: 'apartment', label: 'Mã căn hộ', type: 'text' },
    { key: 'floor', label: 'Tầng', type: 'text' },
    { key: 'acreage', label: 'Diện tích', type: 'range' },
    { key: 'acreage_build', label: 'DT XD', type: 'range' },
    { key: 'frontispiece', label: 'Mặt tiền', type: 'number' },
    { key: 'backside', label: 'Mặt hậu', type: 'number' },
    { key: 'gateway_1', label: 'Đường 1', type: 'text' },
    { key: 'gateway_2', label: 'Đường 2', type: 'text' },
    { key: 'direction_house', label: 'Hướng nhà 1', type: 'select', options: HOUSE_DIRECTION_OPTIONS },
    { key: 'direction_house_1', label: 'Hướng nhà 2', type: 'select', options: HOUSE_DIRECTION_OPTIONS },
    { key: 'direction_balcony', label: 'Hướng b/c', type: 'select', options: HOUSE_DIRECTION_OPTIONS },
    { key: 'furniture', label: 'Nội thất', type: 'text' },
    { key: 'status_building', label: 'TT XD', type: 'text' },
    { key: 'status', label: 'Trạng thái', type: 'text' },
    { key: 'is_corner', label: 'Căn góc', type: 'boolean' },
    { key: 'is_corner_center', label: 'Góc TT', type: 'boolean' },
    { key: 'is_rough', label: 'Xây thô', type: 'boolean' },
    { key: 'is_complete', label: 'Hoàn thiện', type: 'boolean' },
    { key: 'note', label: 'Ghi chú', type: 'text' },
]

export const PAYMENT_METHOD_LABELS: Record<LeaseContractPaymentMethod, string> = {
    [LEASE_CONTRACT_PAYMENT_METHOD.BANK_TRANSFER]: 'Chuyển khoản',
    [LEASE_CONTRACT_PAYMENT_METHOD.CASH]: 'Tiền mặt',
    [LEASE_CONTRACT_PAYMENT_METHOD.CREDIT_CARD]: 'Thẻ / POS',
}

export const PAYMENT_STATUS_LABELS: Record<LeaseContractPaymentStatus, string> = {
    [LEASE_CONTRACT_PAYMENT_STATUS.PENDING]: 'Chờ duyệt',
    [LEASE_CONTRACT_PAYMENT_STATUS.APPROVED]: 'Đã duyệt',
    [LEASE_CONTRACT_PAYMENT_STATUS.REJECTED]: 'Bị từ chối',
}

export const PAYMENT_STATUS_COLOR: Record<string, string> = {
    [LEASE_CONTRACT_PAYMENT_STATUS.APPROVED]: 'green',
    [LEASE_CONTRACT_PAYMENT_STATUS.PENDING]: 'default',
    [LEASE_CONTRACT_PAYMENT_STATUS.REJECTED]: 'red',
}

export const PROJECT_EXPLORE_CONTEXT = {
    TAB: 'tab',
    VALUE: 'explore',
} as const

export const TASK_STATUS = {
    PENDING: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    CANCELLED: 4,
} as const

export type TaskStatusType = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
    [TASK_STATUS.PENDING]: 'Chờ xử lý',
    [TASK_STATUS.IN_PROGRESS]: 'Đang thực hiện',
    [TASK_STATUS.COMPLETED]: 'Hoàn thành',
    [TASK_STATUS.CANCELLED]: 'Đã hủy',
}

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    value: Number(value),
    label,
}))

export const TASK_PRIORITY = {
    NORMAL: 'normal',
    HIGH: 'high',
} as const

export type TaskPriorityType = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]

export const TASK_PRIORITY_LABELS: Record<TaskPriorityType, string> = {
    [TASK_PRIORITY.NORMAL]: 'Bình thường',
    [TASK_PRIORITY.HIGH]: 'Cao',
}

export const REGEX_REMOVE_SECONDS = /:\d{2}\s/

export const INTERACTION_OPTIONS = [
    { value: 'call', label: 'Gọi điện' },
    { value: 'zalo', label: 'Zalo/Chat' },
    { value: 'meeting', label: 'Gặp mặt' },
]

export const CARE_TABS = {
    LIST: 'list',
    CHART: 'chart',
} as const

export const CARE_DETAIL_TABS = [
    { key: 'tax', label: 'Quản lý Thuế' },
    { key: 'roi', label: 'Hiệu quả ROI' },
    { key: 'cashflow', label: 'Dòng tiền' },
    { key: 'tasks', label: 'Tác vụ' },
    { key: 'log', label: 'Nhật ký' },
    { key: 'assets-contracts', label: 'Tài sản & HĐ' },
] as const

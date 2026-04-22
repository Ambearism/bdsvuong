export const RESOURCE_TYPE = {
    MODULE: 'MODULE',
    NEW: 'NEW',
    VIEW_360: 'VIEW_360',
    TOUR_360: 'TOUR_360',
    ALBUM_360: 'ALBUM_360',
    LEAD: 'LEAD',
    DEAL: 'DEAL',
    PIPELINE_PROCESS: 'PIPELINE_PROCESS',
    TASK: 'TASK',
    CONTRACT: 'CONTRACT',
    DASHBOARD: 'DASHBOARD',
    STAFF: 'STAFF',
    SETTING: 'SETTING',
    ROLE: 'ROLE',

    LEASE_CONTRACT: 'LEASE_CONTRACT',
    PRODUCT_HISTORY_LOG: 'PRODUCT_HISTORY_LOG',
    CARE_CASE: 'CARE_CASE',
    CASH_FLOW: 'CASH_FLOW',
    TAX_CONFIGURATION: 'TAX_CONFIGURATION',
    GROUP_LINK: 'GROUP_LINK',
    REPORT: 'REPORT',

    // nhóm phân quyền
    MEDIA_360: 'MEDIA_360',
    LEAD_DEAL_PROCESS: 'LEAD_DEAL_PROCESS',
    OVERVIEW: 'OVERVIEW',
} as const

export const ACTION = {
    READ: 'read',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
} as const

export const ACTION_LABEL = {
    [ACTION.READ]: 'Xem',
    [ACTION.CREATE]: 'Thêm mới',
    [ACTION.UPDATE]: 'Cập nhật',
    [ACTION.DELETE]: 'Xóa',
} as const

export const RESOURCE_TYPE_LABEL = {
    MODULE: 'Module',
    NEW: 'Bài viết',
    VIEW_360: 'Ảnh 360',
    TOUR_360: 'Tour 360',
    ALBUM_360: 'Album 360',
    LEAD: 'Lead',
    DEAL: 'Deal',
    PIPELINE_PROCESS: 'Pipeline tiến trình',
    TASK: 'Công việc',
    CONTRACT: 'Giao dịch & Hợp đồng',
    DASHBOARD: 'Tổng quan',
    STAFF: 'Nhân viên',
    SETTING: 'Cài đặt Footer',
    ROLE: 'Vai trò & Quyền hạn',

    LEASE_CONTRACT: 'Hợp đồng thuê',
    CARE_CASE: 'Quản lý Chăm sóc (Care)',
    CASH_FLOW: 'Dòng tiền',
    TAX_CONFIGURATION: 'Cấu hình danh mục chi phí',
    GROUP_LINK: 'Tổ hợp link',
    REPORT: 'Báo cáo',

    MEDIA_360: 'View 360',
    LEAD_DEAL_PROCESS: 'Tiến Trình Lead → Deal',
    OVERVIEW: 'Tổng quan & Báo cáo',
}

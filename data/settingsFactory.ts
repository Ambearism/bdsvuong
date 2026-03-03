
import { TaxConfig, RevenueCode, SettingsAuditLog, RentalCategory, CostCategoryGroup, CostCategoryItem } from '../types';

// ... existing mock data definitions ...
let TAX_CONFIG: TaxConfig = {
    taxYearBasis: 'PAID_DATE',
    includePrepaidRevenue: true,
    thresholdEnabled: true,
    thresholdAmount: 100000000,
    alertThresholdPercent: 90,
    filingCycle: 'QUARTER',
    filingDeadlineDay: 30,
    reminderDaysBefore: [7, 3, 1],
    updatedAt: '2023-11-20T10:00:00Z',
    updatedBy: 'Admin'
};

let REVENUE_CODES: RevenueCode[] = [
    { id: 'RC_001', code: 'DT01', name: 'Doanh thu tiền thuê (Rent)', category: 'RENT', isTaxable: true, isSystem: true, description: 'Gồm tiền thuê tháng, kỳ, trả trước', isActive: true },
    { id: 'RC_002', code: 'DT02', name: 'Dịch vụ & Khai thác khác', category: 'SERVICE', isTaxable: true, isSystem: true, description: 'Phí dịch vụ, gửi xe, tiện ích chênh lệch', isActive: true },
    { id: 'RC_003', code: 'DT03', name: 'Bồi thường & Phạt', category: 'PENALTY', isTaxable: true, isSystem: true, description: 'Tiền phạt vi phạm, bồi thường hư hỏng', isActive: true },
    { id: 'RC_004', code: 'DT04', name: 'Cọc mất (Forfeit)', category: 'DEPOSIT_FORFEIT', isTaxable: true, isSystem: true, description: 'Tiền cọc không hoàn lại chuyển thành thu nhập', isActive: true },
    { id: 'RC_005', code: 'DT99', name: 'Thu nhập khác', category: 'OTHER', isTaxable: true, isSystem: false, description: 'Các khoản thu nhập chịu thuế khác', isActive: true }
];

let AUDIT_LOGS: SettingsAuditLog[] = [
    { id: 'log_1', section: 'TAX_SETTINGS', action: 'UPDATE', actor: 'Nguyễn Admin', timestamp: '2023-11-20T10:00:00Z', changes: 'Thay đổi ngưỡng thuế từ 0 -> 100,000,000 VNĐ' },
    { id: 'log_2', section: 'TAX_SETTINGS', action: 'CREATE', actor: 'System', timestamp: '2023-10-01T00:00:00Z', changes: 'Khởi tạo cấu hình mặc định' }
];

let RENTAL_CATEGORIES: RentalCategory[] = [
    { id: 'cat_1', code: 'RES', name: 'Căn hộ (Residential)', taxRatePercent: 10, isDefault: true, description: 'Cho thuê để ở' },
    { id: 'cat_2', code: 'COM', name: 'Văn phòng (Commercial)', taxRatePercent: 10, isDefault: false, description: 'Cho thuê làm văn phòng' },
];

let COST_GROUPS: CostCategoryGroup[] = [
    // Revenue Groups
    { id: 'GRP_RENT', code: 'RENT_INC', name: 'Doanh thu cho thuê', description: 'Khoản thu từ tiền thuê nhà', type: 'REVENUE', displayOrder: 1, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_OTHER_REV', code: 'OTHER_REV', name: 'Khoản thu khác', description: 'Các khoản thu nhập khác', type: 'REVENUE', displayOrder: 2, isActive: true, isDefaultSeeded: true },

    // Expense Groups
    { id: 'GRP_TAX_LEGAL', code: 'TAX_LEGAL', name: 'Chi phí thuế & Nghĩa vụ pháp lý', description: 'Các khoản thuế, phí môn bài', type: 'EXPENSE', displayOrder: 1, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_LEGAL', code: 'LEGAL', name: 'Chi phí pháp lý', description: 'PCCC, ANTT, Giấy phép', type: 'EXPENSE', displayOrder: 2, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_MAINT', code: 'MAINTENANCE', name: 'Chi phí kỹ thuật - bảo trì - sửa chữa', description: 'Bảo trì định kỳ', type: 'EXPENSE', displayOrder: 3, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_REPAIR', code: 'REPAIR', name: 'Sửa chữa phát sinh', description: 'Sửa chữa đột xuất', type: 'EXPENSE', displayOrder: 4, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_UPGRADE', code: 'UPGRADE', name: 'Chi phí cải tạo / Nâng cấp', description: 'Sơn sửa, nội thất', type: 'EXPENSE', displayOrder: 5, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_OP', code: 'OPERATIONS', name: 'Chi phí vận hành thường xuyên', description: 'Quản lý, dịch vụ', type: 'EXPENSE', displayOrder: 6, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_UTIL', code: 'UTILITIES', name: 'Chi phí tiện ích', description: 'Điện, nước, internet', type: 'EXPENSE', displayOrder: 7, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_VACANT', code: 'VACANCY', name: 'Chi phí trống phòng', description: 'Phòng trống, giảm giá', type: 'EXPENSE', displayOrder: 8, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_TENANT', code: 'TENANT', name: 'Chi phí liên quan đến khách thuê', description: 'Môi giới, quảng cáo', type: 'EXPENSE', displayOrder: 9, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_RISK', code: 'RISK', name: 'Chi phí tranh chấp / rủi ro', description: 'Các rủi ro phát sinh', type: 'EXPENSE', displayOrder: 10, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_FINANCE', code: 'FINANCE', name: 'Chi phí tài chính', description: 'Lãi vay, bảo hiểm', type: 'EXPENSE', displayOrder: 11, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_OPP', code: 'OPPORTUNITY', name: 'Chi phí cơ hội', description: 'Chi phí cơ hội', type: 'EXPENSE', displayOrder: 12, isActive: true, isDefaultSeeded: true }
];

let COST_ITEMS: CostCategoryItem[] = [
    // Revenue Items
    { id: 'ITM_RENT_MONTHLY', groupId: 'GRP_RENT', code: 'RENT_M', name: 'Tiền thuê tháng', description: 'Tiền thuê định kỳ', examples: '', type: 'REVENUE', tenantRelatedFlag: true, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_SERVICE_FEE', groupId: 'GRP_OTHER_REV', code: 'SVC_FEE', name: 'Phí dịch vụ', description: 'Thu phí dịch vụ tiện ích', examples: '', type: 'REVENUE', tenantRelatedFlag: true, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },

    // Expense Items
    // I
    { id: 'ITM_1_1', groupId: 'GRP_TAX_LEGAL', code: 'TAX_VAT', name: 'Thuế GTGT', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_1_2', groupId: 'GRP_TAX_LEGAL', code: 'TAX_PIT', name: 'Thuế TNCN', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_1_3', groupId: 'GRP_TAX_LEGAL', code: 'FEE_LICENSE', name: 'Lệ phí môn bài', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_1_4', groupId: 'GRP_TAX_LEGAL', code: 'TAX_ARREARS', name: 'Thuế truy thu / phạt', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // II
    { id: 'ITM_2_1', groupId: 'GRP_LEGAL', code: 'LEG_FIRE', name: 'Hồ sơ PCCC', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_2_2', groupId: 'GRP_LEGAL', code: 'LEG_SECURITY', name: 'ANTT', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_2_3', groupId: 'GRP_LEGAL', code: 'LEG_RENEWAL', name: 'Gia hạn giấy phép', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_2_4', groupId: 'GRP_LEGAL', code: 'LEG_INSPEC', name: 'Phí kiểm tra, nghiệm thu', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // III
    { id: 'ITM_3_1', groupId: 'GRP_MAINT', code: 'MNT_ROUTINE', name: 'Bảo trì định kỳ', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_3_2', groupId: 'GRP_MAINT', code: 'MNT_ELEC', name: 'Điện', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_3_3', groupId: 'GRP_MAINT', code: 'MNT_WATER', name: 'Nước', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_3_4', groupId: 'GRP_MAINT', code: 'MNT_WATERPRF', name: 'Chống thấm', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },
    { id: 'ITM_3_5', groupId: 'GRP_MAINT', code: 'MNT_HVAC', name: 'Điều hoà, máy bơm', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 5, isDefaultSeeded: true },
    { id: 'ITM_3_6', groupId: 'GRP_MAINT', code: 'MNT_FIRE', name: 'Hệ thống PCCC', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 6, isDefaultSeeded: true },

    // IV
    { id: 'ITM_4_1', groupId: 'GRP_REPAIR', code: 'REP_USAGE', name: 'Hỏng do sử dụng', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_4_2', groupId: 'GRP_REPAIR', code: 'REP_AGING', name: 'Xuống cấp tự nhiên', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_4_3', groupId: 'GRP_REPAIR', code: 'REP_INCIDENT', name: 'Sự cố bất ngờ (vỡ ống, thấm nặng…)', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },

    // V
    { id: 'ITM_5_1', groupId: 'GRP_UPGRADE', code: 'UPG_PAINT', name: 'Sơn sửa', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_5_2', groupId: 'GRP_UPGRADE', code: 'UPG_FURNI', name: 'Thay nội thất', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_5_3', groupId: 'GRP_UPGRADE', code: 'UPG_CONVERT', name: 'Chuyển đổi công năng', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },

    // VI
    { id: 'ITM_6_1', groupId: 'GRP_OP', code: 'OP_CARE', name: 'Quản lý & chăm sóc', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_6_2', groupId: 'GRP_OP', code: 'OP_MGT_FEE', name: 'Phí quản lý cho thuê', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_6_3', groupId: 'GRP_OP', code: 'OP_ASSET_CARE', name: 'Phí dịch vụ Asset Care', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_6_4', groupId: 'GRP_OP', code: 'OP_COLLECTION', name: 'Phí thu tiền – nhắc nợ – báo cáo', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // VII
    { id: 'ITM_7_1', groupId: 'GRP_UTIL', code: 'UTL_CONDO', name: 'Phí quản lý chung cư', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_7_2', groupId: 'GRP_UTIL', code: 'UTL_NET', name: 'Internet / camera', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_7_3', groupId: 'GRP_UTIL', code: 'UTL_COMMON', name: 'Điện nước khu vực chung', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_7_4', groupId: 'GRP_UTIL', code: 'UTL_CLEAN', name: 'Vệ sinh khu chung', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // VIII
    { id: 'ITM_8_1', groupId: 'GRP_VACANT', code: 'VAC_MONTH', name: 'Tháng không có khách thuê', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_8_2', groupId: 'GRP_VACANT', code: 'VAC_DISCOUNT', name: 'Giảm giá để giữ khách', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_8_3', groupId: 'GRP_VACANT', code: 'VAC_PROMO', name: 'Khuyến mại / miễn tiền thuê', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },

    // IX
    { id: 'ITM_9_1', groupId: 'GRP_TENANT', code: 'TNT_BROKER', name: 'Chi phí môi giới / tìm khách', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: true, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_9_2', groupId: 'GRP_TENANT', code: 'TNT_FEE', name: 'Phí môi giới', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: true, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_9_3', groupId: 'GRP_TENANT', code: 'TNT_ADS', name: 'Quảng cáo', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: true, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_9_4', groupId: 'GRP_TENANT', code: 'TNT_REFERRAL', name: 'Hoa hồng giới thiệu', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: true, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // X
    { id: 'ITM_10_1', groupId: 'GRP_RISK', code: 'RSK_LEGAL', name: 'Pháp lý khi tranh chấp', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_10_2', groupId: 'GRP_RISK', code: 'RSK_DAMAGE', name: 'Sửa chữa do khách phá', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_10_3', groupId: 'GRP_RISK', code: 'RSK_DEPOSIT', name: 'Mất tiền cọc', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },

    // XI
    { id: 'ITM_11_1', groupId: 'GRP_FINANCE', code: 'FIN_CAPITAL', name: 'Chi phí vốn', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_11_2', groupId: 'GRP_FINANCE', code: 'FIN_INTEREST', name: 'Lãi vay ngân hàng', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_11_3', groupId: 'GRP_FINANCE', code: 'FIN_PREPAY', name: 'Phí phạt trả nợ sớm', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true },
    { id: 'ITM_11_4', groupId: 'GRP_FINANCE', code: 'FIN_INSURE', name: 'Chi phí bảo hiểm tài sản', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 4, isDefaultSeeded: true },

    // XII
    { id: 'ITM_12_1', groupId: 'GRP_OPP', code: 'OPP_1', name: 'Giữ tài sản kém hiệu quả', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_12_2', groupId: 'GRP_OPP', code: 'OPP_2', name: 'Không cho thuê được', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 2, isDefaultSeeded: true },
    { id: 'ITM_12_3', groupId: 'GRP_OPP', code: 'OPP_3', name: 'Cho thuê sai mô hình', description: '', examples: '', type: 'EXPENSE', tenantRelatedFlag: false, isTaxDeductible: false, requiresAttachment: false, isActive: true, displayOrder: 3, isDefaultSeeded: true }
];

// --- API METHODS ---

export const getTaxConfig = async (): Promise<TaxConfig> => {
    return new Promise(resolve => setTimeout(() => resolve({ ...TAX_CONFIG }), 400));
};

export const saveTaxConfig = async (newConfig: TaxConfig): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (newConfig.thresholdAmount !== TAX_CONFIG.thresholdAmount) {
                AUDIT_LOGS.unshift({
                    id: `log_${Date.now()}`,
                    section: 'TAX_SETTINGS',
                    action: 'UPDATE',
                    actor: 'Bạn (Admin)',
                    timestamp: new Date().toISOString(),
                    changes: `Thay đổi ngưỡng thuế: ${new Intl.NumberFormat('vi-VN').format(TAX_CONFIG.thresholdAmount)} -> ${new Intl.NumberFormat('vi-VN').format(newConfig.thresholdAmount)}`
                });
            }
            TAX_CONFIG = { ...newConfig, updatedAt: new Date().toISOString() };
            resolve();
        }, 600);
    });
};

export const getRevenueCodes = async (): Promise<RevenueCode[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...REVENUE_CODES]), 400));
};

export const saveRevenueCode = async (code: RevenueCode): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = REVENUE_CODES.findIndex(c => c.id === code.id);
            if (idx >= 0) REVENUE_CODES[idx] = code;
            else REVENUE_CODES.push({ ...code, id: `RC_${Date.now()}` });
            resolve();
        }, 500);
    });
};

export const getAuditLogs = async (): Promise<SettingsAuditLog[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...AUDIT_LOGS]), 400));
};

export const getRentalCategories = async (): Promise<RentalCategory[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...RENTAL_CATEGORIES]), 400));
};

export const saveRentalCategory = async (cat: RentalCategory): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = RENTAL_CATEGORIES.findIndex(c => c.id === cat.id);
            if (idx >= 0) RENTAL_CATEGORIES[idx] = cat;
            else RENTAL_CATEGORIES.push({ ...cat, id: `cat_${Date.now()}` });
            resolve();
        }, 500);
    });
};

export const deleteRentalCategory = async (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            RENTAL_CATEGORIES = RENTAL_CATEGORIES.filter(c => c.id !== id);
            resolve();
        }, 500);
    });
};

export const getCostGroups = async (): Promise<CostCategoryGroup[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...COST_GROUPS]), 400));
};

export const saveCostGroup = async (group: CostCategoryGroup): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = COST_GROUPS.findIndex(g => g.id === group.id);
            if (idx >= 0) COST_GROUPS[idx] = group;
            else COST_GROUPS.push({ ...group, id: `GRP_${Date.now()}` });
            resolve();
        }, 500);
    });
};

export const getCostItems = async (): Promise<CostCategoryItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...COST_ITEMS]), 400));
};

export const saveCostItem = async (item: CostCategoryItem): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = COST_ITEMS.findIndex(i => i.id === item.id);
            if (idx >= 0) COST_ITEMS[idx] = item;
            else COST_ITEMS.push({ ...item, id: `ITM_${Date.now()}` });
            resolve();
        }, 500);
    });
};

export const deleteCostItem = async (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            COST_ITEMS = COST_ITEMS.filter(i => i.id !== id);
            resolve();
        }, 500);
    });
};

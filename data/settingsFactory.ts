
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
    { id: 'GRP_TENANT', code: 'TENANT', name: 'Liên quan khách thuê', description: 'Chi phí phát sinh do khách thuê', displayOrder: 1, isActive: true, isDefaultSeeded: true },
    { id: 'GRP_TECH', code: 'TECH', name: 'Kỹ thuật & Bảo trì', description: 'Sửa chữa, bảo dưỡng thiết bị', displayOrder: 2, isActive: true, isDefaultSeeded: true }
];

let COST_ITEMS: CostCategoryItem[] = [
    { id: 'ITM_BROKER', groupId: 'GRP_TENANT', code: 'BROKERAGE', name: 'Phí môi giới', description: 'Hoa hồng cho người giới thiệu', examples: '1 tháng tiền nhà', tenantRelatedFlag: true, isTaxDeductible: true, requiresAttachment: true, isActive: true, displayOrder: 1, isDefaultSeeded: true },
    { id: 'ITM_REPAIR_INCIDENT', groupId: 'GRP_TECH', code: 'REPAIR', name: 'Sửa chữa sự cố', description: 'Hỏng hóc đột xuất', examples: 'Vỡ ống nước, cháy bóng đèn', tenantRelatedFlag: false, isTaxDeductible: true, requiresAttachment: false, isActive: true, displayOrder: 1, isDefaultSeeded: true }
];

// --- API METHODS ---

export const getTaxConfig = async (): Promise<TaxConfig> => {
    return new Promise(resolve => setTimeout(() => resolve({...TAX_CONFIG}), 400));
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

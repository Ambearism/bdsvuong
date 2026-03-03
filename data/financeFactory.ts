
import { CashflowEntry, AssetCareFeeConfig, RevenueCode, SettingsAuditLog, CashflowCategory, CashflowSubtype } from '../types';

// --- MOCK DATA STORES ---

let PENDING_CASHFLOWS: CashflowEntry[] = [
    {
        id: 'cf_pending_1', refNo: 'TX-998811', date: '2023-11-29T10:00:00Z', amountTy: 0.015, currency: 'VND',
        method: 'bank_transfer', payer: 'Nguyễn Văn An', type: 'RENT', status: 'PENDING',
        createdBy: 'Trịnh Trung Hiếu', createdAt: '2023-11-29T10:05:00Z', isEnteredOnBehalf: true, onBehalfNote: 'Khách gửi ảnh UNC qua Zalo',
        allocatedAmountTy: 0, unappliedAmountTy: 0.015,
        attachments: [{id:'att1', fileName:'UNC_T11.jpg', sizeKb: 250, url: '#'}], note: 'Thanh toán tiền nhà T11',
        isTaxable: true
    },
    {
        id: 'cf_pending_2', refNo: 'CASH-002', date: '2023-11-28T15:30:00Z', amountTy: 0.005, currency: 'VND',
        method: 'cash', payer: 'Lê Thu Hà', type: 'OTHER_REVENUE', status: 'PENDING',
        createdBy: 'Lê Thị B', createdAt: '2023-11-28T16:00:00Z', isEnteredOnBehalf: false,
        allocatedAmountTy: 0, unappliedAmountTy: 0.005,
        attachments: [], note: 'Phí dịch vụ vệ sinh bổ sung',
        isTaxable: true
    }
];

let FEE_CONFIG: AssetCareFeeConfig = {
    id: 'fee_conf_default',
    cycle: 'MONTH',
    basis: 'REVENUE_ALL',
    excludeDeposits: true,
    formula: 'PERCENT',
    fixedAmount: 0,
    percentRate: 5, // 5%
    minFee: 0.0005, // 500k
    maxFee: 0.05, // 50tr
    updatedAt: '2023-10-01T00:00:00Z',
    updatedBy: 'Admin'
};

// --- API ---

export const getPendingCashflows = async (): Promise<CashflowEntry[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...PENDING_CASHFLOWS]), 400));
};

export const getAssetCareFeeConfig = async (): Promise<AssetCareFeeConfig> => {
    return new Promise(resolve => setTimeout(() => resolve({...FEE_CONFIG}), 400));
};

export const saveAssetCareFeeConfig = async (newConfig: AssetCareFeeConfig): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            FEE_CONFIG = { ...newConfig, updatedAt: new Date().toISOString() };
            resolve();
        }, 600);
    });
};

export const approveCashflow = async (id: string, data: { revenueCode: string, isTaxable: boolean, type: string, category?: CashflowCategory, subtype?: CashflowSubtype }, approverName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const idx = PENDING_CASHFLOWS.findIndex(c => c.id === id);
            if (idx === -1) return reject("Entry not found");
            
            const entry = PENDING_CASHFLOWS[idx];
            
            // Mock Rule: Creator cannot approve
            if (entry.createdBy === approverName) {
                return reject("Vi phạm quy tắc: Người nhập không được tự duyệt dòng tiền.");
            }

            // Move to Approved (Mock: remove from pending list)
            PENDING_CASHFLOWS.splice(idx, 1);
            
            console.log(`[Finance] Approved ${id} by ${approverName} with code ${data.revenueCode}`);
            resolve();
        }, 800);
    });
};

export const rejectCashflow = async (id: string, reason: string, rejectorName: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const idx = PENDING_CASHFLOWS.findIndex(c => c.id === id);
            if (idx !== -1) {
                // In real app: Update status to REJECTED, don't delete
                PENDING_CASHFLOWS.splice(idx, 1); 
                console.log(`[Finance] Rejected ${id} by ${rejectorName}: ${reason}`);
            }
            resolve();
        }, 500);
    });
};

export const createAdjustment = async (originalId: string, adjustmentData: any): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`[Finance] Created adjustment for ${originalId}`, adjustmentData);
            resolve();
        }, 800);
    });
};


import { CostEntry } from '../types';

// Mock Data
let COST_ENTRIES: CostEntry[] = [
    {
        id: 'COST_001',
        refNo: 'EXP-2311-001',
        date: '2023-11-25T10:00:00Z',
        amountTy: 0.005, // 5tr
        groupId: 'GRP_TECH',
        itemId: 'ITM_REPAIR_INCIDENT',
        assetId: '125', // Nhà Thái Hà
        leaseId: 'lease_1',
        tenantId: 'cus_1',
        note: 'Sửa máy bơm nước tầng 3 bị cháy',
        attachments: [],
        createdBy: 'Admin',
        createdAt: '2023-11-25T10:00:00Z'
    },
    {
        id: 'COST_002',
        refNo: 'EXP-2311-002',
        date: '2023-11-20T09:00:00Z',
        amountTy: 0.012, // 12tr
        groupId: 'GRP_TENANT',
        itemId: 'ITM_BROKER',
        assetId: '123', // CC Ocean Park
        leaseId: 'lease_2',
        note: 'Phí môi giới cho sale Trịnh Trung Hiếu',
        attachments: [{ id: 'att1', fileName: 'Xac_nhan_phi_MG.pdf', url: '#' }],
        createdBy: 'Admin',
        createdAt: '2023-11-20T09:00:00Z'
    }
];

export const getCostEntries = async (): Promise<CostEntry[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...COST_ENTRIES].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())), 400));
};

export const saveCostEntry = async (entry: CostEntry): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = COST_ENTRIES.findIndex(c => c.id === entry.id);
            if (idx >= 0) {
                COST_ENTRIES[idx] = entry;
            } else {
                COST_ENTRIES.unshift({ ...entry, id: `COST_${Date.now()}` });
            }
            resolve();
        }, 600);
    });
};

export const deleteCostEntry = async (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            COST_ENTRIES = COST_ENTRIES.filter(c => c.id !== id);
            resolve();
        }, 500);
    });
};

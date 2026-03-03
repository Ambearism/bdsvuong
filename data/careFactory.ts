import { CareCase, CareCaseHubData, Inspection } from '../types';

let MOCK_CARE_CASES: CareCase[] = [
    {
        id: 'CASE-2023-001',
        ownerId: 'cus_3',
        ownerName: 'Phạm Minh Cường',
        ownerPhone: '0909090909',
        status: 'active',
        riskScore: 10,
        lastContactDate: '2023-11-20T10:00:00Z',
        assignedTo: 'Trịnh CSKH',
        linkedProperties: [{ id: '125', code: '#125', name: 'Nhà riêng Thái Hà' }],
        linkedLeases: [{ id: 'lease_1', code: 'HDT-23001' }],
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-11-25T00:00:00Z',
        careFeeMillion: 5.5
    },
    {
        id: 'CASE-2023-002',
        ownerId: 'cus_2',
        ownerName: 'Trần Thị Bích',
        ownerPhone: '0987654321',
        status: 'active',
        riskScore: 5,
        lastContactDate: '2023-11-28T14:00:00Z',
        assignedTo: 'Lê CSKH',
        linkedProperties: [
            { id: '123', code: '#123', name: 'CC Ocean Park' },
            { id: '124', code: '#124', name: 'LK KĐT Văn Phú' }
        ],
        linkedLeases: [{ id: 'lease_2', code: 'HDT-23002' }],
        createdAt: '2023-11-01T00:00:00Z',
        updatedAt: '2023-11-28T00:00:00Z',
        careFeeMillion: 3.2
    }
];

export const getCareCases = async (): Promise<CareCase[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_CARE_CASES]);
        }, 400);
    });
};

export const updateCareCaseStatus = async (id: string, status: 'active' | 'inactive'): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const idx = MOCK_CARE_CASES.findIndex(c => c.id === id);
            if (idx !== -1) {
                MOCK_CARE_CASES[idx].status = status;
                MOCK_CARE_CASES[idx].updatedAt = new Date().toISOString();
            }
            resolve();
        }, 300);
    });
};

export const updateCareCase = async (id: string, data: Partial<CareCase>): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const idx = MOCK_CARE_CASES.findIndex(c => c.id === id);
            if (idx !== -1) {
                MOCK_CARE_CASES[idx] = { ...MOCK_CARE_CASES[idx], ...data, updatedAt: new Date().toISOString() };
            }
            resolve();
        }, 400);
    });
};

export const updateCareFee = async (id: string, fee: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const idx = MOCK_CARE_CASES.findIndex(c => c.id === id);
            if (idx !== -1) {
                MOCK_CARE_CASES[idx].careFeeMillion = fee;
                MOCK_CARE_CASES[idx].updatedAt = new Date().toISOString();
            }
            resolve();
        }, 300);
    });
};

export const getCareCaseHub = async (id: string): Promise<CareCaseHubData | null> => {
    const cases = await getCareCases();
    const c = cases.find(item => item.id === id);
    if (!c) return null;

    // Mock data based on business logic
    return {
        case: c,
        stats: { openTasks: 3, overdueTasks: 1, totalLogs: 12 },
        tasks: [
            { id: 't1', title: 'Sửa vòi nước tầng 2', dueDate: '2023-12-05', priority: 'high', status: 'in_progress', assignee: 'Trịnh CSKH', linkedEntity: '#125' },
            { id: 't2', title: 'Gửi báo cáo thuế Q4', dueDate: '2023-12-15', priority: 'medium', status: 'todo', assignee: 'Kế toán Vuông', linkedEntity: 'Tax 2023' }
        ],
        logs: [
            { id: 'l1', content: 'Chủ nhà báo vòi nước rò rỉ, cần thợ qua gấp.', timestamp: '2023-11-20T10:00:00Z', actor: 'Trịnh CSKH', channel: 'Zalo', followUpRequired: true },
            { id: 'l2', content: 'Đã nhắc khách thuê đóng tiền đúng hạn.', timestamp: '2023-11-15T09:00:00Z', actor: 'Trịnh CSKH', channel: 'Call' }
        ]
    };
};

export const createCareCase = async (newCase: CareCase): Promise<void> => {
    MOCK_CARE_CASES.unshift(newCase);
};

/**
 * Fix: Added missing getInspections export to satisfy app/properties/[id]/inspections/page.tsx
 */
export const getInspections = async (propertyId: string): Promise<Inspection[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'INS-001',
                    propertyId,
                    inspectionDate: '2023-11-20T10:00:00Z',
                    inspectorName: 'Trịnh CSKH',
                    category: 'electric',
                    riskLevel: 'medium',
                    findings: 'Hệ thống điện ở bếp có dấu hiệu quá tải khi dùng nhiều thiết bị.',
                    recommendation: 'Cần nâng cấp át tổng và tách riêng ổ cắm lò vi sóng.',
                    nextInspectionDate: '2024-05-20T00:00:00Z',
                    purposeCompliance: 'yes'
                },
                {
                    id: 'INS-002',
                    propertyId,
                    inspectionDate: '2023-05-15T09:00:00Z',
                    inspectorName: 'Lê CSKH',
                    category: 'water',
                    riskLevel: 'low',
                    findings: 'Áp lực nước ổn định, không có rò rỉ tại các mối nối.',
                    recommendation: 'Duy trì kiểm tra định kỳ.',
                    purposeCompliance: 'yes'
                }
            ]);
        }, 400);
    });
};
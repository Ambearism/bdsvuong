
import { Reminder, ReminderRuleConfig, ReminderLog } from '../types';

let MOCK_REMINDERS: Reminder[] = [
    {
        id: 'REM-001',
        code: 'R-2311-001',
        type: 'payment',
        title: 'Quá hạn thanh toán kỳ tháng 11',
        description: 'Kỳ thu tháng 11/2023 đã quá hạn 5 ngày. Còn thiếu 8.000.000đ. Vui lòng kiểm tra phân bổ tiền thu và nhắc khách thanh toán.',
        ownerId: 'cus_3', ownerName: 'Phạm Minh Cường',
        leaseId: 'lease_1', leaseCode: 'HDT-23001',
        propertyName: 'Nhà riêng ngõ 3 Thái Hà',
        relatedAmountTy: 0.015, paidAmountTy: 0.007, remainingAmountTy: 0.008,
        dueDate: '2023-11-25T00:00:00Z',
        status: 'new',
        level: 'high',
        assigneeName: 'Trịnh Trung Hiếu',
        checklist: [
            { id: 'c1', label: 'Kiểm tra sao kê ngân hàng', isDone: true },
            { id: 'c2', label: 'Gọi điện nhắc khách thuê', isDone: false },
            { id: 'c3', label: 'Gửi thông báo phạt chậm trả', isDone: false }
        ],
        logs: [
            { id: 'l1', reminderId: 'REM-001', actor: 'System', action: 'create', content: 'Tự động tạo do quá hạn > 3 ngày', timestamp: '2023-11-24T08:00:00Z' },
            { id: 'l2', reminderId: 'REM-001', actor: 'Trịnh Trung Hiếu', action: 'note', content: 'Đã check sao kê chưa thấy tiền về.', timestamp: '2023-11-24T09:00:00Z' }
        ],
        createdAt: '2023-11-24T08:00:00Z', updatedAt: '2023-11-24T09:00:00Z', tags: ['Thu tiền']
    },
    {
        id: 'REM-002',
        code: 'R-2311-002',
        type: 'tax',
        title: 'Cảnh báo vượt ngưỡng doanh thu thuế',
        description: 'Doanh thu chịu thuế năm 2023 đã đạt 92% ngưỡng (92tr/100tr). Cần rà soát cấu hình thuế và chuẩn bị hồ sơ.',
        ownerId: 'cus_3', ownerName: 'Phạm Minh Cường',
        relatedAmountTy: 0.092, // Current Revenue
        dueDate: '2023-12-01T00:00:00Z',
        status: 'processing',
        level: 'medium',
        assigneeName: 'Nguyễn Kế Toán',
        checklist: [
            { id: 'c1', label: 'Xuất báo cáo doanh thu YTD', isDone: true },
            { id: 'c2', label: 'Thông báo cho chủ nhà', isDone: true },
            { id: 'c3', label: 'Thu thập chứng từ nộp thuế', isDone: false }
        ],
        logs: [],
        createdAt: '2023-11-20T00:00:00Z', updatedAt: '2023-11-21T00:00:00Z', tags: ['Thuế']
    },
    {
        id: 'REM-003',
        code: 'R-2311-003',
        type: 'fee',
        title: 'Chốt phí dịch vụ Asset Care Q3/2023',
        description: 'Đến kỳ tính phí dịch vụ quý 3. Vui lòng chốt doanh thu đã duyệt để xuất thông báo phí.',
        ownerId: 'cus_2', ownerName: 'Trần Thị Bích',
        dueDate: '2023-11-30T00:00:00Z',
        status: 'new',
        level: 'medium',
        assigneeName: 'Admin',
        checklist: [
            { id: 'c1', label: 'Review dòng tiền Pending', isDone: false },
            { id: 'c2', label: 'Chạy bảng tính phí', isDone: false }
        ],
        logs: [],
        createdAt: '2023-11-28T00:00:00Z', updatedAt: '2023-11-28T00:00:00Z', tags: ['Phí dịch vụ']
    }
];

let MOCK_RULES: ReminderRuleConfig[] = [
    {
        id: 'rule_pay_1', category: 'payment', name: 'Nhắc nợ mức 1 (3 ngày)', isEnabled: true,
        conditions: [{ metric: 'days_overdue', operator: '>=', value: 3 }],
        actions: { setLevel: 'medium', template: 'Quá hạn thanh toán 3 ngày...', autoChecklist: ['Nhắn tin Zalo', 'Gửi email nhắc'] }
    },
    {
        id: 'rule_pay_2', category: 'payment', name: 'Nhắc nợ mức 2 (7 ngày)', isEnabled: true,
        conditions: [{ metric: 'days_overdue', operator: '>=', value: 7 }],
        actions: { setLevel: 'high', template: 'Quá hạn thanh toán 7 ngày...', autoChecklist: ['Gọi điện thoại', 'Gửi thông báo phạt'] }
    },
    {
        id: 'rule_tax_1', category: 'tax', name: 'Cảnh báo ngưỡng thuế', isEnabled: true,
        conditions: [{ metric: 'revenue_percent', operator: '>=', value: 80 }],
        actions: { setLevel: 'medium', template: 'Sắp vượt ngưỡng doanh thu...', autoChecklist: ['Rà soát doanh thu'] }
    }
];

export const getReminders = async (): Promise<Reminder[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_REMINDERS]), 500));
};

export const getReminderRules = async (): Promise<ReminderRuleConfig[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_RULES]), 400));
};

export const saveReminderRule = async (rule: ReminderRuleConfig): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const idx = MOCK_RULES.findIndex(r => r.id === rule.id);
            if (idx >= 0) MOCK_RULES[idx] = rule;
            else MOCK_RULES.push({...rule, id: `rule_${Date.now()}`});
            resolve();
        }, 500);
    });
};

export const createReminder = async (reminder: Reminder): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            MOCK_REMINDERS.unshift(reminder);
            resolve();
        }, 500);
    });
};

export const updateReminderStatus = async (id: string, status: string): Promise<void> => {
    // Mock update
    const r = MOCK_REMINDERS.find(i => i.id === id);
    if(r) r.status = status as any;
};

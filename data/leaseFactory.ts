
import { Lease, LeaseFilterState, LeaseDashboardData, LeaseDraft, LeaseScheduleItem, PaymentCycle, LeaseHubData, CashflowEntry, LeaseAllocation, DebtNote, TaxCase, ArAgingItem, HistoryLog } from '../types';
import { MOCK_LEASES } from './mockLeases';
import { MOCK_PROPERTIES } from './mockProperties';
import { MOCK_CUSTOMERS } from './mockCustomers';

// Helper to add months
const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// Map cycle to months
const getCycleMonths = (cycle: PaymentCycle): number => {
    switch (cycle) {
        case '1_month': return 1;
        case '3_months': return 3;
        case '6_months': return 6;
        case '12_months': return 12;
        case 'one_time': return 999;
        default: return 1;
    }
};

// Mock AR Calculation Logic
const calculateAR = (lease: Lease) => {
    // Mock logic: randomly assign some AR stats based on ID/Status
    const isProblematic = lease.id === 'lease_2'; // Example expiring/overdue
    return {
        ...lease,
        outstandingAmountTy: isProblematic ? 0.008 : 0,
        overdueAmountTy: isProblematic ? 0.008 : 0,
        unappliedCreditTy: lease.id === 'lease_3' ? 0.005 : 0, // Mock unapplied
        maxOverdueDays: isProblematic ? 15 : 0,
        hasDebtNote: isProblematic,
        hasPendingCashflow: lease.id === 'lease_1', // Mock pending
        inspectionRisk: false
    };
};

export const getLeases = async (filter: LeaseFilterState): Promise<LeaseDashboardData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data = MOCK_LEASES.map(l => calculateAR(l));
            
            // Simple sort by createdAt desc
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            // Apply Filters
            if (filter.search) {
                const s = filter.search.toLowerCase();
                data = data.filter(l => 
                    l.code.toLowerCase().includes(s) || 
                    l.tenantName.toLowerCase().includes(s) ||
                    l.propertyName.toLowerCase().includes(s) ||
                    l.ownerName.toLowerCase().includes(s)
                );
            }

            if (filter.status !== 'tat_ca') {
                data = data.filter(l => l.status === filter.status);
            }

            if (filter.paymentStatus === 'overdue') {
                data = data.filter(l => l.overdueAmountTy > 0);
            } else if (filter.paymentStatus === 'has_unapplied') {
                data = data.filter(l => l.unappliedCreditTy > 0);
            }

            // Pagination
            const start = (filter.page - 1) * filter.pageSize;
            const end = start + filter.pageSize;
            const sliced = data.slice(start, end);

            // Mock KPI calculation
            const overdueCount = data.filter(l => l.isOverdue).length;
            const outstandingTy = data.reduce((acc, curr) => acc + (curr.outstandingAmountTy || 0), 0);

            resolve({
                leases: sliced,
                totalCount: data.length,
                kpi: {
                    nextDueDate: new Date().toISOString(),
                    outstandingTy: outstandingTy,
                    overdueCount: overdueCount,
                    paidYTD: 12.5, // Mock YTD value
                    taxLiabilityTy: 1.25 // Mock Tax
                }
            });
        }, 400);
    });
};

export const generateSchedule = (lease: Partial<LeaseDraft>): LeaseScheduleItem[] => {
    if (!lease.startDate || !lease.endDate || !lease.rentAmountTy || !lease.cycle) return [];
    
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const schedule: LeaseScheduleItem[] = [];
    const cycleMonths = getCycleMonths(lease.cycle);
    let current = new Date(start);
    let periodIndex = 1;
    let safeGuard = 0;

    while (current < end && safeGuard < 60) {
        let next = addMonths(current, cycleMonths);
        if (next > end) next = new Date(end);
        
        const periodLabel = `Kỳ ${periodIndex}: ${current.toLocaleDateString('vi-VN')} - ${next.toLocaleDateString('vi-VN')}`;
        
        schedule.push({
            id: `sch_${Date.now()}_${periodIndex}`,
            periodLabel: `Kỳ thanh toán ${periodIndex}`,
            fromDate: current.toISOString(),
            toDate: next.toISOString(),
            dueDate: current.toISOString(), 
            amountTy: lease.rentAmountTy,
            amountPaidTy: 0,
            status: 'unpaid'
        });

        current = next;
        periodIndex++;
        safeGuard++;
    }

    return schedule;
};

export const validateLeaseOverlap = async (propertyId: string, start: string, end: string, excludeId?: string): Promise<{ overlap: boolean; message?: string }> => {
    return new Promise((resolve) => {
        const overlap = MOCK_LEASES.find(l => {
            if (l.propertyId !== propertyId) return false;
            if (excludeId && l.id === excludeId) return false;
            if (['terminated', 'expired'].includes(l.status)) return false;

            const existingStart = new Date(l.startDate);
            const existingEnd = new Date(l.endDate);
            const newStart = new Date(start);
            const newEnd = new Date(end);

            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (overlap) {
            resolve({ 
                overlap: true, 
                message: `Trùng lịch với HĐ ${overlap.code}` 
            });
        } else {
            resolve({ overlap: false });
        }
    });
};

export const saveLease = async (draft: LeaseDraft) => {
    // Simulate API Call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 800);
    });
};

export const renewLease = async (oldLeaseId: string, renewalData: any) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 800);
    });
};

export const transferLease = async (oldLeaseId: string, transferData: any) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const oldLeaseIndex = MOCK_LEASES.findIndex(l => l.id === oldLeaseId);
            if (oldLeaseIndex === -1) return reject("Không tìm thấy hợp đồng cũ");
            
            // Logic to update old lease status and create new lease would go here
            resolve(true);
        }, 800);
    });
};

export const getLeaseHubData = async (id: string): Promise<LeaseHubData | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lease = MOCK_LEASES.find(l => l.id === id);
            if (!lease) return resolve(null);

            const calculatedLease = calculateAR(lease);

            // Mock Schedule
            const mockSchedule = generateSchedule({
                startDate: lease.startDate,
                endDate: lease.endDate,
                rentAmountTy: lease.rentAmountTy,
                cycle: lease.cycle
            }).map((s, idx) => ({
                ...s,
                status: idx === 0 ? 'paid' : idx === 1 ? 'overdue' : 'unpaid',
                amountPaidTy: idx === 0 ? s.amountTy : 0
            })) as LeaseScheduleItem[];

            // Mock Cashflows
            const mockCashflows: CashflowEntry[] = [
                {
                    id: 'cf_1', refNo: 'TX-001', date: lease.startDate, amountTy: lease.rentAmountTy,
                    method: 'bank_transfer', payer: lease.tenantName, status: 'APPROVED',
                    type: 'RENT', isTaxable: true, leaseId: lease.id,
                    allocatedAmountTy: lease.rentAmountTy, unappliedAmountTy: 0,
                    attachments: [], note: 'Thanh toán kỳ 1', createdBy: 'Admin',
                    currency: 'VND', createdAt: lease.startDate, isEnteredOnBehalf: false
                },
                {
                    id: 'cf_2', refNo: 'TX-002', date: new Date().toISOString(), amountTy: 0.005,
                    method: 'bank_transfer', payer: lease.tenantName, status: 'PENDING',
                    type: 'RENT', isTaxable: true, leaseId: lease.id,
                    allocatedAmountTy: 0, unappliedAmountTy: 0.005,
                    attachments: [], note: 'Thanh toán sớm kỳ 2 (một phần)', createdBy: 'Admin',
                    currency: 'VND', createdAt: new Date().toISOString(), isEnteredOnBehalf: false
                }
            ];

            // Mock Debt Notes
            const mockDebtNotes: DebtNote[] = [
                { id: 'dn1', leaseId: id, title: 'Chậm thanh toán', content: 'Khách báo xin chậm đóng tiền tháng 12 do chưa nhận lương.', tag: 'delay_request', isInternal: true, createdAt: '2023-12-02T10:00:00Z', createdBy: 'Trịnh Sale' },
            ];

            resolve({
                lease: { ...calculatedLease, isAutoSchedule: true },
                kpi: {
                    nextDueDate: lease.nextDueDate,
                    outstandingTy: calculatedLease.outstandingAmountTy,
                    overdueCount: 1,
                    paidYTD: lease.rentAmountTy, 
                    taxLiabilityTy: lease.rentAmountTy * 0.1
                },
                schedule: mockSchedule,
                cashflows: mockCashflows,
                allocations: [],
                debtNotes: mockDebtNotes,
                taxCase: {
                    id: 'tax_1', ownerId: lease.ownerId, year: 2023, revenueYtdTy: 0.045, thresholdTy: 0.1, isThresholdExceeded: false, status: 'unfiled', notes: 'Đang theo dõi ngưỡng 100tr/năm', updatedAt: '2023-12-01T00:00:00Z'
                },
                history: []
            });
        }, 500);
    });
};

export const getArAgingReport = async (asOf: string): Promise<ArAgingItem[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    leaseId: 'lease_1', ownerName: 'Phạm Minh Cường', tenantName: 'Nguyễn Văn An', propertyUnit: 'Nhà riêng Thái Hà',
                    totalOutstandingTy: 0.015, buckets: { current: 0, days_1_30: 0.015, days_31_60: 0, days_61_90: 0, days_over_90: 0 },
                    creditBalanceTy: 0
                }
            ]);
        }, 600);
    });
};


'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton, Tabs, Button, Badge } from '../../../../components/ui';
import { LeaseDetailsSidebar } from '../../../../components/leases/LeaseDetailsSidebar';
import { LeaseScheduleTab } from '../../../../components/leases/tabs/LeaseScheduleTab';
import { LeaseTransactionsTab } from '../../../../components/leases/tabs/LeaseTransactionsTab';
import { LeaseReceiptsTab } from '../../../../components/leases/tabs/LeaseReceiptsTab';
import { LeaseDebtNotesTab } from '../../../../components/leases/tabs/LeaseDebtNotesTab';
import { LeaseHistoryTab } from '../../../../components/leases/tabs/LeaseHistoryTab';
import { LeaseCostsTab } from '../../../../components/leases/tabs/LeaseCostsTab'; // NEW IMPORT
import { RenewLeaseModal } from '../../../../components/leases/modals/RenewLeaseModal';
import { TransferLeaseModal } from '../../../../components/leases/modals/TransferLeaseModal';
import { LeaseHubData, LeaseStatus } from '../../../../types';
import { getLeaseHubData } from '../../../../data/leaseFactory';
import { ChevronLeft, Edit, AlertCircle, Clock, DollarSign, FileText, ArrowRightLeft, CalendarPlus, Activity } from 'lucide-react';
import { formatCurrency, cn } from '../../../../utils';

interface Props {
    params: { id: string };
    id?: string;
}

export default function LeaseHubPage({ id, params }: Props) {
    const leaseId = id || params?.id;
    const [data, setData] = useState<LeaseHubData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [showRenewModal, setShowRenewModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const fetchData = () => {
        if (leaseId) {
            setLoading(true);
            getLeaseHubData(leaseId).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [leaseId]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'leases' }));
    };

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>;
    if (!data) return <div className="p-20 text-center text-slate-500">Hợp đồng không tồn tại.</div>;

    const { lease, kpi, schedule, cashflows, allocations, debtNotes, taxCase, history } = data;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            {showRenewModal && <RenewLeaseModal lease={lease} isOpen={showRenewModal} onClose={() => setShowRenewModal(false)} onSuccess={fetchData} />}
            {showTransferModal && <TransferLeaseModal lease={lease} isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} onSuccess={fetchData} />}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack} className="mt-1 bg-white border-slate-200 text-slate-500 shadow-sm shrink-0">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            <span onClick={handleBack} className="hover:text-indigo-600 cursor-pointer transition-colors">Quản lý thuê</span>
                            <span>/</span>
                            <span className="text-slate-600">Hub Chi Tiết</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lease.code}</h1>
                            <Badge className={cn(
                                "px-3 py-1",
                                lease.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                            )}>
                                {lease.status.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm mt-2 font-medium flex items-center gap-2">
                            {lease.propertyName} <span className="w-1 h-1 rounded-full bg-slate-300" /> {lease.unitCode}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm" onClick={() => setShowTransferModal(true)}>
                        <ArrowRightLeft size={16} className="mr-2 text-indigo-500" /> Chuyển Nhượng
                    </Button>
                    <Button variant="outline" className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm" onClick={() => setShowRenewModal(true)}>
                        <CalendarPlus size={16} className="mr-2 text-amber-500" /> Gia Hạn
                    </Button>
                    <div className="w-px h-8 bg-slate-200 mx-1" />
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                        <Edit size={16} className="mr-2" /> Chỉnh Sửa
                    </Button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Hạn thanh toán', value: new Date(kpi.nextDueDate).toLocaleDateString('vi-VN'), icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Công nợ hiện tại', value: formatCurrency(kpi.outstandingTy, 'cho_thue'), icon: AlertCircle, color: kpi.outstandingTy > 0 ? 'text-rose-600' : 'text-emerald-600', bg: kpi.outstandingTy > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
                    { label: 'Doanh thu lũy kế', value: formatCurrency(kpi.paidYTD, 'cho_thue'), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Nghĩa vụ thuế', value: formatCurrency(kpi.taxLiabilityTy, 'cho_thue'), icon: FileText, color: 'text-slate-700', bg: 'bg-slate-100' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:border-indigo-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("p-2 rounded-xl shrink-0", item.bg, item.color)}>
                                <item.icon size={18} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                        </div>
                        <div className={cn("text-2xl font-black tracking-tight", item.color)}>{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 w-full space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Thanh Toán' },
                            { id: 'transactions', label: 'Dòng Tiền' },
                            { id: 'receipts', label: 'Phiếu Thu' },
                            { id: 'costs', label: 'Chi Phí & VH' }, // NEW TAB
                            { id: 'notes', label: 'Ghi Chú Nợ' },
                            { id: 'history', label: 'Lịch Sử' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wide whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                        {activeTab === 'overview' && <LeaseScheduleTab lease={lease} schedule={schedule} />}
                        {activeTab === 'transactions' && <LeaseTransactionsTab lease={lease} transactions={cashflows} schedule={schedule} allocations={allocations} />}
                        {activeTab === 'receipts' && <LeaseReceiptsTab lease={lease} receipts={cashflows} />}
                        {activeTab === 'costs' && <LeaseCostsTab lease={lease} />} {/* NEW RENDER */}
                        {activeTab === 'notes' && <LeaseDebtNotesTab lease={lease} notes={debtNotes} />}
                        {activeTab === 'history' && <LeaseHistoryTab history={history} />}
                    </div>
                </div>

                {/* Right Panel */}
                <LeaseDetailsSidebar lease={lease} />
            </div>
        </div>
    );
}

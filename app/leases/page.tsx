
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Select, Input, toast, Badge } from '../../components/ui';
import { LeaseListTable } from '../../components/leases/LeaseListTable';
import { RenewLeaseModal } from '../../components/leases/modals/RenewLeaseModal';
import { TransferLeaseModal } from '../../components/leases/modals/TransferLeaseModal';
import { AddCashflowModal } from '../../components/leases/modals/AddCashflowModal';
import { DebtNoteModal } from '../../components/leases/modals/DebtNoteModal';
import { Lease, LeaseFilterState } from '../../types';
import { getLeases } from '../../data/leaseFactory';
import { Search, RotateCcw, Plus, Download, Filter, FileText } from 'lucide-react';
import { cn } from '../../utils';

const DEFAULT_FILTERS: LeaseFilterState = {
    search: '',
    status: 'active',
    paymentStatus: 'tat_ca',
    agingBucket: 'tat_ca',
    dateRange: { from: null, to: null },
    page: 1,
    pageSize: 10
};

export default function LeaseListPage() {
    const [filters, setFilters] = useState<LeaseFilterState>(DEFAULT_FILTERS);
    const [data, setData] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Modal States
    const [renewLease, setRenewLease] = useState<Lease | null>(null);
    const [transferLease, setTransferLease] = useState<Lease | null>(null);
    const [cashflowLease, setCashflowLease] = useState<Lease | null>(null);
    const [debtNoteLease, setDebtNoteLease] = useState<Lease | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getLeases(filters);
            setData(res.leases);
        } catch (e) {
            toast("Lỗi khi tải danh sách hợp đồng", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleNewLease = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'lease_new' }));
    };

    const handleViewHub = (id: string) => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'lease_hub', id } }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col space-y-8">
            {/* Modals */}
            {renewLease && <RenewLeaseModal lease={renewLease} isOpen={!!renewLease} onClose={() => setRenewLease(null)} onSuccess={fetchData} />}
            {transferLease && <TransferLeaseModal lease={transferLease} isOpen={!!transferLease} onClose={() => setTransferLease(null)} onSuccess={fetchData} />}
            {cashflowLease && <AddCashflowModal lease={cashflowLease} isOpen={!!cashflowLease} onClose={() => setCashflowLease(null)} onSuccess={fetchData} />}
            {debtNoteLease && <DebtNoteModal lease={debtNoteLease} isOpen={!!debtNoteLease} onClose={() => setDebtNoteLease(null)} onSuccess={fetchData} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Danh sách Thuê (Lease List)</h1>
                    <p className="text-slate-500 text-sm mt-1">Trung tâm quản lý hợp đồng, dòng tiền và công nợ</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-white">
                        <Download size={18} /> Export
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-indigo-200" onClick={handleNewLease}>
                        <Plus size={18} /> Tạo Lease
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="space-y-4">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full xl:w-[400px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                className="pl-9 h-10"
                                placeholder="Mã HĐ, Tenant, Owner, BĐS..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full xl:w-auto">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
                                <Filter size={12} /> Lọc nhanh:
                            </div>
                            {/* Quick Filter Chips */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFilters(p => ({ ...p, paymentStatus: 'overdue' }))} className={cn("text-xs font-bold px-3 py-1.5 rounded-full border transition-all", filters.paymentStatus === 'overdue' ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-rose-200")}>
                                    Overdue
                                </button>
                                <button onClick={() => setFilters(p => ({ ...p, status: 'expiring' }))} className={cn("text-xs font-bold px-3 py-1.5 rounded-full border transition-all", filters.status === 'expiring' ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-amber-200")}>
                                    Sắp hết hạn
                                </button>
                            </div>

                            <div className="h-6 w-px bg-slate-200 mx-1"></div>

                            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className={cn("text-slate-500 hover:text-indigo-600 h-10 px-3 transition-all", showAdvanced && "bg-indigo-50 text-indigo-600")}>
                                <Filter size={14} className="mr-2" /> Bộ lọc nâng cao
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-slate-400 hover:text-rose-600 h-10 px-3">
                                <RotateCcw size={14} className="mr-2" /> Reset bộ lọc
                            </Button>
                        </div>
                    </div>

                    {/* Collapsible Advanced Filters */}
                    {showAdvanced && (
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                            <Select
                                label="Trạng thái Lease"
                                value={filters.status}
                                onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                                options={[
                                    { label: 'Tất cả', value: 'tat_ca' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Ended', value: 'expired' },
                                    { label: 'Paused', value: 'paused' },
                                    { label: 'Transferred', value: 'transferred' }
                                ]}
                            />
                            <Select
                                label="Trạng thái thanh toán"
                                value={filters.paymentStatus}
                                onChange={(v) => setFilters(prev => ({ ...prev, paymentStatus: v }))}
                                options={[
                                    { label: 'Tất cả', value: 'tat_ca' },
                                    { label: 'Đúng hạn', value: 'on_time' },
                                    { label: 'Quá hạn (Overdue)', value: 'overdue' },
                                    { label: 'Có dư nợ (Unapplied)', value: 'has_unapplied' }
                                ]}
                            />
                            <Select
                                label="Tuổi nợ (Aging)"
                                value={filters.agingBucket}
                                onChange={(v) => setFilters(prev => ({ ...prev, agingBucket: v }))}
                                options={[
                                    { label: 'Tất cả', value: 'tat_ca' },
                                    { label: 'Hiện tại', value: 'current' },
                                    { label: '1 - 30 ngày', value: '1_30' },
                                    { label: '31 - 60 ngày', value: '31_60' },
                                    { label: '> 60 ngày', value: 'gt_60' }
                                ]}
                            />
                            <div className="col-span-2 flex items-end justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-slate-400 hover:text-rose-600 h-10 px-3">
                                    <RotateCcw size={14} className="mr-2" /> Reset bộ lọc
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table Container */}
            <Card className="flex-1 border-slate-200 shadow-md overflow-hidden bg-white flex flex-col min-h-[500px]">
                <div className="flex-1">
                    <LeaseListTable
                        data={data}
                        loading={loading}
                        onViewHub={handleViewHub}
                        onRenew={setRenewLease}
                        onTransfer={setTransferLease}
                        onAddCashflow={setCashflowLease}
                        onAddDebtNote={setDebtNoteLease}
                    />
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-600 shrink-0">
                    <div>Đang hiển thị <b>{data.length}</b> hợp đồng</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Trước</Button>
                        <Button variant="outline" size="sm" disabled>Sau</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

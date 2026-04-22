
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast } from '../../components/ui';
import { TransactionsTable } from '../../components/transactions/TransactionsTable';
import { TransactionsFilterBar } from '../../components/transactions/TransactionsFilterBar';
import { CreateTransactionModal } from '../../components/transactions/modals/CreateTransactionModal';
import { Transaction, TransactionFilterState, KPIItem } from '../../types';
import { getTransactionsStore } from '../../data/transactionFactory';
import { formatNumber, formatCurrencyTy } from '../../utils';
import {
    Plus, Download, Receipt, ClipboardList, FileCheck, CheckCircle2,
    Calendar, Filter, Search, RotateCcw
} from 'lucide-react';

const DEFAULT_FILTER: TransactionFilterState = {
    search: '',
    status: 'tat_ca',
    purpose: 'tat_ca',
    assignee: 'tat_ca',
    propertyType: 'tat_ca',
    project: 'tat_ca',
    dateRange: { from: null, to: null }
};

const TX_KPI: KPIItem[] = [
    { id: '1', label: 'Tổng Số Giao Dịch', value: 318, tooltip: 'Tổng GD trong hệ thống' },
    { id: '2', label: 'Giao Dịch Đang Xử Lý', value: 318, tooltip: 'Hợp đồng đang chờ xử lý' },
    { id: '3', label: 'Đã Hoàn Tất Bàn Giao', value: 206, tooltip: 'Hợp đồng đã hoàn thành' },
    { id: '4', label: 'Giá Trị Ghi Nhận', value: 1285, unit: 'tỷ', tooltip: 'Tổng giá trị giao dịch' },
    { id: '5', label: 'Phí Môi Giới', value: 525, unit: 'tr', tooltip: 'Tổng hoa hồng dự kiến' },
];

export default function TransactionsPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [filters, setFilters] = useState<TransactionFilterState>({
        search: '',
        status: 'tat_ca',
        source: 'tat_ca',
        assignee: 'tat_ca',
        propertyType: 'tat_ca',
        purpose: 'tat_ca',
        project: 'tat_ca',
        page: 1,
        pageSize: 10
    });

    const fetchData = () => {
        setLoading(true);
        setTimeout(() => {
            let txs = [...getTransactionsStore()];

            // Mock filtering
            if (filters.search) {
                const s = filters.search.toLowerCase();
                txs = txs.filter(t => t.id.toLowerCase().includes(s) || t.customerName.toLowerCase().includes(s) || t.propertyCode.toLowerCase().includes(s));
            }
            if (filters.status !== 'tat_ca') txs = txs.filter(t => t.status === filters.status);
            if (filters.purpose !== 'tat_ca') txs = txs.filter(t => t.purpose === filters.purpose);
            if (filters.source !== 'tat_ca') txs = txs.filter(t => t.source === filters.source);

            setData(txs);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleExport = () => {
        toast("Đang trích xuất dữ liệu giao dịch...");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Giao Dịch & Hợp Đồng</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý và theo dõi tiến độ các hợp đồng giao dịch</p>
                </div>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> Tạo Giao Dịch
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {TX_KPI.map(kpi => (
                    <Card key={kpi.id} className="bg-white border-slate-200 shadow-sm transition-all h-[110px] hover:shadow-md hover:border-indigo-100 group">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none group-hover:text-indigo-400 transition-colors">{kpi.label}</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <p className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                                    {kpi.unit === 'tỷ' ? formatNumber(kpi.value).replace('.', ',') : formatNumber(kpi.value)}
                                </p>
                                {kpi.unit && <span className="text-sm font-bold text-slate-400 ml-0.5">{kpi.unit}</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Card (Filters + Table) */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="p-0">
                    <TransactionsFilterBar
                        filters={filters}
                        setFilters={setFilters}
                        onReset={() => setFilters(DEFAULT_FILTER)}
                    />
                    <TransactionsTable data={data} loading={loading} onUpdate={fetchData} />
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <select className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs outline-none">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                        <span>Results: 1 - {data.length} of 100</span>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
                            <button key={i} className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold transition-all ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Create Modal */}
            <CreateTransactionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => { setIsCreateModalOpen(false); fetchData(); }} />
        </div>
    );
}

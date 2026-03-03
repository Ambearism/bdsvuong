
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast } from '../../components/ui';
import { TransactionsTable } from '../../components/transactions/TransactionsTable';
import { TransactionFilterBar } from '../../components/transactions/TransactionsFilterBar';
import { CreateTransactionModal } from '../../components/transactions/modals/CreateTransactionModal';
import { Transaction, TransactionFilterState, KPIItem } from '../../types';
import { getTransactionsStore } from '../../data/transactionFactory';
import { formatNumber, formatCurrencyTy } from '../../utils';
import { 
  Receipt, FileCheck, ClipboardList, CheckCircle2, 
  Plus, Download, RotateCcw 
} from 'lucide-react';

const TX_KPI: KPIItem[] = [
    { id: '1', label: 'Tổng Giao Dịch', value: 158, changeValue: '+12%', changeType: 'positive', tooltip: 'Tổng GD trong hệ thống' },
    { id: '2', label: 'Đang Xử Lý Hồ Sơ', value: 42, changeValue: '-2 hồ sơ', changeType: 'neutral', tooltip: 'Hợp đồng đang chờ ký/thanh toán' },
    { id: '3', label: 'Mới Đặt Cọc', value: 18, changeValue: '+5 GD', changeType: 'positive', tooltip: 'Giao dịch vừa tạo mới' },
    { id: '4', label: 'Hoàn Tất Tháng Này', value: 24, changeValue: '+15.2%', changeType: 'positive', tooltip: 'Giao dịch đã chốt thành công' },
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
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Danh Sách Giao Dịch</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý tiến độ hợp đồng, thanh toán và pháp lý</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="gap-2 bg-white" onClick={handleExport}>
                    <Download size={16} /> Xuất Báo Cáo
                </Button>
                <Button className="gap-2 shadow-lg shadow-indigo-200" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> Tạo Giao Dịch
                </Button>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TX_KPI.map(kpi => (
                <Card key={kpi.id} className="hover:-translate-y-1 transition-all border-l-4 border-l-indigo-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatNumber(kpi.value)}</p>
                            <p className={`text-[10px] font-bold mt-1 ${kpi.changeType === 'positive' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {kpi.changeValue} <span className="font-normal text-slate-400">vs kỳ trước</span>
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            {kpi.id === '1' && <Receipt size={24}/>}
                            {kpi.id === '2' && <ClipboardList size={24}/>}
                            {kpi.id === '3' && <FileCheck size={24}/>}
                            {kpi.id === '4' && <CheckCircle2 size={24}/>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Filter Bar */}
        <TransactionFilterBar filters={filters} setFilters={setFilters} onReset={() => setFilters({ ...filters, search: '', status: 'tat_ca', purpose: 'tat_ca', source: 'tat_ca' })} />

        {/* Table Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <TransactionsTable data={data} loading={loading} onUpdate={fetchData} />
            
            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-600">
                <div>Hiển thị <b>1-{data.length}</b> trong <b>{data.length}</b> kết quả</div>
                <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Trước</Button>
                    <Button variant="outline" size="sm" disabled>Sau</Button>
                </div>
            </div>
        </Card>

        {/* Create Modal */}
        <CreateTransactionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => { setIsCreateModalOpen(false); fetchData(); }} />
    </div>
  );
}

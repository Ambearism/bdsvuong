'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, Input, Select, toast, Switch } from '../../components/ui';
import { CareCase } from '../../types';
import { getCareCases, updateCareCaseStatus } from '../../data/careFactory';
import {
    Search, Plus, HeartHandshake, User,
    Clock, Building2, FileText, Activity,
    Wallet, ArrowRight, Filter, DollarSign
} from 'lucide-react';
import { cn, formatNumber } from '../../utils';
import { CreateCareCaseModal } from '../../components/care/modals/CreateCareCaseModal';
import { AddCashflowModal } from '../../components/finance/modals/AddCashflowModal';

export default function CareCasesPage() {
    const [data, setData] = useState<CareCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCaseForCashflow, setSelectedCaseForCashflow] = useState<CareCase | null>(null);

    const fetchData = () => {
        setLoading(true);
        getCareCases().then(res => {
            setData(res);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await updateCareCaseStatus(id, newStatus);
        toast(`Đã chuyển trạng thái sang ${newStatus === 'active' ? 'Hoạt động' : 'Tạm ngưng'}`);
        fetchData();
    };

    const handleViewHub = (id: string) => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'care_case_hub', id } }));
    };

    // --- KPI CALCULATIONS ---
    const totalCases = data.length;
    const totalAssets = data.reduce((acc, curr) => acc + curr.linkedProperties.length, 0);
    const totalLeases = data.reduce((acc, curr) => acc + curr.linkedLeases.length, 0);
    const totalFees = data.reduce((acc, curr) => acc + (curr.careFeeMillion || 0), 0);

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <CreateCareCaseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />

            {selectedCaseForCashflow && (
                <AddCashflowModal
                    isOpen={true}
                    onClose={() => setSelectedCaseForCashflow(null)}
                    careCase={selectedCaseForCashflow}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <HeartHandshake size={28} className="text-indigo-600" /> Quản Lý Chăm Sóc (Care)
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Trung tâm điều phối vận hành và tối ưu phí Asset Care</p>
                </div>
                <Button
                    className="gap-2 shadow-lg shadow-indigo-100 font-bold bg-indigo-600 h-11 px-6"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={18} /> Mở Case mới
                </Button>
            </div>

            {/* --- TOP KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200 p-6 flex items-center gap-4 group hover:ring-indigo-200 transition-all">
                    <div className="p-4 bg-indigo-50/50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng số Case</div>
                        <div className="text-3xl font-black text-slate-800 mt-1">{formatNumber(totalCases)}</div>
                    </div>
                </Card>
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200 p-6 flex items-center gap-4 group hover:ring-amber-200 transition-all">
                    <div className="p-4 bg-amber-50/50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tài sản liên kết</div>
                        <div className="text-3xl font-black text-slate-800 flex items-baseline gap-1 mt-1">
                            {formatNumber(totalAssets)} <span className="text-xs font-bold text-slate-400">Assets</span>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200 p-6 flex items-center gap-4 group hover:ring-emerald-200 transition-all">
                    <div className="p-4 bg-emerald-50/50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng hợp đồng</div>
                        <div className="text-3xl font-black text-slate-800 mt-1">{formatNumber(totalLeases)}</div>
                    </div>
                </Card>
                {/* Highlighted Care Fee Card */}
                <Card className="bg-white border-indigo-100 shadow-sm shadow-indigo-100/50 p-6 flex items-center gap-5 group overflow-hidden relative">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl z-10 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        <DollarSign size={28} strokeWidth={2.5} />
                    </div>
                    <div className="z-10">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng chi phí Care thu</div>
                        <div className="text-3xl font-black text-indigo-900 flex items-baseline gap-1 mt-1">
                            {formatNumber(totalFees)} <span className="text-sm font-bold text-indigo-400">Tr/tháng</span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-md overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input className="pl-9 h-10 border-slate-200 bg-white shadow-sm" placeholder="Tìm theo chủ nhà, mã case..." />
                    </div>
                    <Button variant="outline" className="bg-white h-10 border-slate-200 text-slate-600 font-bold"><Filter size={16} className="mr-2" /> Lọc danh sách</Button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-5">Mã Case / Khách Hàng</th>
                                <th className="px-6 py-5">Liên kết (Assets/Leases)</th>
                                <th className="px-6 py-4 text-right">Phí Care thực tế</th>
                                <th className="px-6 py-5">Tương tác cuối</th>
                                <th className="px-6 py-5">Người phụ trách</th>
                                <th className="px-6 py-5">Hành động</th>
                                <th className="px-6 py-5 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] w-[180px]">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm bg-white">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => handleViewHub(item.id)}>
                                    <td className="px-6 py-4">
                                        <div className="font-black text-slate-900">{item.id}</div>
                                        <div className="text-xs text-indigo-600 font-bold mt-1.5 flex items-center gap-1.5">
                                            <User size={12} /> {item.ownerName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[9px]">
                                                <Building2 size={10} className="mr-1" /> {item.linkedProperties.length} Assets
                                            </Badge>
                                            <Badge variant="outline" className="bg-indigo-50/30 text-indigo-600 border-indigo-100 font-bold text-[9px]">
                                                <FileText size={10} className="mr-1" /> {item.linkedLeases.length} HĐ
                                            </Badge>
                                        </div>
                                    </td>
                                    {/* Care Fee Column - High Visibility */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-black text-indigo-700 text-lg">{formatNumber(item.careFeeMillion || 0)} Tr</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">VND / Tháng</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs">{new Date(item.lastContactDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-full w-fit shadow-sm">
                                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                                {item.assignedTo.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-800">{item.assignedTo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCaseForCashflow(item);
                                            }}
                                        >
                                            <Plus size={14} className="mr-1" /> Thêm Dòng Tiền
                                        </Button>
                                    </td>
                                    {/* Toggle at the end of row */}
                                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-4">
                                            <Badge className={cn(
                                                "text-[9px] font-black tracking-wider uppercase px-2 w-20 text-center justify-center",
                                                item.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>
                                                {item.status === 'active' ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Switch
                                                checked={item.status === 'active'}
                                                onChange={() => handleToggleStatus(item.id, item.status)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

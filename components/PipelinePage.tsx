
import React, { useState } from 'react';
import {
    Card, CardContent, Button, Select, Tabs, TooltipWrapper, Skeleton
} from './ui';
import { PipelineBoard } from './pipeline/PipelineBoard';
import {
    RotateCcw, Calendar, Search, Filter,
    Briefcase, Users, TrendingUp, AlertTriangle, CheckCircle2, UserPlus, XCircle
} from 'lucide-react';
import { formatNumber } from '../utils';

// Reuse existing filter options logic or define minimal mock
const KPI_DATA = [
    { label: "Tổng Lead", value: "2.864.898", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Khách Mới → Hẹn Xem Nhà", value: "36,8%", icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "GD Mở → Đàm Phán", value: "21,3%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Đàm Phán → Đặt Cọc", value: "15,1%", icon: Briefcase, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Đặt Cọc → GD Hoàn Tất", value: "15%", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Khách → Thất Bại", value: "1,1%", icon: XCircle, color: "text-slate-500", bg: "bg-slate-100" },
    { label: "GD → Thất Bại", value: "0,7%", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
];

export const PipelinePage = () => {
    const [activeTab, setActiveTab] = useState('pipeline');
    const [filters, setFilters] = useState<any>({}); // Mock filter state

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý công việc</h1>
                    <p className="text-slate-500 text-sm mt-1">Theo dõi tiến trình và lịch làm việc của đội ngũ</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab('pipeline')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pipeline' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pipeline
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'calendar' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lịch Công Việc
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 shrink-0">
                {KPI_DATA.map((kpi, idx) => (
                    <Card key={idx} className="border-none shadow-sm hover:-translate-y-1 transition-transform">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-md ${kpi.bg} ${kpi.color}`}>
                                    <kpi.icon size={14} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{kpi.label}</span>
                            </div>
                            <div className="text-lg font-extrabold text-slate-800">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="mb-6 border border-slate-200 shadow-sm shrink-0">
                <CardContent className="p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                    <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                        <div className="relative w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Tìm kiếm..." />
                        </div>
                        <Button variant="outline" size="sm" className="bg-white h-9 text-xs">7 Ngày Gần Đây</Button>
                        <Button variant="outline" size="sm" className="bg-white h-9 text-xs">Tháng Này</Button>
                        <div className="flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white gap-2 h-9 cursor-pointer hover:border-indigo-300">
                            <Calendar size={14} className="text-slate-400" />
                            <span>23.11.2025 - 30.11.2025</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-9 text-slate-500 hover:text-indigo-600 text-xs">
                            <RotateCcw size={14} className="mr-2" /> Reset
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden xl:block mx-2"></div>

                    <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-1">
                        {['Nguồn Lead', 'Trạng Thái Lead', 'Sale Phụ Trách', 'Nhu Cầu', 'Loại Hình BĐS', 'Khu Vực', 'Ngân Sách'].map((label, i) => (
                            <Select key={i} className="min-w-[145px] text-xs h-9" label={label} placeholder="Tất cả" options={[]} value="" onChange={() => { }} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Board Content */}
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
                {activeTab === 'pipeline' ? (
                    <PipelineBoard />
                ) : (
                    <div className="h-full flex items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="text-center">
                            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-slate-900 font-semibold">Lịch Công Việc</h3>
                            <p className="text-slate-500 text-sm">Tính năng đang phát triển...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

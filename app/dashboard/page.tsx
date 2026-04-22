
import React, { useEffect, useState } from 'react';
import {
    Card, CardContent, CardHeader, CardTitle,
    Button, Select, Tabs, Badge, Skeleton, TooltipWrapper
} from '../../components/ui';
import {
    SourcePieChart, RevenueLineChart, InventoryBarChart
} from '../../components/charts';
import { FunnelCard } from '../../components/FunnelCard';
import { InventoryTab } from '../../components/InventoryTab';
import { getDashboardData } from '../../data';
import { DashboardData, DetailedFilterState, FunnelStageKey } from '../../types';
import { formatNumber, formatCurrencyTy, cn } from '../../utils';
import {
    RotateCcw, Download, Share2, MoreHorizontal,
    Users, Briefcase, CheckCircle2, Banknote, Building, Percent,
    ArrowUpRight, ArrowDownRight, Minus, Filter, Calendar
} from 'lucide-react';

const DEFAULT_FILTERS: DetailedFilterState = {
    timeRange: "7_ngay_gan_nhat",
    propertyType: "tat_ca",
    itemType: "tat_ca",
    metricMode: "so_luong"
};

const getKPIConfig = (id: string) => {
    switch (id) {
        case '1': return { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' };
        case '2': return { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50/50 border-violet-100' };
        case '3': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' };
        case '4': return { icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' };
        case '5': return { icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100' };
        case '6': return { icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100' };
        default: return { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
    }
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [filters, setFilters] = useState<DetailedFilterState>(DEFAULT_FILTERS);
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getDashboardData(filters);
            setData(result);
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const renderTrend = (type: 'positive' | 'negative' | 'neutral', value?: string) => {
        if (!value) return null;
        let Icon = Minus;
        let colorClass = "text-slate-500";
        if (type === 'positive') { Icon = ArrowUpRight; colorClass = "text-[#059669]"; } // deep emerald
        else if (type === 'negative') { Icon = ArrowDownRight; colorClass = "text-[#e11d48]"; } // rose
        
        // Handle "Funnel Cải Thiện" and others.
        // If it starts with an arrow character from data.ts, we use that text as is without adding an icon.
        if (value.startsWith('↗') || value.startsWith('↘')) {
           return (
              <div className={cn("flex items-center gap-0.5 text-[9px] font-black tracking-tight", colorClass)}>
                 {value}
              </div>
           );
        }

        return (
            <div className={cn("flex items-center gap-0.5 text-[9px] font-black tracking-tight", colorClass)}>
                <Icon size={10} strokeWidth={3} />
                {value}
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-black text-[#1e2b3c] tracking-tight">Tổng Quan Hoạt Động</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="live" className="font-semibold text-[10px] px-2 py-0.5 rounded shadow-sm">LIVE</Badge>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 text-xs font-medium">Cập nhật: {lastUpdated}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" className="text-xs bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow font-semibold"><Download size={14} className="mr-2" /> Xuất Báo Cáo</Button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {loading ? Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="h-28 border-transparent bg-white shadow-sm"><CardContent className="h-full p-4"><Skeleton className="h-full w-full" /></CardContent></Card>
                )) : data?.kpi.map((item) => {
                    return (
                        <React.Fragment key={item.id}>
                            <TooltipWrapper content={item.tooltip}>
                                <Card className="hover:-translate-y-1 hover:shadow-md transition-all h-[110px] border border-slate-200 shadow-none overflow-hidden bg-white group flex flex-col justify-between p-4">
                                    <div className="text-[11px] font-bold text-slate-500 truncate w-full group-hover:text-indigo-600 transition-colors">
                                        {item.label}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full mt-2">
                                        <div className="flex items-end justify-between">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[32px] font-black text-[#1e2b3c] tracking-tighter leading-none">
                                                    {item.unit === 'tỷ' ? formatCurrencyTy(item.value).replace(' tỷ', '') : formatNumber(item.value)}
                                                </span>
                                                {item.unit && <span className="text-[12px] font-extrabold text-[#1f2937] ml-0.5">{item.unit === 'tỷ' ? 'tỷ' : item.unit}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TooltipWrapper>
                        </React.Fragment>
                    )
                })}
            </div>

            {/* Sticky Tab Bar */}
            <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-xl py-3 border-y border-slate-200 shadow-sm -mx-4 md:-mx-8 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
                <Tabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={[
                        { id: 'overview', label: 'Tổng Quan' },
                        { id: 'inventory_detailed', label: 'Kho Hàng Chi Tiết' }
                    ]}
                    className="h-10 text-xs p-1 shadow-sm"
                />

                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-600">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>{filters.timeRange === '7_ngay_gan_nhat' ? '7 Ngày Gần Nhất' : 'Tháng Này'}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300 mx-1"></div>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600 gap-1 h-9">
                        <Filter size={14} /> Bộ lọc
                    </Button>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700">
                {activeTab === 'overview' ? (
                    <div className="space-y-8">
                        {/* Row 1: Funnel & Sources */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <div className="xl:col-span-8">
                                <FunnelCard
                                    data={data?.funnel || []}
                                    isLoading={loading}
                                    onSelectStage={(key) => console.log('Select stage', key)}
                                />
                            </div>
                            <Card className="xl:col-span-4 flex flex-col shadow-sm border border-slate-200 bg-white">
                                <CardHeader className="border-b border-slate-50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Nguồn Lead
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[350px] flex items-center justify-center p-6">
                                    {loading ? <Skeleton className="h-[300px] w-[300px] rounded-full" /> : (
                                        <SourcePieChart data={data?.leadSources || []} onSelect={(name) => console.log('Selected source', name)} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Row 2: Revenue & Inventory Overview */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <Card className="xl:col-span-8 shadow-sm border border-slate-200 bg-white">
                                <CardHeader className="border-b border-slate-50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Biểu đồ Doanh Thu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {loading ? <Skeleton className="h-[320px] w-full" /> : (
                                        <RevenueLineChart data={data?.revenue || []} />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="xl:col-span-4 shadow-sm border border-slate-200 bg-white">
                                <CardHeader className="border-b border-slate-50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="w-1 h-4 bg-amber-500 rounded-full" /> Tổng Quan Kho Hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {loading ? <Skeleton className="h-[320px] w-full" /> : (
                                        <InventoryBarChart data={data?.inventory || []} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <InventoryTab data={data?.inventoryDetailed || []} filters={filters} setFilters={setFilters} isLoading={loading} />
                    </div>
                )}
            </div>
        </div>
    );
}

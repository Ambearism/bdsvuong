
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
  switch(id) {
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
      setLastUpdated(now.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}));
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
    if (type === 'positive') { Icon = ArrowUpRight; colorClass = "text-emerald-600"; } 
    else if (type === 'negative') { Icon = ArrowDownRight; colorClass = "text-rose-600"; }
    
    return (
        <div className={cn("flex items-center gap-0.5 text-[11px] font-bold", colorClass)}>
            <Icon size={12} />
            {value}
        </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tổng Quan Hoạt Động</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="indigo" className="font-normal text-[10px] py-0.5">Live</Badge>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs">Cập nhật: {lastUpdated}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex bg-white text-xs border-slate-200"><Share2 size={14} className="mr-2"/> Chia sẻ</Button>
                <Button variant="primary" size="sm" className="text-xs shadow-md shadow-indigo-200"><Download size={14} className="mr-2"/> Xuất Báo Cáo</Button>
            </div>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {loading ? Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-32 border-transparent bg-white shadow-sm"><CardContent className="h-full p-4"><Skeleton className="h-full w-full" /></CardContent></Card>
            )) : data?.kpi.map((item) => {
                const { icon: Icon, color, bg } = getKPIConfig(item.id);
                return (
                <React.Fragment key={item.id}>
                    <TooltipWrapper content={item.tooltip}>
                        <Card className="hover:-translate-y-1 hover:shadow-md transition-all h-full border border-slate-200/60 shadow-sm overflow-hidden bg-white group">
                            <CardContent className="p-5 flex flex-col justify-between h-full relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80%] group-hover:text-indigo-600 transition-colors">{item.label}</span>
                                    <div className={cn("p-2 rounded-lg border shrink-0 transition-colors", bg, color)}>
                                        <Icon size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                            {item.unit === 'tỷ' ? formatCurrencyTy(item.value).replace(' tỷ', '') : formatNumber(item.value)}
                                        </span>
                                        {item.unit && <span className="text-xs font-bold text-slate-400 self-end mb-0.5">{item.unit}</span>}
                                    </div>
                                    <div className="flex items-center mt-3 pt-2 border-t border-slate-50 gap-2">
                                        {renderTrend(item.changeType, item.changeValue)}
                                        <span className="text-[10px] text-slate-400 font-medium">vs kỳ trước</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipWrapper>
                </React.Fragment>
            )})}
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
                className="h-9 text-xs bg-white border border-slate-200 p-1 shadow-sm"
            />
            
            <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-600">
                    <Calendar size={14} className="text-indigo-500"/>
                    <span>{filters.timeRange === '7_ngay_gan_nhat' ? '7 Ngày Gần Nhất' : 'Tháng Này'}</span>
                </div>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600 gap-1 h-9">
                    <Filter size={14}/> Bộ lọc
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
                                    <div className="w-1 h-4 bg-indigo-500 rounded-full"/> Nguồn Lead
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[350px] flex items-center justify-center p-0">
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
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"/> Biểu đồ Doanh Thu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {loading ? <Skeleton className="h-[320px] w-full" /> : (
                                    <RevenueLineChart data={data?.revenue || []} />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="xl:col-span-4 shadow-sm border border-slate-200 bg-white">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <div className="w-1 h-4 bg-amber-500 rounded-full"/> Tổng Quan Kho Hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
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

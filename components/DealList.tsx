

import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  Button, Select, Input, Badge, Skeleton, TooltipWrapper, Pagination, toast,
  SelectOption
} from './ui';
import { Deal, DealFilterState, DealDashboardData, DealStage } from '../types';
import { getDeals } from '../data';
import { formatNumber, formatCurrencyTy, cn } from '../utils';
import { 
  Plus, Search, RotateCcw, Calendar, Eye, Trash2, 
  Users, Briefcase, TrendingUp, CheckCircle2, Download, AlertTriangle, ChevronDown
} from 'lucide-react';
import { DealDetailDrawer } from './deals/DealDetailDrawer';
import { CreateDealWizardModal } from './deals/CreateDealWizardModal';

// --- FILTER CONSTANTS ---
const SOURCE_OPTIONS = [
  { label: 'Tất Cả Nguồn', value: 'tat_ca' },
  { label: 'Website', value: 'website' },
  { label: 'Zalo', value: 'zalo' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Hotline', value: 'hotline' },
  { label: 'CTV', value: 'ctv' },
  { label: 'Văn phòng', value: 'van_phong' },
  { label: 'Giới Thiệu', value: 'gioi_thieu' },
];

const DEAL_STAGE_OPTIONS = [
  { label: 'Tất Cả', value: 'tat_ca' },
  { label: 'Deals Mở', value: 'deal_mo' },
  { label: 'Đàm Phán', value: 'dam_phan' },
  { label: 'Đặt Cọc', value: 'dat_coc' },
  { label: 'Hoàn Tất', value: 'gd_hoan_tat' },
  { label: 'Hủy / Thất Bại', value: 'huy_that_bai' },
];

const ASSIGNEE_OPTIONS = [
    { label: 'Tất Cả Sale', value: 'tat_ca' },
    { label: 'Lê Thị B', value: 'Lê Thị B' },
    { label: 'Nguyễn Văn Sale', value: 'Nguyễn Văn Sale' },
    { label: 'Trịnh Trung Hiếu', value: 'Trịnh Trung Hiếu' },
];

const NEED_OPTIONS = [
    { label: 'Tất Cả', value: 'tat_ca' },
    { label: 'Mua', value: 'mua' },
    { label: 'Thuê', value: 'thue' },
    { label: 'Ký Gửi Bán', value: 'ky_gui_ban' },
];

const PROPERTY_TYPE_OPTIONS = [
    { label: 'Tất Cả', value: 'tat_ca' },
    { label: 'Chung Cư', value: 'chung_cu' },
    { label: 'Liền Kề', value: 'lien_ke' },
    { label: 'Biệt Thự', value: 'biet_thu' },
    { label: 'Nhà Riêng', value: 'nha_rieng' },
    { label: 'Đất Nền', value: 'dat_nen' },
    { label: 'Trang trại', value: 'trang_trai' },
    { label: 'Shophouse', value: 'shophouse_kiosk' },
    { label: 'BĐS Khác', value: 'bds_khac' },
];

const AREA_OPTIONS = [
    { label: 'Tất Cả', value: 'tat_ca' },
    { label: 'P.Hà Đông', value: 'P.Hà Đông' },
    { label: 'P.Dương Nội', value: 'P.Dương Nội' },
    { label: 'P.Yên Nghĩa', value: 'P.Yên Nghĩa' },
];

const BUDGET_OPTIONS = [
    { label: 'Tất Cả', value: 'tat_ca' },
    { label: 'Dưới 5 tỷ', value: 'duoi_5' },
    { label: '5 → 10 tỷ', value: '5_10' },
    { label: '10 → 15 tỷ', value: '10_15' },
    { label: '15 → 20 tỷ', value: '15_20' },
    { label: 'Trên 20 tỷ', value: 'tren_20' },
];

const DEFAULT_FILTER: DealFilterState = {
    quickRange: '7_ngay',
    dateRange: { from: null, to: null },
    search: '',
    source: 'tat_ca',
    stage: 'tat_ca',
    assignee: 'tat_ca',
    need: 'tat_ca',
    propertyType: 'tat_ca',
    area: 'tat_ca',
    budget: 'tat_ca',
    page: 1,
    pageSize: 10
};

// --- HELPER COMPONENTS ---

const StatusBadge = ({ stage }: { stage: DealStage }) => {
    const config: Record<string, { label: string, color: string, bg: string }> = {
        'deal_mo': { label: 'Deals Mở', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
        'dam_phan': { label: 'Đàm Phán', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
        'dat_coc': { label: 'Đặt Cọc', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
        'gd_hoan_tat': { label: 'Hoàn Tất', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
        'huy_that_bai': { label: 'Thất Bại', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
    };
    const c = config[stage] || config['deal_mo'];
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border whitespace-nowrap", c.bg, c.color)}>
            {c.label}
        </span>
    );
}

// Inline Select for Status (Custom implementation to stop propagation)
const InlineStatusSelect = ({ value, onChange }: { value: DealStage, onChange: (v: DealStage) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value as DealStage);
    };

    return (
        <div className="relative w-[130px]" onClick={(e) => e.stopPropagation()}>
            <select 
                value={value} 
                onChange={handleChange}
                className={cn(
                    "w-full appearance-none pl-2 pr-6 py-1 text-xs font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors",
                    // Comparisons aligned with updated DealStage type
                    value === 'gd_hoan_tat' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    value === 'huy_that_bai' ? "bg-slate-50 border-slate-200 text-slate-600" :
                    "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                )}
            >
                {DEAL_STAGE_OPTIONS.filter(o => o.value !== 'tat_ca').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
        </div>
    )
}

export const DealList = () => {
    const [filters, setFilters] = useState<DealFilterState>(DEFAULT_FILTER);
    const [data, setData] = useState<DealDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [initialLeadId, setInitialLeadId] = useState<string | null>(null);

    // Deep Link Check
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const leadId = params.get('leadId');
        if (leadId) {
            setInitialLeadId(leadId);
            setIsCreateModalOpen(true);
            // Clean URL (optional)
            window.history.replaceState({}, '', '/deals');
        }
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getDeals(filters);
            setData(res);
        } catch (e) {
            setError(true);
            toast("Không tải được dữ liệu", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [filters]);

    const handleReset = () => setFilters(DEFAULT_FILTER);

    const handleDelete = (id: string) => {
        setData(prev => prev ? ({
            ...prev,
            deals: prev.deals.filter(d => d.id !== id),
            totalCount: prev.totalCount - 1
        }) : null);
        toast("Đã xóa Deal thành công");
        setSelectedDeal(null);
    };

    const handleStatusChange = (id: string, newStage: DealStage) => {
        if (!data) return;
        const updatedDeals = data.deals.map(d => 
            d.id === id ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d
        );
        let won = data.kpi.wonDeals;
        // Comparison aligned with updated DealStage type
        if (newStage === 'gd_hoan_tat') won++; 
        setData({
            ...data,
            deals: updatedDeals,
            kpi: { ...data.kpi, wonDeals: won }
        });
        if (selectedDeal && selectedDeal.id === id) {
            setSelectedDeal(prev => prev ? ({...prev, stage: newStage}) : null);
        }
        toast("Cập nhật trạng thái thành công");
    };

    const openDetail = (deal: Deal) => setSelectedDeal(deal);

    return (
        <div className="space-y-6">
            <CreateDealWizardModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setInitialLeadId(null);
                }} 
                onSuccess={() => {
                    fetchDeals();
                }}
                initialLeadId={initialLeadId}
            />
            
            <DealDetailDrawer 
                deal={selectedDeal} 
                onClose={() => setSelectedDeal(null)} 
                onDelete={handleDelete}
                onUpdateStatus={handleStatusChange}
            />

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Danh Sách Deals</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý các cơ hội kinh doanh và giao dịch</p>
                </div>
                <Button className="gap-2 shadow-lg shadow-indigo-200" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> Tạo Deals
                </Button>
            </div>

            {/* --- KPI --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl"/>) : (
                    <>
                        <Card className="hover:-translate-y-1 transition-transform border-l-4 border-l-indigo-500">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng Deals</p>
                                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatNumber(data?.kpi.totalDeals || 0)}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Briefcase size={24}/></div>
                            </CardContent>
                        </Card>
                        <Card className="hover:-translate-y-1 transition-transform border-l-4 border-l-sky-500">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase">Deal Mới Tuần Này</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-2xl font-extrabold text-slate-800">{formatNumber(data?.kpi.newThisWeek || 0)}</p>
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><TrendingUp size={24}/></div>
                            </CardContent>
                        </Card>
                        <Card className="hover:-translate-y-1 transition-transform border-l-4 border-l-emerald-500">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase">Deal → Hoàn Tất</p>
                                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatNumber(data?.kpi.wonDeals || 0)}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24}/></div>
                            </CardContent>
                        </Card>
                        <Card className="hover:-translate-y-1 transition-transform border-l-4 border-l-amber-500">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase">Tỷ Lệ Chuyển Đổi</p>
                                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{data?.kpi.conversionRate}%</p>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users size={24}/></div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* --- FILTER & TABLE --- */}
            <Card className="overflow-hidden shadow-sm border border-slate-200">
                <CardHeader className="bg-white pb-6 border-b border-slate-100 p-6 space-y-5">
                    {/* Row 1: Quick Ranges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                             <Button 
                                variant={filters.quickRange === '7_ngay' ? 'primary' : 'outline'} 
                                size="sm" 
                                onClick={() => setFilters(p => ({...p, quickRange: '7_ngay'}))}
                                className={cn("h-9", filters.quickRange !== '7_ngay' && "bg-white text-slate-600 border-slate-200")}
                             >
                                7 Ngày Gần Đây
                             </Button>
                             <Button 
                                variant={filters.quickRange === 'thang_nay' ? 'primary' : 'outline'} 
                                size="sm" 
                                onClick={() => setFilters(p => ({...p, quickRange: 'thang_nay'}))}
                                className={cn("h-9", filters.quickRange !== 'thang_nay' && "bg-white text-slate-600 border-slate-200")}
                             >
                                Tháng Này
                             </Button>
                             
                             {/* Mock Date Picker */}
                             <div className="flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white gap-2 h-9 cursor-pointer hover:border-indigo-300">
                                 <Calendar size={14} className="text-slate-400"/>
                                 <span>29.11.2025 - 29.11.2025</span>
                             </div>

                             <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 text-slate-500 hover:text-indigo-600">
                                 <RotateCcw size={14} className="mr-2"/> Reset Bộ Lọc
                             </Button>
                        </div>
                    </div>

                    {/* Row 2: Grid Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 pt-2">
                         <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <input 
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm h-10"
                                placeholder="Tìm kiếm..."
                                value={filters.search}
                                onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                            />
                         </div>
                         <Select className="w-full text-xs" label="Nguồn Deals" placeholder="Tất cả nguồn" options={SOURCE_OPTIONS} value={filters.source} onChange={v => setFilters(p => ({...p, source: v as any}))} />
                         <Select className="w-full text-xs" label="Trạng Thái Lead" placeholder="Tất cả" options={DEAL_STAGE_OPTIONS} value={filters.stage} onChange={v => setFilters(p => ({...p, stage: v as any}))} />
                         <Select className="w-full text-xs" label="Sale Phụ Trách" placeholder="Tất cả sale" options={ASSIGNEE_OPTIONS} value={filters.assignee} onChange={v => setFilters(p => ({...p, assignee: v}))} />
                         <Select className="w-full text-xs" label="Nhu Cầu" placeholder="Tất cả nhu cầu" options={NEED_OPTIONS} value={filters.need} onChange={v => setFilters(p => ({...p, need: v as any}))} />
                         <Select className="w-full text-xs" label="Loại Hình BĐS" placeholder="Tất cả loại" options={PROPERTY_TYPE_OPTIONS} value={filters.propertyType} onChange={v => setFilters(p => ({...p, propertyType: v as any}))} />
                         <Select className="w-full text-xs" label="Khu Vực" placeholder="Tất cả khu vực" options={AREA_OPTIONS} value={filters.area} onChange={v => setFilters(p => ({...p, area: v}))} />
                         <Select className="w-full text-xs" label="Ngân Sách" placeholder="Tất cả ngân sách" options={BUDGET_OPTIONS} value={filters.budget} onChange={v => setFilters(p => ({...p, budget: v as any}))} />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                         <div className="p-6 space-y-4">
                             {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}
                         </div>
                    ) : error ? (
                        <div className="p-12 text-center text-rose-500">Không tải được dữ liệu.</div>
                    ) : data?.deals.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Search size={32}/></div>
                            <h3 className="text-slate-900 font-semibold">Không có deals phù hợp bộ lọc</h3>
                            <Button variant="outline" onClick={handleReset} className="mt-4">Reset bộ lọc</Button>
                        </div>
                    ) : (
                        <>
                        <div className="relative w-full">
                            <div className="overflow-x-auto custom-scrollbar pb-4">
                                <table className="w-full text-left border-collapse min-w-[1800px]">
                                    <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 min-w-[100px]">ID KH</th>
                                            <th className="px-4 py-3 min-w-[180px]">Tên KH</th>
                                            <th className="px-4 py-3 min-w-[120px]">Số ĐT</th>
                                            <th className="px-4 py-3 min-w-[120px]">Nhu Cầu</th>
                                            <th className="px-4 py-3 min-w-[150px]">Loại Hình</th>
                                            <th className="px-4 py-3 min-w-[150px]">Khu Vực</th>
                                            <th className="px-4 py-3 min-w-[120px] text-right">Ngân Sách</th>
                                            <th className="px-4 py-3 min-w-[120px]">Nguồn</th>
                                            <th className="px-4 py-3 min-w-[160px]">Phụ Trách</th>
                                            <th className="px-4 py-3 min-w-[160px]">Trạng Thái</th>
                                            <th className="px-4 py-3 min-w-[140px] text-right">Ngày Tạo</th>
                                            <th className="px-4 py-3 min-w-[140px] text-right">Cập Nhật Cuối</th>
                                            <th className="sticky right-0 bg-slate-50 px-4 py-3 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] w-[100px] z-20">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                                        {data?.deals.map((deal, idx) => (
                                            <tr key={deal.id} className={cn("group transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100")} onClick={() => openDetail(deal)}>
                                                <td className="px-4 py-3 font-medium text-indigo-600">{deal.customerId}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-800">{deal.customerName}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600 text-xs">{deal.phone}</td>
                                                <td className="px-4 py-3">
                                                    {deal.need === 'mua' && <Badge variant="indigo">Mua</Badge>}
                                                    {deal.need === 'thue' && <Badge variant="success">Thuê</Badge>}
                                                    {deal.need.includes('ky_gui') && <Badge variant="warning">Ký Gửi</Badge>}
                                                </td>
                                                <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">{deal.propertyType}</span></td>
                                                <td className="px-4 py-3 text-slate-600">{deal.area}</td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatNumber(deal.budgetTy)} tỷ</td>
                                                <td className="px-4 py-3 capitalize">{deal.source}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                                            {deal.assignee.charAt(0)}
                                                        </div>
                                                        <span className="text-xs truncate max-w-[120px]">{deal.assignee}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <InlineStatusSelect value={deal.stage} onChange={(v) => handleStatusChange(deal.id, v)} />
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs text-slate-500">{new Date(deal.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="px-4 py-3 text-right text-xs text-slate-500">{new Date(deal.updatedAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="sticky right-0 bg-white/0 group-hover:bg-slate-100/0 px-4 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button size="icon" variant="primary" className="h-7 w-7 bg-indigo-50 text-indigo-600 shadow-none hover:bg-indigo-100" onClick={(e) => { e.stopPropagation(); openDetail(deal); }}>
                                                            <Eye size={14}/>
                                                        </Button>
                                                        <Button size="icon" variant="destructive" className="h-7 w-7 bg-white text-rose-500 border border-slate-200 shadow-none hover:bg-rose-50" onClick={(e) => {
                                                            if(window.confirm("Xóa deal này?")) handleDelete(deal.id);
                                                        }}>
                                                            <Trash2 size={14}/>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <span>Hiển thị</span>
                                <Select 
                                    value={filters.pageSize.toString()} 
                                    options={[{label:'10', value:'10'}, {label:'20', value:'20'}, {label:'50', value:'50'}]}
                                    onChange={(v) => setFilters(p => ({...p, pageSize: parseInt(v), page: 1}))}
                                    className="w-[70px]"
                                />
                                <span>kết quả: <b>{Math.min((filters.page - 1) * filters.pageSize + 1, data?.totalCount || 0)} - {Math.min(filters.page * filters.pageSize, data?.totalCount || 0)}</b> trong <b>{data?.totalCount}</b></span>
                            </div>
                            <Pagination 
                                page={filters.page} 
                                total={data?.totalCount || 0} 
                                size={filters.pageSize} 
                                onChange={(p) => setFilters(prev => ({...prev, page: p}))}
                            />
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

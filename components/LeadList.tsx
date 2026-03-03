
import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  Button, Select, Input, Badge, Skeleton, TooltipWrapper, Pagination, toast
} from './ui';
import { Lead, LeadFilterState, LeadDashboardData, FunnelStageKey, LeadStatus } from '../types';
import { getLeads } from '../data';
import { formatNumber, cn } from '../utils';
import { 
  Plus, Search, RotateCcw, Calendar, MoreHorizontal, 
  Eye, History, Trash2, ArrowRight, UserPlus, Users, Briefcase, Filter, Download
} from 'lucide-react';
import { CreateLeadWizardModal } from './leads/CreateLeadWizardModal';
import { LeadDetailDrawer } from './leads/LeadDetailDrawer';

// --- Constants ---
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

const STATUS_OPTIONS = [
  { label: 'Tất Cả Trạng Thái', value: 'tat_ca' },
  { label: 'Lead Mới', value: 'lead_moi' },
  { label: 'Đang Chăm', value: 'dang_cham' },
  { label: 'Hẹn Xem Nhà', value: 'hen_xem_nha' },
  { label: 'Deal Mở', value: 'deal_mo' },
  { label: 'Đàm Phán', value: 'dam_phan' },
  { label: 'Đặt Cọc', value: 'dat_coc' },
  { label: 'GD Hoàn Tất', value: 'gd_hoan_tat' },
  { label: 'Thất Bại', value: 'that_bai' },
];

const NEED_OPTIONS = [
  { label: 'Tất Cả Nhu Cầu', value: 'tat_ca' },
  { label: 'Mua', value: 'mua' },
  { label: 'Thuê', value: 'thue' },
  { label: 'Ký Gửi Bán', value: 'ky_gui_ban' },
];

const PROPERTY_TYPE_OPTIONS = [
    { label: 'Tất Cả Loại BĐS', value: 'tat_ca' },
    { label: 'Chung Cư', value: 'chung_cu' },
    { label: 'Liền Kề', value: 'lien_ke' },
    { label: 'Biệt Thự', value: 'biet_thu' },
    { label: 'Nhà Riêng', value: 'nha_rieng' },
    { label: 'Đất Nền', value: 'dat_nen' },
];

const ASSIGNEE_OPTIONS = [
    { label: 'Tất Cả Sale', value: 'tat_ca' },
    { label: 'Lê Thị B', value: 'Lê Thị B' },
    { label: 'Nguyễn Văn Sale', value: 'Nguyễn Văn Sale' },
];

const AREA_OPTIONS = [
    { label: 'Tất Cả Khu Vực', value: 'tat_ca' },
    { label: 'P.Hà Đông', value: 'P.Hà Đông' },
    { label: 'P.Dương Nội', value: 'P.Dương Nội' },
];

const BUDGET_OPTIONS = [
    { label: 'Tất Cả Ngân Sách', value: 'tat_ca' },
    { label: 'Dưới 5 tỷ', value: 'duoi_5' },
    { label: '5 → 10 tỷ', value: '5_10' },
    { label: '10 → 15 tỷ', value: '10_15' },
    { label: '15 → 20 tỷ', value: '15_20' },
    { label: 'Trên 20 tỷ', value: 'tren_20' },
];

const DEFAULT_FILTER: LeadFilterState = {
  search: '',
  source: 'tat_ca',
  status: 'tat_ca',
  assignee: 'tat_ca',
  need: 'tat_ca',
  propertyType: 'tat_ca',
  area: 'tat_ca',
  budget: 'tat_ca',
  page: 1,
  pageSize: 10
};

export const LeadList = () => {
  const [filters, setFilters] = useState<LeadFilterState>(DEFAULT_FILTER);
  const [data, setData] = useState<LeadDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getLeads(filters);
      setData(res);
    } catch (e) {
      setError(true);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleReset = () => setFilters(DEFAULT_FILTER);
  
  const handleNavToDeal = (id: string) => {
    // Mock navigation
    toast(`Chuyển hướng đến Deal của Lead ${id}`);
    window.dispatchEvent(new CustomEvent('routeChange', { detail: 'deals' }));
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
      if (!data) return;
      
      const updatedLeads = data.leads.map(lead => 
          lead.id === id ? { ...lead, status: newStatus as any, updatedAt: new Date().toISOString() } : lead
      );
      
      setData({ ...data, leads: updatedLeads });
      if (selectedLead && selectedLead.id === id) {
          setSelectedLead(prev => prev ? ({...prev, status: newStatus as any}) : null);
      }
      toast(`Cập nhật trạng thái thành công: ${newStatus}`);
  };

  const handleDelete = (id: string) => {
      if (!data) return;
      const updatedLeads = data.leads.filter(l => l.id !== id);
      setData({ ...data, leads: updatedLeads, totalCount: data.totalCount - 1 });
      toast("Đã xóa Lead thành công");
      setSelectedLead(null);
  };

  const getStatusBadge = (status: string) => {
      const map: Record<string, any> = {
          'lead_moi': { label: 'Lead Mới', variant: 'indigo' },
          'dang_cham': { label: 'Đang Chăm', variant: 'success' },
          'hen_xem_nha': { label: 'Hẹn Xem Nhà', variant: 'warning' },
          'deal_mo': { label: 'Deal Mở', variant: 'warning' },
          'dam_phan': { label: 'Đàm Phán', variant: 'danger' },
          'that_bai': { label: 'Thất Bại', variant: 'neutral' },
      };
      const conf = map[status] || { label: status, variant: 'neutral' };
      return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  const getNeedBadge = (need: string) => {
      if (need === 'mua') return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">MUA</span>;
      if (need === 'thue') return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">THUÊ</span>;
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">KÝ GỬI</span>;
  };

  return (
    <div className="space-y-6">
       <CreateLeadWizardModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => fetchLeads()}
       />
       
       <LeadDetailDrawer 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
       />

       {/* --- HEADER --- */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Danh Sách Lead</h1>
              <p className="text-slate-500 text-sm mt-1">Quản lý toàn bộ khách hàng tiềm năng</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2 bg-white hidden sm:flex">
                 <Download size={16}/> Xuất Excel
             </Button>
             <Button className="gap-2 shadow-lg shadow-indigo-200" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} /> Tạo Lead
             </Button>
          </div>
       </div>

       {/* --- KPI --- */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl"/>) : (
             <>
                <Card className="hover:-translate-y-1 transition-transform">
                   <CardContent className="p-5 flex items-center justify-between">
                       <div>
                           <p className="text-slate-500 text-xs font-bold uppercase">Tổng Lead</p>
                           <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatNumber(data?.kpi.total || 0)}</p>
                       </div>
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24}/></div>
                   </CardContent>
                </Card>
                <Card className="hover:-translate-y-1 transition-transform">
                   <CardContent className="p-5 flex items-center justify-between">
                       <div>
                           <p className="text-slate-500 text-xs font-bold uppercase">Lead Mới Tuần Này</p>
                           <div className="flex items-baseline gap-2 mt-1">
                               <p className="text-2xl font-extrabold text-slate-800">{formatNumber(data?.kpi.newThisWeek || 0)}</p>
                               <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
                           </div>
                       </div>
                       <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserPlus size={24}/></div>
                   </CardContent>
                </Card>
                <Card className="hover:-translate-y-1 transition-transform">
                   <CardContent className="p-5 flex items-center justify-between">
                       <div>
                           <p className="text-slate-500 text-xs font-bold uppercase">Lead → Deal</p>
                           <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatNumber(data?.kpi.leadToDeal || 0)}</p>
                       </div>
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Briefcase size={24}/></div>
                   </CardContent>
                </Card>
                <Card className="hover:-translate-y-1 transition-transform">
                   <CardContent className="p-5 flex items-center justify-between">
                       <div>
                           <p className="text-slate-500 text-xs font-bold uppercase">Tỷ Lệ Chuyển Đổi</p>
                           <p className="text-2xl font-extrabold text-slate-800 mt-1">{data?.kpi.conversionRate}%</p>
                       </div>
                       <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Users size={24}/></div>
                   </CardContent>
                </Card>
             </>
          )}
       </div>

       {/* --- FILTER & TABLE CARD --- */}
       <Card className="overflow-hidden shadow-sm border border-slate-200">
          <CardHeader className="bg-white pb-6 border-b border-slate-100 p-6 space-y-5">
             {/* Row 1: Search & Date */}
             <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div className="relative w-full xl:w-[400px]">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="Tìm kiếm ID, Tên, SĐT, Email..."
                        value={filters.search}
                        onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                     />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <Button variant="outline" size="sm" className="bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors h-10 px-4">7 Ngày</Button>
                    <Button variant="outline" size="sm" className="bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors h-10 px-4">Tháng Này</Button>
                    <div className="w-px h-8 bg-slate-300 mx-2 hidden sm:block"></div>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500 hover:text-indigo-600 h-10"><RotateCcw size={14} className="mr-2"/> Reset</Button>
                </div>
             </div>

             {/* Row 2: Spread Out Filters (Grid) */}
             <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 pt-2">
                 <Select className="w-full" label="Nguồn Lead" placeholder="Tất cả nguồn" options={SOURCE_OPTIONS} value={filters.source} onChange={v => setFilters(p => ({...p, source: v as any}))} />
                 <Select className="w-full" label="Trạng Thái" placeholder="Tất cả trạng thái" options={STATUS_OPTIONS} value={filters.status} onChange={v => setFilters(p => ({...p, status: v as any}))} />
                 <Select className="w-full" label="Sale Phụ Trách" placeholder="Tất cả sale" options={ASSIGNEE_OPTIONS} value={filters.assignee} onChange={v => setFilters(p => ({...p, assignee: v}))} />
                 <Select className="w-full" label="Nhu Cầu" placeholder="Tất cả nhu cầu" options={NEED_OPTIONS} value={filters.need} onChange={v => setFilters(p => ({...p, need: v as any}))} />
                 <Select className="w-full" label="Loại BĐS" placeholder="Tất cả loại" options={PROPERTY_TYPE_OPTIONS} value={filters.propertyType} onChange={v => setFilters(p => ({...p, propertyType: v as any}))} />
                 <Select className="w-full" label="Khu Vực" placeholder="Tất cả khu vực" options={AREA_OPTIONS} value={filters.area} onChange={v => setFilters(p => ({...p, area: v}))} />
                 <Select className="w-full" label="Ngân Sách" placeholder="Tất cả ngân sách" options={BUDGET_OPTIONS} value={filters.budget} onChange={v => setFilters(p => ({...p, budget: v as any}))} />
             </div>
          </CardHeader>

          {/* --- TABLE CONTENT --- */}
          <CardContent className="p-0">
             {loading ? (
                 <div className="p-6 space-y-4">
                     {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}
                 </div>
             ) : error ? (
                 <div className="p-12 text-center text-rose-500">Không tải được dữ liệu. Vui lòng thử lại.</div>
             ) : data?.leads.length === 0 ? (
                 <div className="p-16 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Search size={32}/></div>
                     <h3 className="text-slate-900 font-semibold">Không tìm thấy lead phù hợp</h3>
                     <p className="text-slate-500 text-sm mt-1 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                     <Button variant="outline" onClick={handleReset}>Xóa bộ lọc</Button>
                 </div>
             ) : (
                <>
                {/* Horizontal Scroll Wrapper with visual cue */}
                <div className="relative w-full">
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                        <table className="w-full text-left border-collapse min-w-[1600px]">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[110px] text-left">ID KH</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[200px] text-left">Tên KH</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[130px] text-left">SĐT</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[140px] text-left">Nhu Cầu</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[150px] text-left">Loại Hình</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[160px] text-left">Khu Vực</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right min-w-[150px]">Ngân Sách</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[140px] text-left">Nguồn</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[180px] text-left">Phụ Trách</th>
                                    <th className="px-6 py-4 whitespace-nowrap min-w-[160px] text-left">Trạng Thái</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right min-w-[140px]">Ngày Tạo</th>
                                    <th className="sticky right-0 bg-slate-50 px-6 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] w-[120px] z-20">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                                {data?.leads.map((lead) => (
                                    <tr 
                                        key={lead.id} 
                                        className="hover:bg-slate-50/80 group transition-colors cursor-pointer"
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <td className="px-6 py-4 font-medium text-indigo-600">{lead.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{lead.customerName}</td>
                                        <td className="px-6 py-4 font-mono text-slate-600">{lead.phone}</td>
                                        <td className="px-6 py-4">{getNeedBadge(lead.need)}</td>
                                        <td className="px-6 py-4"><Badge variant="outline">{lead.propertyType}</Badge></td>
                                        <td className="px-6 py-4 text-slate-600">{lead.area}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatNumber(lead.budgetTy)} tỷ</td>
                                        <td className="px-6 py-4 capitalize">{lead.source}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {lead.assignee.charAt(0)}
                                                </div>
                                                {lead.assignee}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-500">{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-6 py-3 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                {lead.status === 'hen_xem_nha' && (
                                                    <TooltipWrapper content="Xem Deal">
                                                        <Button size="icon" className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700" onClick={() => handleNavToDeal(lead.id)}>
                                                            <ArrowRight size={14} />
                                                        </Button>
                                                    </TooltipWrapper>
                                                )}
                                                <TooltipWrapper content="Chi tiết">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => setSelectedLead(lead)}><Eye size={14}/></Button>
                                                </TooltipWrapper>
                                                <TooltipWrapper content="Xóa">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={() => {
                                                        if(window.confirm("Xóa lead này?")) handleDelete(lead.id);
                                                    }}><Trash2 size={14}/></Button>
                                                </TooltipWrapper>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* --- FOOTER PAGINATION --- */}
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

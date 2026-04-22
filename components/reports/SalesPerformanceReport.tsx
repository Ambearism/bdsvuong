
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Badge, Skeleton, TooltipWrapper } from '../ui';
import { formatNumber, formatCurrencyTy, cn } from '../../utils';
import { 
    Users, Briefcase, CheckCircle2, Banknote, Building, Percent, 
    ArrowUpRight, ArrowDownRight, Minus, Filter, Calendar, RotateCcw, Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, Legend } from 'recharts';

// --- MOCK DATA ---
const KPI_DATA = [
    { label: 'Khách Mới', value: 248, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { label: 'Giao dịch Đang Mở', value: 73, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50/50' },
    { label: 'Giao Dịch Thành Công', value: 21, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    { label: 'Giá Trị Giao Dịch', value: 318, unit: 'Tỷ', icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { label: 'Khách → Cơ hội', value: 4.7, unit: 'ngày', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
    { label: 'Cơ hội → Giao dịch', value: 19.5, unit: 'ngày', icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    { label: 'Tỉ Lệ Hủy Deal', value: 17, unit: '%', icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50/50' },
];

const PERFORMANCE_DATA = [
    { name: 'Trịnh Trung Hiếu', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 12, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 45, pLeadGD: 45, pDealGD: 45, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
    { name: 'Tuấn Anh', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 11, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 15, pLeadGD: 15, pDealGD: 15, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
    { name: 'Duy Dũng', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 38, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 25, pLeadGD: 25, pDealGD: 25, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
    { name: 'Minh Đức', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 21, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 21, pLeadGD: 21, pDealGD: 21, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
    { name: 'Hoàng Duy', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 10, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 10, pLeadGD: 10, pDealGD: 10, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
    { name: 'Phương Thảo', leadMoi: 44, leadDangCham: 9, leadHuy: 5, dealMo: 44, dealGiaoDich: 9, dealHuy: 5, gdThanhCong: 3, hopDongMua: 44, hopDongThue: 9, pLeadDeal: 3, pLeadGD: 3, pDealGD: 3, revenue: 18.2, avgGD: 2.27, fee: 1.05 },
];

const RANKING_DATA = [
    { name: 'Trung Hiếu', value: 18.2, color: '#10b981' },
    { name: 'Tuấn Anh', value: 12.5, color: '#fbbf24' },
    { name: 'Duy Dũng', value: 10, color: '#f87171' },
    { name: 'Minh Đức', value: 15, color: '#ef4444' },
    { name: 'Hoàng Duy', value: 18, color: '#6366f1' },
    { name: 'Phương Thảo', value: 4, color: '#3b82f6' },
];

const TREND_DATA = [
    { month: '1', Thao: 40, Duc: 60 },
    { month: '2', Thao: 65, Duc: 50 },
    { month: '3', Thao: 45, Duc: 70 },
    { month: '4', Thao: 90, Duc: 65 },
    { month: '5', Thao: 70, Duc: 80 },
    { month: '6', Thao: 65, Duc: 35 },
    { month: '7', Thao: 85, Duc: 55 },
    { month: '8', Thao: 110, Duc: 75 },
    { month: '9', Thao: 75, Duc: 105 },
    { month: '10', Thao: 120, Duc: 85 },
    { month: '11', Thao: 105, Duc: 95 },
    { month: '12', Thao: 90, Duc: 70 },
];

export const SalesPerformanceReport: React.FC = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header section with filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-black text-[#1e2b3c] tracking-tight">Báo Cáo Hiệu Suất Sales</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="live" className="font-semibold text-[10px] px-2 py-0.5 rounded shadow-sm">LIVE</Badge>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 text-xs font-medium">Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Select options={[{ label: 'Tất cả Hàng Hóa', value: 'all' }]} value="all" wrapperClassName="w-40" />
                    <Select options={[{ label: '7 Ngày Gần Nhất', value: '7' }]} value="7" wrapperClassName="w-40" />
                    <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-bold text-slate-600">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>23.11.2023 - 30.11.2023</span>
                    </div>
                    <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <RotateCcw size={14} className="mr-2" /> Reset Bộ Lọc
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
                {KPI_DATA.map((kpi, idx) => (
                    <Card key={idx} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[32px] font-black text-[#1e2b3c] tracking-tighter leading-none">{formatNumber(kpi.value)}</span>
                                {kpi.unit && <span className="text-[12px] font-extrabold text-[#1f2937] ml-0.5">{kpi.unit}</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Performance Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-sm font-black text-slate-700 uppercase">Hiệu suất chi tiết theo Nhân viên</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-center">Chuyên Viên</th>
                                <th className="px-4 py-3 text-center">Lead</th>
                                <th className="px-4 py-3 text-center">Deal</th>
                                <th className="px-4 py-3 text-center">GD Thành Công</th>
                                <th className="px-4 py-3 text-center">Hợp Đồng</th>
                                <th className="px-4 py-3 text-center">% Khách → Cơ hội</th>
                                <th className="px-4 py-3 text-center">% Khách → GD</th>
                                <th className="px-4 py-3 text-center">% Cơ hội → GD</th>
                                <th className="px-4 py-3 text-right">Doanh Thu (tỷ)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {PERFORMANCE_DATA.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4 font-bold text-slate-800">{row.name}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between"><span>Mới</span><span className="font-black text-slate-800">{row.leadMoi}</span></div>
                                            <div className="flex justify-between"><span>Đang chăm</span><span className="font-black text-slate-800">{row.leadDangCham}</span></div>
                                            <div className="flex justify-between"><span>Hủy</span><span className="font-black text-rose-500">{row.leadHuy}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between"><span>Mở</span><span className="font-black text-slate-800">{row.dealMo}</span></div>
                                            <div className="flex justify-between"><span>Giao dịch</span><span className="font-black text-slate-800">{row.dealGiaoDich}</span></div>
                                            <div className="flex justify-between"><span>Hủy</span><span className="font-black text-rose-500">{row.dealHuy}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-black text-slate-800 text-sm">{row.gdThanhCong}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between"><span>Mua</span><span className="font-black text-slate-800">{row.hopDongMua}</span></div>
                                            <div className="flex justify-between"><span>Thuê</span><span className="font-black text-slate-800">{row.hopDongThue}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-bold text-slate-600">{row.pLeadDeal}%</td>
                                    <td className="px-4 py-4 text-center font-bold text-slate-600">{row.pLeadGD}%</td>
                                    <td className="px-4 py-4 text-center font-bold text-slate-600">{row.pDealGD}%</td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5 text-right">
                                            <div className="flex justify-between gap-4 font-bold text-slate-800"><span>Tổng</span><span>{row.revenue}</span></div>
                                            <div className="flex justify-between gap-4"><span>Trung bình/GD</span><span className="font-bold">{row.avgGD}</span></div>
                                            <div className="flex justify-between gap-4"><span>Phí</span><span className="font-bold">{row.fee}</span></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <Select options={[{ label: '10', value: '10' }]} value="10" className="w-16 h-8" />
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Results: 1 - 10 of 100</div>
                    <div className="flex gap-1">
                        {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
                            <button key={i} className={cn("w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-all", p === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-200")}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ranking Bar Chart */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                        <CardTitle className="text-sm font-black text-[#1e2b3c] uppercase">Xếp hạng hiệu suất</CardTitle>
                        <Select options={[{ label: '7 Ngày Gần Nhất', value: '7' }]} value="7" className="w-36 h-8 text-[10px]" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={RANKING_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                        {RANKING_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Line Chart */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                        <CardTitle className="text-sm font-black text-[#1e2b3c] uppercase">Giá Trị Giao Dịch</CardTitle>
                        <Select options={[{ label: '30 Ngày Gần Nhất', value: '30' }]} value="30" className="w-36 h-8 text-[10px]" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={TREND_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Thao" name="Phương Thảo" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Duc" name="Minh Đức" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Select, Input, Badge, Skeleton, toast } from '../../../components/ui';
import { ArAgingItem } from '../../../types';
import { getArAgingReport } from '../../../data/leaseFactory';
import { formatCurrencyTy, cn } from '../../../utils';
import { Search, Download, Filter, Calendar, TrendingUp, AlertCircle, ChevronRight, FileText } from 'lucide-react';

export default function ArAgingReportPage() {
  const [data, setData] = useState<ArAgingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    getArAgingReport(asOfDate).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [asOfDate]);

  const totalOutstanding = data.reduce((acc, curr) => acc + curr.totalOutstandingTy, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Báo Cáo Phân Tích Tuổi Nợ (AR Aging)</h1>
                <p className="text-slate-500 text-sm mt-1">Phân loại các khoản nợ tiền thuê theo thời gian quá hạn thực tế</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="gap-2 bg-white border-slate-200" onClick={() => toast("Đang xuất file Excel...")}>
                    <Download size={18} /> Xuất Excel
                </Button>
            </div>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-indigo-600 text-white shadow-lg border-none">
                <CardContent className="p-5">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Tổng nợ chưa thu</p>
                    <div className="text-3xl font-black">{formatCurrencyTy(totalOutstanding)}</div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 p-2 rounded-lg">
                        <TrendingUp size={14}/> +12% so với tháng trước
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quá hạn 1-30 ngày</p>
                    <div className="text-2xl font-black text-slate-800">{formatCurrencyTy(data.reduce((a, c) => a + c.buckets.days_1_30, 0))}</div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: '45%' }}></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quá hạn 31-90 ngày</p>
                    <div className="text-2xl font-black text-rose-600">{formatCurrencyTy(data.reduce((a, c) => a + c.buckets.days_31_60 + c.buckets.days_61_90, 0))}</div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: '30%' }}></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nợ xấu ( &gt; 90 ngày)</p>
                    <div className="text-2xl font-black text-rose-800">{formatCurrencyTy(data.reduce((a, c) => a + c.buckets.days_over_90, 0))}</div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-900" style={{ width: '15%' }}></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input className="pl-9 h-10" placeholder="Tên khách, Chủ nhà, BĐS..." />
                    </div>
                    <Input 
                      type="date" 
                      className="h-10 w-[180px]" 
                      label="Tính đến ngày (As-of)" 
                      value={asOfDate} 
                      onChange={(e) => setAsOfDate(e.target.value)} 
                    />
                </div>
                <div className="flex gap-3">
                    <Select className="w-[180px]" placeholder="Dự án" options={[]} value="" onChange={()=>{}} />
                    <Select className="w-[180px]" placeholder="Phụ trách" options={[]} value="" onChange={()=>{}} />
                    <Button variant="outline" className="h-10 border-slate-200 bg-white"><Filter size={16} className="mr-2"/> Nâng cao</Button>
                </div>
            </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 w-[250px]">Chủ nhà / Khách thuê</th>
                            <th className="px-6 py-4 w-[250px]">Bất động sản</th>
                            <th className="px-6 py-4 text-right bg-indigo-50/50">Tổng nợ</th>
                            <th className="px-6 py-4 text-right">Hiện tại</th>
                            <th className="px-6 py-4 text-right">1 - 30 ngày</th>
                            <th className="px-6 py-4 text-right">31 - 60 ngày</th>
                            <th className="px-6 py-4 text-right">61 - 90 ngày</th>
                            <th className="px-6 py-4 text-right text-rose-800 bg-rose-50/30 font-black">&gt; 90 ngày</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={9} className="px-6 py-4"><Skeleton className="h-8 w-full"/></td></tr>
                            ))
                        ) : data.map((item) => (
                            <tr key={item.leaseId} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toast(`Mở chi tiết nợ: ${item.leaseId}`)}>
                                <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="font-bold text-slate-800">{item.ownerName}</div>
                                    <div className="text-xs text-indigo-600 font-medium mt-0.5">Khách: {item.tenantName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-700">{item.propertyUnit}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.leaseId}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900 bg-indigo-50/20">{formatCurrencyTy(item.totalOutstandingTy)}</td>
                                <td className="px-6 py-4 text-right text-slate-500">{item.buckets.current > 0 ? formatCurrencyTy(item.buckets.current) : '--'}</td>
                                <td className="px-6 py-4 text-right font-bold text-amber-600">{item.buckets.days_1_30 > 0 ? formatCurrencyTy(item.buckets.days_1_30) : '--'}</td>
                                <td className="px-6 py-4 text-right font-bold text-rose-500">{item.buckets.days_31_60 > 0 ? formatCurrencyTy(item.buckets.days_31_60) : '--'}</td>
                                <td className="px-6 py-4 text-right font-bold text-rose-700">{item.buckets.days_61_90 > 0 ? formatCurrencyTy(item.buckets.days_61_90) : '--'}</td>
                                <td className="px-6 py-4 text-right font-black text-rose-900 bg-rose-50/30">{item.buckets.days_over_90 > 0 ? formatCurrencyTy(item.buckets.days_over_90) : '--'}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                                            <ChevronRight size={18}/>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Note on calculation */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">Cách tính tuổi nợ (Aging Calculation Logic):</p>
                <ol className="list-decimal pl-4 space-y-1">
                    <li>Hệ thống quét toàn bộ <b>Lịch thanh toán (ScheduleItems)</b> chưa được thanh toán đủ.</li>
                    <li>Ngày quá hạn = <b>Ngày xem báo cáo (As-of date)</b> trừ <b>Hạn đóng (Due date)</b> của từng kỳ.</li>
                    <li>Các khoản nợ được gom theo các "Thùng" (Buckets): 0 (Chưa tới hạn), 1-30, 31-60, 61-90 và trên 90 ngày.</li>
                    <li><b>Tiền dư (Credit balance)</b> từ các giao dịch chưa phân bổ được hiển thị riêng hoặc cấn trừ tùy cấu hình lọc.</li>
                </ol>
            </div>
        </div>
    </div>
  );
}

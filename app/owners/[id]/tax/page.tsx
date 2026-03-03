
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Select, Badge, Skeleton, toast } from '../../../../components/ui';
import { TaxCase } from '../../../../types';
import { formatCurrencyTy, cn } from '../../../../utils';
import { ChevronLeft, Landmark, PieChart, TrendingUp, Calendar, AlertCircle, CheckCircle2, FileText, Plus } from 'lucide-react';

interface Props {
    params: { id: string };
    id?: string;
}

export default function OwnerTaxPage({ params, id }: Props) {
    const ownerId = id || params?.id;
    const [year, setYear] = useState(2023);
    const [loading, setLoading] = useState(true);
    const [taxData, setTaxData] = useState<TaxCase | null>(null);

    useEffect(() => {
        setLoading(true);
        // Mock fetch consolidated tax for owner
        setTimeout(() => {
            setTaxData({
                id: 'consolidated_tax_1',
                ownerId: ownerId || '',
                year,
                revenueYtdTy: 0.145, // Exceeded 100M
                thresholdTy: 0.1,
                isThresholdExceeded: true,
                exceededDate: '2023-10-15T00:00:00Z',
                status: 'filed',
                notes: 'Chủ nhà có 3 căn hộ đang cho thuê.',
                updatedAt: new Date().toISOString()
            });
            setLoading(false);
        }, 500);
    }, [ownerId, year]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'khach_hang' }));
    };

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-2xl"/></div>;
    if (!taxData) return <div className="p-20 text-center">Không có dữ liệu thuế.</div>;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Quản Lý Thuế Chủ Nhà</h1>
                        <p className="text-slate-500 text-sm mt-1">Phạm Minh Cường • MST: 8012345678</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Select 
                        value={year.toString()} 
                        onChange={(v) => setYear(parseInt(v))}
                        options={[{label: 'Năm 2023', value: '2023'}, {label: 'Năm 2022', value: '2022'}]}
                        className="w-[140px] h-10"
                    />
                    <Button className="gap-2 shadow-lg shadow-indigo-100">
                        <Plus size={18}/> Thêm hồ sơ thuế
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Consolidation KPI */}
                <Card className="md:col-span-1 border-none bg-indigo-600 text-white shadow-xl">
                    <CardContent className="p-6 space-y-6">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Doanh thu năm {year}</p>
                           <div className="text-4xl font-black">{formatCurrencyTy(taxData.revenueYtdTy)}</div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-xs opacity-80">Ngưỡng nộp thuế:</span>
                                <span className="text-sm font-bold">{formatCurrencyTy(taxData.thresholdTy)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs opacity-80">Vượt ngưỡng từ:</span>
                                <span className="text-sm font-bold">{new Date(taxData.exceededDate!).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl flex items-start gap-3">
                           <AlertCircle size={20} className="shrink-0 mt-0.5" />
                           <p className="text-[11px] leading-relaxed">Chủ nhà đã vượt ngưỡng 100tr/năm từ tháng 10. Mọi kỳ thanh toán phát sinh sau ngày này đều chịu thuế TNCN & GTGT.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Status and Quarterly Analysis */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái hồ sơ thuế</h3>
                            <Badge variant="indigo" className="px-3 py-1 font-black">{taxData.status.toUpperCase()}</Badge>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">1</div>
                                  <div className="text-sm">
                                     <p className="font-bold text-slate-800">Thu thập doanh thu</p>
                                     <p className="text-xs text-slate-500">Đã gom từ 3 hợp đồng thuê</p>
                                  </div>
                                  <CheckCircle2 size={18} className="ml-auto text-emerald-500"/>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">2</div>
                                  <div className="text-sm">
                                     <p className="font-bold text-slate-800">Lập tờ khai thuế</p>
                                     <p className="text-xs text-slate-500">Đã nộp tờ khai quý 3/2023</p>
                                  </div>
                                  <CheckCircle2 size={18} className="ml-auto text-emerald-500"/>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">3</div>
                                  <div className="text-sm">
                                     <p className="font-bold text-slate-800">Nộp thuế thực tế</p>
                                     <p className="text-xs text-slate-500">Đang chờ xác nhận từ ngân hàng</p>
                                  </div>
                                  <Calendar size={18} className="ml-auto text-amber-500"/>
                               </div>
                            </div>
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                               <h4 className="text-xs font-bold text-indigo-700 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14}/> Phân bổ doanh thu Quý</h4>
                               <div className="space-y-3">
                                  {[
                                    { q: 'Quý 1', val: 0.03, p: 20 },
                                    { q: 'Quý 2', val: 0.04, p: 30 },
                                    { q: 'Quý 3', val: 0.05, p: 40 },
                                    { q: 'Quý 4 (Dự kiến)', val: 0.025, p: 10 },
                                  ].map((q) => (
                                    <div key={q.q} className="space-y-1">
                                       <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                          <span>{q.q}</span>
                                          <span>{formatCurrencyTy(q.val)}</span>
                                       </div>
                                       <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-indigo-500" style={{ width: `${q.p}%` }}></div>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Ghi chú quản lý thuế</h3>
                            <p className="text-sm text-slate-600 italic">"{taxData.notes}"</p>
                            <div className="mt-4 flex gap-2">
                               <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600"><FileText size={14} className="mr-1.5"/> UNC nộp thuế</Button>
                               <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600"><FileText size={14} className="mr-1.5"/> Tờ khai 01/TTS</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast, TooltipWrapper } from '../../../../components/ui';
import { Inspection } from '../../../../types';
import { getInspections } from '../../../../data/careFactory';
import { formatDateTimeVi, cn } from '../../../../utils';
import { 
    ChevronLeft, Plus, ShieldCheck, AlertTriangle, 
    Calendar, User, FileText, Download, History, Eye, CheckCircle2, Clock // Added Clock
} from 'lucide-react';
import { CreateInspectionModal } from '../../../../components/inspections/CreateInspectionModal';

export default function PropertyInspectionsPage({ params, id }: { params?: { id: string }, id?: string }) {
    const propertyId = id || params?.id;
    const [data, setData] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (propertyId) {
            setLoading(true);
            getInspections(propertyId).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    }, [propertyId]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'property_hub', id: propertyId } }));
    };

    const getRiskBadge = (level: string) => {
        switch(level) {
            case 'high': return <Badge variant="danger" className="animate-pulse">RỦI RO CAO</Badge>;
            case 'medium': return <Badge variant="warning">TRUNG BÌNH</Badge>;
            default: return <Badge variant="success">AN TOÀN</Badge>;
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-[500px] w-full rounded-2xl"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <CreateInspectionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                propertyId={propertyId!}
                onSuccess={() => { setIsModalOpen(false); toast("Đã lưu biên bản kiểm tra"); }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={handleBack} className="bg-white">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Kiểm Tra & Chăm Sóc Tài Sản</h1>
                        <p className="text-slate-500 text-sm mt-1">BĐS: #125 - Nhà riêng Thái Hà</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-white"><Download size={18}/> Xuất báo cáo</Button>
                    <Button className="gap-2 shadow-lg shadow-indigo-100" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18}/> Lập biên bản mới
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline / List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <History size={18} className="text-indigo-600"/>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lịch sử kiểm tra</h3>
                    </div>

                    <div className="space-y-4">
                        {data.map((ins) => (
                            <Card key={ins.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className={cn(
                                    "h-1",
                                    ins.riskLevel === 'high' ? "bg-rose-500" : ins.riskLevel === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                                )}/>
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                                                <Calendar size={20}/>
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800">{new Date(ins.inspectionDate).toLocaleDateString('vi-VN')}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Mã PB: {ins.id}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getRiskBadge(ins.riskLevel)}
                                            <Badge variant="outline" className="capitalize">{ins.category}</Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phát hiện (Findings)</div>
                                            <p className="text-slate-700 leading-relaxed italic">"{ins.findings}"</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khuyến nghị</div>
                                            <p className="text-indigo-700 font-medium">👉 {ins.recommendation}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <User size={14}/> {ins.inspectorName}
                                            </div>
                                            {ins.nextInspectionDate && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                                                    <Clock size={14}/> Kế hoạch: {new Date(ins.nextInspectionDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-indigo-600 hover:bg-indigo-50">
                                            <Eye size={14}/> Chi tiết & Ảnh
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Quick Status / Legend */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 text-white shadow-xl border-none">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <ShieldCheck size={32} className="mb-2 opacity-80"/>
                                <h3 className="text-lg font-bold">Trạng Thái Sức Khỏe BĐS</h3>
                                <p className="text-indigo-100 text-xs mt-1">Lần cuối kiểm tra: {new Date(data[0]?.inspectionDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-indigo-500">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-80">Tuân thủ mục đích sử dụng:</span>
                                    <Badge variant="success">CO</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-80">Rủi ro tích lũy:</span>
                                    <span className="font-bold text-amber-300">TRUNG BÌNH</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm p-4 space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quy tắc kiểm tra</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-xs text-slate-600">
                                <div className="p-1 bg-emerald-100 text-emerald-600 rounded mt-0.5"><CheckCircle2 size={12}/></div>
                                <span>Kiểm tra định kỳ 6 tháng/lần với mọi hợp đồng quản lý tài sản.</span>
                            </li>
                            <li className="flex items-start gap-3 text-xs text-slate-600">
                                <div className="p-1 bg-amber-100 text-amber-600 rounded mt-0.5"><AlertTriangle size={12}/></div>
                                <span>Chụp ảnh 4 góc phòng và hệ thống kỹ thuật chính để làm bằng chứng đối chiếu.</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}

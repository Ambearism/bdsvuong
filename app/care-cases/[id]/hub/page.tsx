
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, Tabs, toast, Textarea, Select, Switch } from '../../../../components/ui';
import { CareCaseHubData, CareCaseStatus } from '../../../../types';
import { getCareCaseHub, updateCareCaseStatus, updateCareCase, updateCareFee } from '../../../../data/careFactory';
import { formatDateTimeVi, cn, formatNumber } from '../../../../utils';
import {
    ChevronLeft, Plus, MessageSquare, CheckSquare,
    Link, Paperclip, History, User, Phone, Mail,
    Calendar, AlertTriangle, Send, Zap, PieChart,
    Building2, FileText, Clock, ArrowRight
} from 'lucide-react';
import { CareFinancialTab } from '../../../../components/care/tabs/CareFinancialTab';
import { PerformanceReportTab } from '../../../../components/care/tabs/PerformanceReportTab';
import { CareTaxTab } from '../../../../components/care/tabs/CareTaxTab';
import { EditCareCaseModal } from '../../../../components/care/modals/EditCareCaseModal';
import { AdjustCareFeeModal } from '../../../../components/care/modals/AdjustCareFeeModal';
export default function CareCaseHubPage({ params, id }: { params?: { id: string }, id?: string }) {
    const caseId = id || params?.id;
    const [data, setData] = useState<CareCaseHubData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tax');
    const [logContent, setLogContent] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdjustFeeModalOpen, setIsAdjustFeeModalOpen] = useState(false);

    const fetchData = () => {
        if (caseId) {
            setLoading(true);
            getCareCaseHub(caseId).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [caseId]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'care_cases' }));
    };

    const handleToggleStatus = async () => {
        if (!data) return;
        const newStatus = data.case.status === 'active' ? 'inactive' : 'active';
        await updateCareCaseStatus(data.case.id, newStatus);
        toast(`Đã chuyển trạng thái case sang ${newStatus === 'active' ? 'Hoạt động' : 'Tạm ngưng'}`);
        fetchData();
    };

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>;
    if (!data) return <div className="p-20 text-center">Case không tồn tại.</div>;

    const { case: c, stats, tasks, logs } = data;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200 text-slate-500 shadow-sm">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{c.id}</h1>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                                <Switch checked={c.status === 'active'} onChange={handleToggleStatus} />
                                <Badge className={cn(
                                    "text-[10px] font-bold uppercase",
                                    c.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>
                                    {c.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{c.ownerName} • {c.ownerPhone}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-white font-bold border-slate-200">Báo cáo tổng hợp</Button>
                    <Button className="gap-2 shadow-lg shadow-indigo-100 font-bold bg-indigo-600" onClick={() => setIsEditModalOpen(true)}><Zap size={18} /> Chỉnh sửa Case</Button>
                </div>
            </div>

            {/* --- QUICK STATS (No Risk Score) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Công việc đang mở</div>
                    <div className="text-2xl font-black text-indigo-600">{stats.openTasks}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số hợp đồng</div>
                    <div className="text-2xl font-black text-slate-800">{c.linkedLeases.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tài sản quản lý</div>
                    <div className="text-2xl font-black text-emerald-600">{c.linkedProperties.length} <span className="text-xs text-slate-400">Assets</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tương tác cuối</div>
                    <div className="text-sm font-bold text-slate-700 mt-2 flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {new Date(c.lastContactDate).toLocaleDateString('vi-VN')}</div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <Tabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="bg-slate-100 p-1 w-full sm:w-fit overflow-x-auto no-scrollbar"
                        tabs={[
                            { id: 'tax', label: 'Quản lý Thuế' },
                            { id: 'performance', label: 'Hiệu quả ROI' },
                            { id: 'financial', label: 'Dòng tiền' },
                            { id: 'tasks', label: 'Tác vụ' },
                            { id: 'logs', label: 'Nhật ký' },
                            { id: 'entities', label: 'Tài sản & HĐ' },
                        ]}
                    />

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'performance' && <PerformanceReportTab careCase={c} />}
                        {activeTab === 'tax' && <CareTaxTab careCase={c} />}
                        {activeTab === 'financial' && <CareFinancialTab careCase={c} />}

                        {activeTab === 'tasks' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2"><CheckSquare size={18} className="text-indigo-600" /> Danh sách việc cần làm</h3>
                                    <Button size="sm" variant="outline" className="h-8 bg-white font-bold"><Plus size={14} /> Thêm việc</Button>
                                </div>
                                {tasks.length > 0 ? tasks.map(t => (
                                    <Card key={t.id} className="border-slate-200 shadow-sm hover:border-indigo-200 transition-all group bg-white">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={cn(
                                                "w-1.5 h-10 rounded-full",
                                                t.priority === 'high' ? "bg-rose-500" : "bg-slate-200"
                                            )} />
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.title}</div>
                                                <div className="text-[10px] text-slate-500 mt-1 flex gap-4 uppercase tracking-wider font-bold">
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.dueDate).toLocaleDateString('vi-VN')}</span>
                                                    <span className="flex items-center gap-1.5"><User size={12} /> {t.assignee}</span>
                                                    {t.linkedEntity && <Badge variant="indigo" className="text-[9px] py-0">{t.linkedEntity}</Badge>}
                                                </div>
                                            </div>
                                            <Badge variant={t.status === 'in_progress' ? 'warning' : 'neutral'}>{t.status.toUpperCase()}</Badge>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="p-12 text-center text-slate-300 italic border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">Chưa có tác vụ nào được tạo</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-6">
                                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex gap-3">
                                            <Select options={[{ label: 'Gọi điện', value: 'call' }, { label: 'Zalo/Chat', value: 'chat' }, { label: 'Gặp mặt', value: 'meeting' }]} value="call" onChange={() => { }} className="w-32 h-10" />
                                            <Button variant="outline" className="h-10 bg-white border-slate-200 text-xs font-bold"><Plus size={14} className="mr-1.5" /> Liên kết BĐS</Button>
                                        </div>
                                        <Textarea
                                            placeholder="Ghi lại nội dung cuộc gọi hoặc tương tác với chủ nhà/khách thuê..."
                                            value={logContent}
                                            onChange={(e: any) => setLogContent(e.target.value)}
                                            className="min-h-[120px] focus:ring-4 focus:ring-indigo-100 border-slate-200 rounded-xl"
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="follow" className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                                <label htmlFor="follow" className="text-xs text-slate-600 font-bold cursor-pointer">Yêu cầu phản hồi (Follow-up)</label>
                                            </div>
                                            <Button size="sm" className="gap-2 h-10 px-6 font-bold shadow-md shadow-indigo-100" onClick={() => { toast("Đã lưu tương tác"); setLogContent(''); }}>
                                                <Send size={14} /> Lưu tương tác
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {logs.map(log => (
                                        <div key={log.id} className="relative pl-12">
                                            <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 z-10 shadow-sm" />
                                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="indigo" className="text-[9px] uppercase font-black px-2 py-0.5">{log.channel}</Badge>
                                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatDateTimeVi(log.timestamp)}</div>
                                                        </div>
                                                        {log.followUpRequired && <Badge variant="danger" className="text-[9px] font-black">CẦN PHẢN HỒI</Badge>}
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{log.content}"</p>
                                                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <span className="flex items-center gap-1.5 text-indigo-600"><User size={12} /> {log.actor}</span>
                                                        <button className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100"><History size={12} /></button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'entities' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-slate-200 bg-white">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">BĐS đang quản lý ({c.linkedProperties.length})</h3>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-indigo-600"><Plus size={14} /></Button>
                                    </div>
                                    <CardContent className="p-3 space-y-2">
                                        {c.linkedProperties.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.code}</div>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 bg-white">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Hợp đồng liên quan ({c.linkedLeases.length})</h3>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-indigo-600"><Plus size={14} /></Button>
                                    </div>
                                    <CardContent className="p-3 space-y-2">
                                        {c.linkedLeases.map(l => (
                                            <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-indigo-50 bg-indigo-50/30 hover:border-indigo-300 transition-colors group">
                                                <div className="text-sm font-black text-indigo-700">{l.code}</div>
                                                <ArrowRight size={14} className="text-indigo-300 group-hover:text-indigo-600" />
                                            </div>
                                        ))}
                                        {c.linkedLeases.length === 0 && <div className="p-8 text-center text-slate-300 italic text-xs">Chưa có hợp đồng nào</div>}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-[320px] space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">Thông tin liên lạc</div>
                        <CardContent className="p-5 space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm"><Phone size={18} /></div>
                                <div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Điện thoại</div>
                                    <div className="font-bold text-slate-800 text-sm">{c.ownerPhone}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm"><Mail size={18} /></div>
                                <div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Email</div>
                                    <div className="font-bold text-slate-800 text-sm truncate max-w-[180px]">cuong.pham@gmail.com</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">Phí Care hàng tháng</div>
                        <CardContent className="p-5">
                            <div className="text-2xl font-black text-indigo-600 mb-1">{formatNumber(c.careFeeMillion || 0)} Tr <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ Tháng</span></div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Phí quản lý tài sản đã bao gồm VAT và công chăm sóc.</p>
                            <Button variant="outline" className="w-full mt-4 h-9 text-[10px] font-black uppercase tracking-wider border-slate-200" onClick={() => setIsAdjustFeeModalOpen(true)}>Điều chỉnh mức phí</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {c && (
                <>
                    <EditCareCaseModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        careCase={c}
                        onSave={async (data) => {
                            await updateCareCase(c.id, data);
                            toast('Đã cập nhật thông tin Care Case');
                            fetchData();
                        }}
                    />
                    <AdjustCareFeeModal
                        isOpen={isAdjustFeeModalOpen}
                        onClose={() => setIsAdjustFeeModalOpen(false)}
                        currentFee={c.careFeeMillion || 0}
                        onSave={async (fee) => {
                            await updateCareFee(c.id, fee);
                            toast('Đã cập nhật mức phí Care');
                            fetchData();
                        }}
                    />
                </>
            )}
        </div>
    );
}

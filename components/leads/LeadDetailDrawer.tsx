
import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Briefcase, Calendar, CheckCircle2, History, ArrowRight, Trash2, Edit, Mail, Sparkles } from 'lucide-react';
import { Lead, HistoryLog } from '../../types';
import { Badge, Button, toast, Tabs, Select } from '../ui';
import { cn, formatNumber } from '../../utils';
import { HistoryList } from '../common/HistoryList';

interface LeadDetailDrawerProps {
    lead: Lead | null;
    onClose: () => void;
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

const STATUS_OPTIONS = [
    { value: 'lead_moi', label: 'Lead Mới' },
    { value: 'dang_cham', label: 'Đang Chăm' },
    { value: 'hen_xem_nha', label: 'Hẹn Xem Nhà' },
    { value: 'deal_mo', label: 'Deal Mở' },
    { value: 'dam_phan', label: 'Đàm Phán' },
    { value: 'that_bai', label: 'Thất Bại' },
];

// Mock History Generator
const generateMockHistory = (lead: Lead): HistoryLog[] => {
    const history: HistoryLog[] = [
        { id: '1', action: 'create', title: 'Tạo mới Lead', description: 'Lead được nhập vào hệ thống', actor: lead.assignee, timestamp: lead.createdAt },
        { id: '2', action: 'call', title: 'Cuộc gọi đi', description: 'Đã gọi điện tư vấn sơ bộ, khách quan tâm căn 2PN', actor: lead.assignee, timestamp: new Date(new Date(lead.createdAt).getTime() + 86400000).toISOString() },
        { id: '3', action: 'status_change', title: 'Cập nhật trạng thái', description: `Thay đổi trạng thái sang "${lead.status}"`, actor: lead.assignee, timestamp: lead.updatedAt },
    ];
    return history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ lead, onClose, onUpdateStatus, onDelete }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [logs, setLogs] = useState<HistoryLog[]>([]);

    useEffect(() => {
        if (lead) {
            setLogs(generateMockHistory(lead));
            setActiveTab('info');
        }
    }, [lead]);

    if (!lead) return null;

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Lead này không? Hành động này không thể hoàn tác.")) {
            onDelete(lead.id);
            onClose();
        }
    };

    const handleStatusChange = (newStatus: string) => {
        onUpdateStatus(lead.id, newStatus);
        setLogs(prev => [{
            id: Date.now().toString(),
            action: 'status_change' as const,
            title: 'Cập nhật trạng thái',
            description: `Thay đổi trạng thái sang "${STATUS_OPTIONS.find(o => o.value === newStatus)?.label}"`,
            actor: 'Bạn',
            timestamp: new Date().toISOString()
        }, ...prev]);
    };

    const handleConvertToDeal = () => {
        toast("Đang chuyển đổi sang Deal... (Feature Mock)", "success");
        onUpdateStatus(lead.id, 'deal_mo');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300 border-l border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                             <h2 className="text-lg font-bold text-slate-800">{lead.customerName}</h2>
                             <span className="text-xs text-slate-400 font-mono">{lead.id}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><History size={14}/> {new Date(lead.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                </div>

                {/* Status Bar */}
                <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                     <Select 
                        value={lead.status} 
                        onChange={handleStatusChange} 
                        options={STATUS_OPTIONS}
                        className="w-full h-9 text-xs"
                     />
                     {!lead.hasDeal && lead.status !== 'that_bai' && (
                         <Button size="sm" variant="primary" className="h-9 whitespace-nowrap gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleConvertToDeal}>
                             <Sparkles size={14} /> Tạo Deal
                         </Button>
                     )}
                </div>

                {/* Tabs */}
                <div className="px-6 pt-2">
                    <Tabs 
                        activeTab={activeTab} 
                        onChange={setActiveTab} 
                        tabs={[
                            {id: 'info', label: 'Thông tin chi tiết'},
                            {id: 'history', label: 'Lịch sử hoạt động'}
                        ]}
                        className="w-full" 
                    />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                    {activeTab === 'info' ? (
                        <>
                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <User size={14} className="text-indigo-600"/> Liên hệ
                                </h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                                        <span className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14}/> SĐT:</span>
                                        <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-indigo-600 hover:underline">{lead.phone}</a>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                                        <span className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14}/> Email:</span>
                                        <span className="text-sm text-slate-800">{lead.email || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Requirement Info */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <Briefcase size={14} className="text-indigo-600"/> Nhu cầu
                                </h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                         <div className="text-xs text-slate-400">Nhu cầu</div>
                                         <Badge variant={lead.need === 'mua' ? 'indigo' : lead.need === 'thue' ? 'success' : 'warning'}>
                                             {lead.need.toUpperCase()}
                                         </Badge>
                                     </div>
                                     <div className="space-y-1">
                                         <div className="text-xs text-slate-400">Ngân sách (Tỷ)</div>
                                         <div className="font-bold text-slate-800">{formatNumber(lead.budgetTy)}</div>
                                     </div>
                                     <div className="space-y-1 col-span-2">
                                         <div className="text-xs text-slate-400">Khu vực & Loại hình</div>
                                         <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                             {lead.propertyType} <ArrowRight size={12} /> {lead.area}
                                         </div>
                                     </div>
                                </div>
                            </div>

                            {/* System Info */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-600"/> Hệ thống
                                </h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Nguồn:</span>
                                        <span className="font-medium capitalize bg-slate-100 px-2 py-0.5 rounded text-xs">{lead.source}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span className="text-slate-500">Phụ trách:</span>
                                        <span className="font-medium">{lead.assignee}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <HistoryList logs={logs} />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
                    <Button variant="outline" className="flex-1 text-xs gap-2 border-slate-200 text-slate-600" onClick={() => toast("Tính năng Chỉnh sửa đang phát triển")}>
                        <Edit size={14} /> Chỉnh sửa
                    </Button>
                    <Button variant="destructive" className="flex-1 text-xs gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50" onClick={handleDelete}>
                        <Trash2 size={14} /> Xóa Lead
                    </Button>
                </div>
            </div>
        </div>
    );
};

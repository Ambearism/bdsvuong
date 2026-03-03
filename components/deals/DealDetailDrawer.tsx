
import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Briefcase, Calendar, CheckCircle2, History, ArrowRight, Trash2, Edit } from 'lucide-react';
import { Deal, HistoryLog, DealStage } from '../../types';
import { Badge, Button, toast, Tabs, Select } from '../ui';
import { cn, formatCurrencyTy } from '../../utils';
import { HistoryList } from '../common/HistoryList';

interface DealDetailDrawerProps {
    deal: Deal | null;
    onClose: () => void;
    onUpdateStatus?: (id: string, status: DealStage) => void;
    onDelete?: (id: string) => void;
}

const DEAL_STAGE_OPTIONS = [
    { value: 'deal_mo', label: 'Deals Mở' },
    { value: 'dam_phan', label: 'Đàm Phán' },
    { value: 'dat_coc', label: 'Đặt Cọc' },
    { value: 'gd_hoan_tat', label: 'Hoàn Tất' },
    { value: 'huy_that_bai', label: 'Hủy / Thất Bại' },
];

const generateMockHistory = (deal: Deal): HistoryLog[] => {
     const history: HistoryLog[] = [
        { id: '1', action: 'create', title: 'Tạo Deal', description: 'Deal được tạo từ Lead #00123', actor: deal.assignee, timestamp: deal.createdAt },
        { id: '2', action: 'update', title: 'Cập nhật thông tin', description: 'Đã cập nhật ngân sách dự kiến', actor: deal.assignee, timestamp: new Date(new Date(deal.createdAt).getTime() + 43200000).toISOString() },
        { id: '3', action: 'status_change', title: 'Trạng thái', description: `Chuyển sang ${deal.stage}`, actor: deal.assignee, timestamp: deal.updatedAt },
    ];
    return history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const DealDetailDrawer: React.FC<DealDetailDrawerProps> = ({ deal, onClose, onUpdateStatus, onDelete }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [logs, setLogs] = useState<HistoryLog[]>([]);

    useEffect(() => {
        if (deal) {
            setLogs(generateMockHistory(deal));
            setActiveTab('info');
        }
    }, [deal]);

    if (!deal) return null;

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Deal này?")) {
            onDelete?.(deal.id);
            onClose();
        }
    };

    const handleStatusChange = (val: string) => {
        const newStatus = val as DealStage;
        onUpdateStatus?.(deal.id, newStatus);
        setLogs(prev => [{
            id: Date.now().toString(),
            action: 'status_change' as const,
            title: 'Cập nhật trạng thái',
            description: `Chuyển sang ${DEAL_STAGE_OPTIONS.find(o => o.value === newStatus)?.label}`,
            actor: 'Bạn',
            timestamp: new Date().toISOString()
        }, ...prev]);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                             <h2 className="text-lg font-bold text-slate-800">{deal.id}</h2>
                             {deal.stage === 'gd_hoan_tat' && <Badge variant="success">Hoàn Tất</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><History size={14}/> {new Date(deal.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
                </div>

                {/* Status Bar */}
                 <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                     <Select 
                        value={deal.stage} 
                        onChange={handleStatusChange} 
                        options={DEAL_STAGE_OPTIONS}
                        className="w-full h-9 text-xs"
                     />
                </div>

                {/* Tabs */}
                <div className="px-6 pt-2 border-b border-slate-100">
                    <Tabs 
                        activeTab={activeTab} 
                        onChange={setActiveTab} 
                        tabs={[
                            {id: 'info', label: 'Thông tin'},
                            {id: 'history', label: 'Lịch sử'}
                        ]}
                        className="w-full bg-transparent p-0" 
                    />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/30">
                    {activeTab === 'info' ? (
                        <>
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <User size={16} className="text-indigo-600"/> Thông Tin Khách Hàng
                                </h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Họ tên:</span>
                                        <span className="text-sm font-semibold text-slate-900">{deal.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">SĐT:</span>
                                        <span className="text-sm font-mono text-slate-900">{deal.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Mã KH:</span>
                                        <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">{deal.customerId}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <Briefcase size={16} className="text-indigo-600"/> Chi Tiết Nhu Cầu
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="text-xs text-slate-400 mb-1">Nhu cầu</div>
                                        <div className="font-semibold text-slate-700 capitalize">{deal.need}</div>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="text-xs text-slate-400 mb-1">Ngân sách</div>
                                        <div className="font-semibold text-emerald-600">{formatCurrencyTy(deal.budgetTy)}</div>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg col-span-2 shadow-sm">
                                        <div className="text-xs text-slate-400 mb-1">Loại BĐS & Khu vực</div>
                                        <div className="font-medium text-slate-800 flex items-center gap-2">
                                            <Badge variant="outline">{deal.propertyType}</Badge> 
                                            <ArrowRight size={12} className="text-slate-400"/>
                                            <span className="flex items-center gap-1 text-sm"><MapPin size={12}/> {deal.area}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-600"/> Thông Tin Hệ Thống
                                </h3>
                                <div className="text-sm space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-500">Nguồn:</span>
                                        <span className="font-medium capitalize">{deal.source}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-500">Phụ trách:</span>
                                        <span className="font-medium">{deal.assignee}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-500">Cập nhật cuối:</span>
                                        <span className="font-medium">{new Date(deal.updatedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <HistoryList logs={logs} />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
                    <Button variant="outline" className="flex-1 text-xs gap-2" onClick={() => toast("Tính năng Chỉnh sửa đang phát triển")}>
                        <Edit size={14}/> Chỉnh sửa
                    </Button>
                    <Button variant="destructive" className="flex-1 text-xs gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50" onClick={handleDelete}>
                        <Trash2 size={14}/> Xóa Deal
                    </Button>
                </div>
            </div>
        </div>
    );
};

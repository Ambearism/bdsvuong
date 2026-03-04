
import React, { useMemo, useState } from 'react';
import { LeaseScheduleItem, Lease } from '../../../types';
import { Badge, Button, Card, CardContent, TooltipWrapper, toast } from '../../ui';
import { formatCurrency, cn } from '../../../utils';
import {
    AlertCircle, CheckCircle2, Clock, MoreVertical,
    Plus, HelpCircle, History, Edit2, AlertTriangle, FileText
} from 'lucide-react';
import { CreatePaymentTermModal } from '../modals/CreatePaymentTermModal';

interface Props {
    lease: Lease;
    schedule: LeaseScheduleItem[];
    loading?: boolean;
}

export const LeaseScheduleTab: React.FC<Props> = ({ lease, schedule, loading }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const getStatusBadge = (status: LeaseScheduleItem['status'], dueDate: string) => {
        const isPastDue = new Date(dueDate) < new Date() && status !== 'paid';
        if (status === 'paid') return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1"><CheckCircle2 size={12} /> Đã thu đủ</Badge>;
        if (status === 'partial') return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 gap-1"><Clock size={12} /> Thu một phần</Badge>;
        if (isPastDue || status === 'overdue') return <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1 animate-pulse"><AlertCircle size={12} /> Quá hạn</Badge>;
        return <Badge variant="outline" className="text-slate-400 border-slate-200">Chưa đến hạn</Badge>;
    };

    if (loading) return <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <CreatePaymentTermModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl shadow-sm"><Clock size={20} /></div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Lịch thanh toán chi tiết</h3>
                        <p className="text-xs text-slate-500 font-medium">Theo dõi các kỳ hạn thu tiền theo hợp đồng</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="h-9 gap-2 shadow-md" onClick={() => setIsCreateModalOpen(true)}><Plus size={14} /> Thêm kỳ hạn</Button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5">Kỳ hạn</th>
                                <th className="px-6 py-5">Hạn thanh toán</th>
                                <th className="px-6 py-5 text-right">Phải thu</th>
                                <th className="px-6 py-5 text-right">Đã thu</th>
                                <th className="px-6 py-5 text-right">Còn nợ</th>
                                <th className="px-6 py-5">Trạng thái</th>
                                <th className="px-6 py-5 text-center sticky right-0 bg-white/80 backdrop-blur-md">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {schedule.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{item.periodLabel}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{new Date(item.dueDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(item.amountTy, 'cho_thue')}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{item.amountPaidTy > 0 ? formatCurrency(item.amountPaidTy, 'cho_thue') : '--'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {item.amountTy > item.amountPaidTy ? (
                                            <span className="font-bold text-rose-600">{formatCurrency(item.amountTy - item.amountPaidTy, 'cho_thue')}</span>
                                        ) : <span className="text-slate-300">--</span>}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status, item.dueDate)}</td>
                                    <td className="px-6 py-4 text-center sticky right-0 bg-white/80 backdrop-blur-md group-hover:bg-slate-50/80">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <FileText size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-bold">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400 text-right font-black">Tổng cộng hợp đồng:</td>
                                <td className="px-6 py-4 text-right text-base">{formatCurrency(schedule.reduce((acc, i) => acc + i.amountTy, 0), 'cho_thue')}</td>
                                <td className="px-6 py-4 text-right text-base text-emerald-400">{formatCurrency(schedule.reduce((acc, i) => acc + i.amountPaidTy, 0), 'cho_thue')}</td>
                                <td className="px-6 py-4 text-right text-base text-rose-400">{formatCurrency(schedule.reduce((acc, i) => acc + (i.amountTy - i.amountPaidTy), 0), 'cho_thue')}</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

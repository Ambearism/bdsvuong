
import React, { useState } from 'react';
import { CashflowEntry, Lease } from '../../../types';
import { Badge, Button, Card, CardContent, Input, toast, TooltipWrapper, Skeleton } from '../../ui';
import { formatCurrency, formatCurrencyTy, cn } from '../../../utils';
import {
    Search, Plus, FileText, Download, Filter,
    Calendar, User, ExternalLink, Paperclip, MoreVertical, XCircle, CheckCircle2
} from 'lucide-react';
import { CreateReceiptModal } from '../modals/CreateReceiptModal';

interface Props {
    lease: Lease;
    receipts: CashflowEntry[];
    loading?: boolean;
}

export const LeaseReceiptsTab: React.FC<Props> = ({ lease, receipts, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredReceipts = receipts.filter(r =>
        r.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-400">
            <CreateReceiptModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} lease={lease} />

            <div className="flex flex-col md:flex-row justify-between gap-4 px-1">
                <div className="flex flex-1 gap-3 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Số phiếu, nội dung thu tiền..."
                            className="pl-9 h-11 border-slate-200 focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="bg-white border-slate-200 h-11 px-4 font-bold text-slate-600">
                        <Calendar size={16} className="mr-2" /> Bộ lọc
                    </Button>
                </div>
                <Button className="h-11 px-8 shadow-lg shadow-indigo-100 font-black tracking-tight" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Tạo Phiếu Thu
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5">Phiếu thu / Ngày lập</th>
                                <th className="px-6 py-5 text-right">Số tiền thực thu</th>
                                <th className="px-6 py-5">Nguồn dòng tiền</th>
                                <th className="px-6 py-5">Phân bổ kỳ</th>
                                <th className="px-6 py-5">Chứng từ</th>
                                <th className="px-6 py-5">Nhân viên lập</th>
                                <th className="px-6 py-5 text-center sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {filteredReceipts.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic font-medium">Không tìm thấy phiếu thu nào phù hợp.</td></tr>
                            ) : filteredReceipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-slate-900">{receipt.refNo}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">{new Date(receipt.date).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-black text-emerald-600 text-lg">{formatCurrencyTy(receipt.amountTy)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {receipt.transactionId ? (
                                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold py-1 px-3">
                                                {receipt.transactionId}
                                            </Badge>
                                        ) : <span className="text-slate-300 italic font-medium">Tự tạo</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Mock logic since linkedSchedulePeriodLabels is not in CashflowEntry */}
                                        <span className="text-slate-400 text-xs">--</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {receipt.attachments.map((att) => (
                                                <div key={att.id}>
                                                    <TooltipWrapper content={`${att.fileName} (${att.sizeKb}KB)`}>
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm">
                                                            <Paperclip size={14} />
                                                        </div>
                                                    </TooltipWrapper>
                                                </div>
                                            ))}
                                            {receipt.attachments.length === 0 && <span className="text-slate-300 italic text-xs font-medium">Không đính kèm</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                {receipt.createdBy.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-800">{receipt.createdBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-indigo-600 hover:bg-indigo-50"><Download size={16} /></Button>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-rose-500 hover:bg-rose-50"><XCircle size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Informational Footer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 p-5 flex gap-4 items-start shadow-sm rounded-2xl">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={20} /></div>
                    <div className="text-xs">
                        <p className="font-black text-slate-900 mb-1 uppercase tracking-widest">Tự động hóa</p>
                        <p className="text-slate-500 font-medium leading-relaxed">Sử dụng tính năng OCR để nhận diện UNC và tạo phiếu thu nhanh từ hình ảnh (Sắp ra mắt).</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

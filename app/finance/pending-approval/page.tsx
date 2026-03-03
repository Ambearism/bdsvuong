
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast, TooltipWrapper } from '../../../components/ui';
import { CashflowEntry } from '../../../types';
import { getPendingCashflows, rejectCashflow } from '../../../data/financeFactory';
import { ApproveCashflowModal } from '../../../components/finance/modals/ApproveCashflowModal';
import { formatCurrencyTy, formatDateTimeVi } from '../../../utils';
import { CheckCircle2, XCircle, Search, Filter, User, AlertCircle, Paperclip } from 'lucide-react';

export default function PendingApprovalPage() {
    const [data, setData] = useState<CashflowEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [approveTarget, setApproveTarget] = useState<CashflowEntry | null>(null);
    
    // Mock Current User (In real app, get from Auth Context)
    const CURRENT_USER = 'Nguyễn Admin'; 

    const fetchData = async () => {
        setLoading(true);
        const res = await getPendingCashflows();
        setData(res);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReject = async (id: string) => {
        const reason = window.prompt("Nhập lý do từ chối:");
        if (reason) {
            await rejectCashflow(id, reason, CURRENT_USER);
            toast("Đã từ chối dòng tiền");
            fetchData();
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {approveTarget && (
                <ApproveCashflowModal 
                    entry={approveTarget} 
                    isOpen={!!approveTarget} 
                    onClose={() => setApproveTarget(null)} 
                    onSuccess={fetchData}
                    currentUser={CURRENT_USER}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        Duyệt Dòng Tiền <Badge variant="warning" className="text-lg px-3">{data.length}</Badge>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Hàng đợi các giao dịch cần kiểm tra và chuẩn hóa trước khi ghi nhận chính thức.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-white"><Filter size={16} className="mr-2"/> Bộ lọc</Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Ngày nhận / Ref</th>
                                <th className="px-6 py-4 text-right">Số tiền</th>
                                <th className="px-6 py-4">Người nộp</th>
                                <th className="px-6 py-4">Phân loại sơ bộ</th>
                                <th className="px-6 py-4">Người nhập liệu</th>
                                <th className="px-6 py-4">Chứng từ & Ghi chú</th>
                                <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8"><Skeleton className="h-10 w-full"/></td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={7} className="p-16 text-center text-slate-400 italic">Không có giao dịch chờ duyệt.</td></tr>
                            ) : data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{formatDateTimeVi(item.date).split(' ')[0]}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.refNo}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                                        {formatCurrencyTy(item.amountTy)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {item.payer}
                                        <div className="text-[10px] text-slate-400 uppercase">{item.method}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline">{item.type}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400"/>
                                            <span className={item.createdBy === CURRENT_USER ? "text-rose-600 font-bold" : "text-slate-700"}>
                                                {item.createdBy}
                                            </span>
                                        </div>
                                        {item.isEnteredOnBehalf && <div className="text-[10px] text-amber-600 font-bold mt-1 ml-6">Nhập hộ</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {item.attachments.length > 0 && (
                                                <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold">
                                                    <Paperclip size={12}/> {item.attachments.length} đính kèm
                                                </div>
                                            )}
                                            <span className="text-xs text-slate-500 italic truncate max-w-[200px]">{item.note}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-center gap-2">
                                            <TooltipWrapper content={item.createdBy === CURRENT_USER ? "Bạn không thể tự duyệt" : "Duyệt & Chuẩn hóa"}>
                                                <Button 
                                                    size="sm" 
                                                    className={item.createdBy === CURRENT_USER ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"}
                                                    onClick={() => setApproveTarget(item)}
                                                    disabled={item.createdBy === CURRENT_USER}
                                                >
                                                    <CheckCircle2 size={16} className="mr-1"/> Duyệt
                                                </Button>
                                            </TooltipWrapper>
                                            <Button 
                                                size="sm" variant="ghost" 
                                                className="text-rose-500 hover:bg-rose-50"
                                                onClick={() => handleReject(item.id)}
                                            >
                                                <XCircle size={16}/>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

import React, { useState, useMemo } from 'react';
import { CashflowEntry, LeaseAllocation, LeaseScheduleItem, Lease } from '../../../types';
import { Badge, Button, Card, CardContent, Input, toast, TooltipWrapper } from '../../ui';
import { formatCurrency, formatCurrencyTy, cn } from '../../../utils';
import {
    ArrowRight, CheckCircle2, Clock, Landmark,
    Plus, RotateCcw, Save, Zap, AlertCircle, Info, History
} from 'lucide-react';

interface Props {
    lease: Lease;
    transactions: CashflowEntry[];
    schedule: LeaseScheduleItem[];
    allocations: LeaseAllocation[];
}

export const LeaseTransactionsTab: React.FC<Props> = ({ lease, transactions, schedule, allocations }) => {
    const [selectedTxId, setSelectedTxId] = useState<string | null>(transactions[0]?.id || null);
    const [manualAllocations, setManualAllocations] = useState<Record<string, number>>({});

    const selectedTx = transactions.find(t => t.id === selectedTxId);
    const outstandingPeriods = useMemo(() => schedule.filter(s => s.amountTy > s.amountPaidTy), [schedule]);

    const currentTotalAllocating = (Object.values(manualAllocations) as number[]).reduce((a: number, b: number) => a + b, 0);
    const txRemainingAmount = selectedTx ? (selectedTx.amountTy - selectedTx.allocatedAmountTy) : 0;
    const uiBalance = txRemainingAmount - currentTotalAllocating;

    return (
        <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-400">
            {/* LEFT: List */}
            <div className="w-full xl:w-[400px] space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Phiếu thu dòng tiền</h3>
                    <Button size="sm" variant="outline" className="bg-white border-slate-200 text-indigo-600 h-8"><Plus size={14} /></Button>
                </div>

                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            onClick={() => { setSelectedTxId(tx.id); setManualAllocations({}); }}
                            className={cn(
                                "cursor-pointer transition-all p-4 rounded-2xl border-2",
                                selectedTxId === tx.id
                                    ? "bg-white border-indigo-600 shadow-lg ring-4 ring-indigo-50"
                                    : "bg-white border-slate-100 hover:border-slate-200"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-black text-slate-900">{tx.refNo}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{tx.date.split('T')[0]} • {tx.method}</div>
                                </div>
                                <Badge className={cn(
                                    "text-[9px] uppercase",
                                    tx.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                )}>
                                    {tx.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-end pt-3 border-t border-slate-50">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số tiền nhận</div>
                                    <div className="text-lg font-black text-slate-800">{formatCurrencyTy(tx.amountTy)}</div>
                                </div>
                                {tx.amountTy > tx.allocatedAmountTy && (
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-rose-400 uppercase">Khả dụng</div>
                                        <div className="text-sm font-black text-rose-600">{formatCurrencyTy(tx.amountTy - tx.allocatedAmountTy)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Editor */}
            <div className="flex-1 space-y-6">
                {selectedTx ? (
                    <>
                        <Card className="border-indigo-200 bg-white shadow-md overflow-hidden ring-1 ring-indigo-50">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 border-b border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Đang xử lý phân bổ</p>
                                    <h4 className="text-xl font-black text-slate-900">{selectedTx.refNo} <span className="text-slate-400 font-medium ml-2 text-sm">/ {formatCurrencyTy(selectedTx.amountTy)}</span></h4>
                                </div>
                                <div className="flex gap-8 items-center bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Khớp tổng</div>
                                        <div className="text-sm font-black text-indigo-600">{formatCurrencyTy(selectedTx.allocatedAmountTy + currentTotalAllocating)}</div>
                                    </div>
                                    <div className="w-px h-6 bg-slate-100" />
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dư khả dụng</div>
                                        <div className={cn("text-sm font-black", uiBalance < 0 ? "text-rose-600" : "text-emerald-600")}>{formatCurrencyTy(uiBalance)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                                        <tr>
                                            <th className="px-6 py-4">Kỳ hạn thu</th>
                                            <th className="px-6 py-4 text-right">Phải thu</th>
                                            <th className="px-6 py-4 text-right">Còn nợ</th>
                                            <th className="px-6 py-4 text-center w-[200px]">Số tiền khớp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {outstandingPeriods.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">Hợp đồng hiện không có nợ quá hạn.</td></tr>
                                        ) : outstandingPeriods.map((period) => (
                                            <tr key={period.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-900">{period.periodLabel}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 mt-1">Hạn: {new Date(period.dueDate).toLocaleDateString('vi-VN')}</div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-medium text-slate-600">{formatCurrencyTy(period.amountTy)}</td>
                                                <td className="px-6 py-5 text-right font-black text-rose-600">{formatCurrencyTy(period.amountTy - period.amountPaidTy)}</td>
                                                <td className="px-6 py-5">
                                                    <div className="relative group">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-right pr-10 font-black text-indigo-700 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                                                            placeholder="0.00"
                                                            value={manualAllocations[period.id] || ''}
                                                            onChange={(e) => setManualAllocations({ ...manualAllocations, [period.id]: parseFloat(e.target.value) || 0 })}
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Tỷ</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <button onClick={() => setManualAllocations({})} className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest">Reset nhập liệu</button>
                                <Button className="h-11 px-8 shadow-lg shadow-indigo-100" disabled={currentTotalAllocating <= 0 || uiBalance < -0.000001} onClick={() => toast("Phân bổ thành công!")}>
                                    <Save size={16} className="mr-2" /> Xác nhận & Lưu khớp tiền
                                </Button>
                            </div>
                        </Card>
                    </>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-300">
                        <History size={64} className="mb-4 opacity-10" />
                        <p className="font-bold text-slate-400 uppercase tracking-widest">Chọn phiếu thu để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};
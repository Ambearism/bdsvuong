

import React, { useState } from 'react';
import { Button, Input, Badge, toast } from '../../ui';
import { LeaseScheduleItem, CashflowEntry } from '../../../types';
import { formatCurrency, formatCurrencyTy, cn } from '../../../utils';
import { X, ArrowDown, Check } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cashflow: CashflowEntry;
    scheduleItems: LeaseScheduleItem[];
    onAllocate: (allocations: Record<string, number>) => void;
}

export const AllocationDrawer: React.FC<Props> = ({ isOpen, onClose, cashflow, scheduleItems, onAllocate }) => {
    const [allocations, setAllocations] = useState<Record<string, number>>({});

    if (!isOpen) return null;

    const totalAllocated = (Object.values(allocations) as number[]).reduce((a, b) => a + b, 0);
    const remaining = cashflow.amountTy - totalAllocated;

    const handleSave = () => {
        if (remaining < 0) return toast("Số tiền phân bổ vượt quá dòng tiền!", "error");
        onAllocate(allocations);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Phân Bổ Dòng Tiền</h2>
                        <div className="text-xs text-slate-500 mt-1">Ref: {cashflow.refNo} • {formatCurrencyTy(cashflow.amountTy)}</div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Đã phân bổ</div>
                        <div className="text-lg font-black text-indigo-700">{formatCurrencyTy(totalAllocated)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Còn lại (Credit)</div>
                        <div className={cn("text-lg font-black", remaining < 0 ? "text-rose-600" : "text-emerald-600")}>
                            {formatCurrencyTy(remaining)}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Các kỳ cần thanh toán</span>
                    </div>

                    {scheduleItems.map(item => {
                        const due = item.amountTy - item.amountPaidTy;
                        if (due <= 0 && !allocations[item.id]) return null; // Hide paid items unless allocating adjustment

                        return (
                            <div key={item.id} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-700">{item.periodLabel.split(':')[0]}</span>
                                    <span className="text-xs font-medium text-rose-600">Còn nợ: {formatCurrencyTy(due)}</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.001"
                                        className="pr-12 font-bold text-right"
                                        value={allocations[item.id] || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllocations({ ...allocations, [item.id]: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Tỷ</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <Button className="w-full shadow-lg shadow-indigo-100 gap-2" onClick={handleSave} disabled={remaining < 0}>
                        <Check size={18} /> Xác nhận Phân Bổ
                    </Button>
                </div>
            </div>
        </div>
    );
};
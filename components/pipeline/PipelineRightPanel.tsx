
import React from 'react';
import { PipelineCard } from '../../types';
import { X, User, Phone, MapPin, Wallet, StickyNote, Calendar, Plus, ExternalLink, Briefcase } from 'lucide-react';
import { Button, Badge, toast } from '../ui';
import { formatCurrencyTy } from '../../utils';

interface Props {
    card: PipelineCard | null;
    onClose: () => void;
}

export const PipelineRightPanel: React.FC<Props> = ({ card, onClose }) => {
    if (!card) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300 border-l border-slate-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{card.customerName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="indigo" className="text-[10px] h-5">{card.stage.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{card.propertyType}</Badge>
                        <Badge variant={card.need === 'mua' ? 'indigo' : 'success'}>{card.need === 'mua' ? 'Mua' : 'Thuê'}</Badge>
                        <Badge variant="neutral">{card.source}</Badge>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User size={14} className="text-indigo-600" /> Thông Tin Chính
                        </h3>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> SĐT:</span>
                                <span className="font-mono font-medium text-slate-900">{card.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><Wallet size={14} /> Ngân sách:</span>
                                <span className="font-medium text-emerald-600">{card.budgetRangeText}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><MapPin size={14} /> Khu vực:</span>
                                <span className="font-medium text-slate-700">{card.areaText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <StickyNote size={14} className="text-amber-500" /> Ghi Chú
                            </h3>
                            <button className="text-[10px] text-indigo-600 font-semibold hover:underline">Thêm ghi chú</button>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                            {card.notes.length > 0 ? card.notes.map((note, idx) => (
                                <div key={idx} className="flex gap-2 text-sm text-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    {note}
                                </div>
                            )) : <div className="text-slate-400 text-xs italic">Chưa có ghi chú</div>}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <Calendar size={14} className="text-indigo-600" /> Nhắc Việc
                            </h3>
                            <button className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"><Plus size={10} /> Thêm việc</button>
                        </div>
                        <div className="space-y-3">
                            {card.tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-indigo-600"><Briefcase size={16} /></div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-800">{task.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{task.assigneeName} • {new Date(task.dueAt).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>
                            ))}
                            {card.tasks.length === 0 && <div className="text-slate-400 text-xs italic">Chưa có công việc nào</div>}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2 text-[11px] font-bold h-10 border-slate-200 bg-white" onClick={() => toast("Chuyển sang Hub Khách Hàng")}>
                        <ExternalLink size={14} /> Hub Khách Hàng
                    </Button>
                    <Button variant="outline" className="gap-2 text-[11px] font-bold h-10 border-slate-200 bg-white" onClick={() => toast("Chuyển sang màn Nhắc Việc")}>
                        <Calendar size={14} /> Xem Nhắc Việc
                    </Button>
                    <Button variant="indigo" className="gap-2 text-[11px] font-bold h-10 shadow-sm" onClick={() => toast("Mở chi tiết Lead")}>
                        <User size={14} /> Chi tiết Lead
                    </Button>
                    {card.hasDeal && (
                        <Button variant="primary" className="gap-2 text-[11px] font-bold h-10 shadow-sm" onClick={() => toast("Mở chi tiết Deal")}>
                            <Briefcase size={14} /> Chi tiết Deal
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Badge, Button, Tabs } from '../../ui';
import { formatCurrency, formatDateTimeVi } from '../../../utils';
import { FileText, CheckCircle2, User, Tag, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  periodData: any; // Complex object containing revenue list, cost list
}

export const PerformancePeriodDetailModal: React.FC<Props> = ({ isOpen, onClose, periodData }) => {
  const [activeTab, setActiveTab] = useState('revenue');

  if (!periodData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết hiệu quả: ${periodData.period}`} size="xl">
        <div className="flex flex-col h-[70vh]">
            <div className="px-6 pt-2 pb-4 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Doanh thu</div>
                        <div className="text-lg font-black text-emerald-600">{formatCurrency(periodData.revenue, 'cho_thue')}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Chi phí</div>
                        <div className="text-lg font-black text-rose-600">{formatCurrency(periodData.cost, 'cho_thue')}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Thuế</div>
                        <div className="text-lg font-black text-slate-600">{formatCurrency(periodData.tax, 'cho_thue')}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
                        <div className="text-[10px] text-indigo-400 font-bold uppercase">Lợi nhuận ròng</div>
                        <div className="text-lg font-black text-indigo-700">{formatCurrency(periodData.net, 'cho_thue')}</div>
                    </div>
                </div>

                <Tabs 
                    activeTab={activeTab} 
                    onChange={setActiveTab}
                    tabs={[
                        { id: 'revenue', label: `Doanh thu (${periodData.revenueList.length})` },
                        { id: 'cost', label: `Chi phí (${periodData.costList.length})` },
                        { id: 'tax', label: 'Tính toán Thuế' }
                    ]}
                    className="w-full bg-slate-200/50"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                {activeTab === 'revenue' && (
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Ngày nhận</th>
                                <th className="px-4 py-3">Mã GD</th>
                                <th className="px-4 py-3">Loại</th>
                                <th className="px-4 py-3 text-right">Số tiền</th>
                                <th className="px-4 py-3">Người nộp</th>
                                <th className="px-4 py-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {periodData.revenueList.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{formatDateTimeVi(item.date).split(' ')[0]}</td>
                                    <td className="px-4 py-3 font-medium text-indigo-600">{item.refNo}</td>
                                    <td className="px-4 py-3"><Badge variant="outline">{item.type}</Badge></td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(item.amount, 'cho_thue')}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.payer}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="success" className="gap-1"><CheckCircle2 size={10}/> Approved</Badge>
                                    </td>
                                </tr>
                            ))}
                            {periodData.revenueList.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Không có doanh thu trong kỳ này</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'cost' && (
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Ngày chi</th>
                                <th className="px-4 py-3">Hạng mục</th>
                                <th className="px-4 py-3 text-right">Số tiền</th>
                                <th className="px-4 py-3">Chứng từ</th>
                                <th className="px-4 py-3">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {periodData.costList.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{formatDateTimeVi(item.date).split(' ')[0]}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{item.category}</td>
                                    <td className="px-4 py-3 text-right font-bold text-rose-600">{formatCurrency(item.amount, 'cho_thue')}</td>
                                    <td className="px-4 py-3">
                                        {item.hasDoc ? <Badge variant="indigo">Có File</Badge> : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 italic max-w-[200px] truncate">{item.note}</td>
                                </tr>
                            ))}
                            {periodData.costList.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Không có chi phí trong kỳ này</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'tax' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">Cấu hình thuế đang áp dụng:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Phương pháp: <b>Cash Basis</b> (Tính trên thực thu)</li>
                                    <li>Thuế suất: <b>10%</b> (5% GTGT + 5% TNCN)</li>
                                    <li>Giảm trừ gia cảnh: <b>Không áp dụng</b> cho cá nhân kinh doanh BĐS</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-600">Tổng doanh thu chịu thuế</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(periodData.revenue, 'cho_thue')}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium text-slate-600">Hệ số thuế</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-900">x 10%</td>
                                    </tr>
                                    <tr className="bg-indigo-50">
                                        <td className="px-4 py-3 font-bold text-indigo-900">Thuế phải nộp (Tạm tính)</td>
                                        <td className="px-4 py-3 text-right font-black text-indigo-700">{formatCurrency(periodData.tax, 'cho_thue')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </div>
    </Modal>
  );
};

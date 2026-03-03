import React, { useMemo } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Card, CardContent } from '../../ui';
import { CareCase } from '../../../types';
import { formatCurrencyTy } from '../../../utils';
import {
    Download, PieChart, TrendingUp, TrendingDown,
    Calculator, Building2
} from 'lucide-react';
import { MOCK_LEASES } from '../../../data/mockLeases';

interface Props {
    careCase: CareCase;
    isOpen: boolean;
    onClose: () => void;
}

export const SummaryReportModal: React.FC<Props> = ({ careCase, isOpen, onClose }) => {
    // Re-using logic from CareFinancialTab
    const financialData = useMemo(() => {
        const ownerLeases = MOCK_LEASES.filter(l => l.ownerId === careCase.ownerId);

        const revenueTotal = ownerLeases.reduce((sum, l) => sum + (l.rentAmountTy * 12), 0);
        const revenueTaxable = revenueTotal;

        const costOperating = revenueTotal * 0.05;
        const costBrokerage = revenueTotal * 0.08;
        const costOther = 0.005;

        const totalCost = costOperating + costBrokerage + costOther;

        const taxThreshold = 0.1;
        const taxRate = 0.1;
        const taxPayable = revenueTaxable > taxThreshold ? revenueTaxable * taxRate : 0;

        const careFeeAmount = careCase.careFeeMillion / 1000 || (revenueTotal * 0.05);

        const netIncome = revenueTotal - totalCost - taxPayable - careFeeAmount;

        return {
            ownerLeases,
            revenueTotal,
            totalCost,
            taxPayable,
            careFeeAmount,
            netIncome
        };
    }, [careCase]);

    const handleDownloadPdf = () => {
        // Mock download PDF
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Báo Cáo Tổng Hợp: ${careCase.ownerName}`} size="xl">
            <div className="p-6 space-y-6 print:p-0 print:space-y-4">
                {/* Header Info */}
                <div className="flex justify-between items-start print:hidden">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{careCase.ownerName}</h2>
                        <p className="text-sm text-slate-500">{careCase.ownerPhone}</p>
                    </div>
                    <Button onClick={handleDownloadPdf} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
                        <Download size={16} /> Download PDF
                    </Button>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-1"><TrendingUp size={12} /> Tổng Doanh Thu</div>
                            <div className="text-xl font-black text-emerald-700">{formatCurrencyTy(financialData.revenueTotal)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-rose-50 border-rose-100 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5 mb-1"><TrendingDown size={12} /> Tổng Chi Phí</div>
                            <div className="text-xl font-black text-rose-700">-{formatCurrencyTy(financialData.totalCost)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 shadow-sm">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Calculator size={12} /> Thuế Tạm Tính</div>
                            <div className="text-xl font-black text-amber-700">-{formatCurrencyTy(financialData.taxPayable)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-600 text-white border-none shadow-sm shadow-indigo-200">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1.5 mb-1"><PieChart size={12} /> Lợi Nhuận Ròng</div>
                            <div className="text-2xl font-black text-white">{formatCurrencyTy(financialData.netIncome)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Details */}
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 flex items-center gap-2">
                            <Building2 size={16} className="text-indigo-600" /> Bảng chi tiết doanh thu
                        </div>
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                                    <tr>
                                        <th className="px-4 py-2 border-b border-slate-100">Mã HĐ</th>
                                        <th className="px-4 py-2 border-b border-slate-100 text-right">Doanh thu (Năm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialData.ownerLeases.map(l => (
                                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{l.code}</td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrencyTy(l.rentAmountTy * 12)}</td>
                                        </tr>
                                    ))}
                                    {financialData.ownerLeases.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">Không có hợp đồng nào</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Cost Details */}
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 flex items-center gap-2">
                            <TrendingDown size={16} className="text-rose-600" /> Bảng chi tiết chi phí
                        </div>
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                                    <tr>
                                        <th className="px-4 py-2 border-b border-slate-100">Hạng mục chi phí</th>
                                        <th className="px-4 py-2 border-b border-slate-100 text-right">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-700">Chi phí vận hành & bảo trì</td>
                                        <td className="px-4 py-3 text-right font-black text-rose-500">-{formatCurrencyTy(financialData.totalCost - 0.005 - (financialData.revenueTotal * 0.08))}</td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-700">Chi phí môi giới</td>
                                        <td className="px-4 py-3 text-right font-black text-rose-500">-{formatCurrencyTy(financialData.revenueTotal * 0.08)}</td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-700">Phí quản lý Asset Care</td>
                                        <td className="px-4 py-3 text-right font-black text-rose-500">-{formatCurrencyTy(financialData.careFeeAmount)}</td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-700">Chi phí khác</td>
                                        <td className="px-4 py-3 text-right font-black text-rose-500">-{formatCurrencyTy(0.005)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

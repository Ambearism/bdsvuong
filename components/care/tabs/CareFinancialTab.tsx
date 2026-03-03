
import React, { useMemo } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast, TooltipWrapper } from '../../ui';
import { CareCase } from '../../../types';
import { formatCurrency, formatCurrencyTy } from '../../../utils';
import {
    Download, TrendingUp, TrendingDown, DollarSign,
    Calculator, Landmark, Wallet, AlertCircle, PieChart
} from 'lucide-react';
import { MOCK_LEASES } from '../../../data/mockLeases';

interface Props {
    careCase: CareCase;
}

export const CareFinancialTab: React.FC<Props> = ({ careCase }) => {

    // -- Dữ liệu đồng bộ dựa trên Hợp đồng thuê của Chủ nhà --
    const financialData = useMemo(() => {
        const ownerLeases = MOCK_LEASES.filter(l => l.ownerId === careCase.ownerId);

        const revenueTotal = ownerLeases.reduce((sum, l) => sum + (l.rentAmountTy * 12), 0);
        const revenueTaxable = revenueTotal;

        // Mock chi phí từ Cost Entries (thường sẽ lấy từ DB thực tế)
        const costOperating = revenueTotal * 0.05;
        const costBrokerage = revenueTotal * 0.08;
        const costOther = 0.005;

        const totalCost = costOperating + costBrokerage + costOther;

        const taxThreshold = 0.1; // 100tr/năm
        const taxRate = 0.1; // 10% tổng hợp
        const taxPayable = revenueTaxable > taxThreshold ? revenueTaxable * taxRate : 0;

        // Phí dịch vụ Care (CRM Revenue)
        const careFeeRate = 0.05;
        const careFeeAmount = revenueTotal * careFeeRate;

        const netIncome = revenueTotal - totalCost - taxPayable - careFeeAmount;

        return {
            revenueTotal,
            revenueTaxable,
            costOperating,
            costBrokerage,
            costOther,
            totalCost,
            taxThreshold,
            taxPayable,
            careFeeRate,
            careFeeAmount,
            netIncome,
            leaseCount: ownerLeases.length
        };
    }, [careCase.ownerId]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-600 text-white border-none shadow-lg">
                    <CardContent className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Doanh thu dự kiến (Năm)</p>
                        <div className="text-3xl font-black">{formatCurrencyTy(financialData.revenueTotal)}</div>
                        <p className="text-[10px] font-bold mt-2 opacity-60">Dựa trên {financialData.leaseCount} hợp đồng</p>
                    </CardContent>
                </Card>

                <Card className="bg-rose-600 text-white border-none shadow-lg">
                    <CardContent className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Tổng chi phí vận hành</p>
                        <div className="text-3xl font-black">{formatCurrencyTy(financialData.totalCost)}</div>
                        <p className="text-[10px] font-bold mt-2 opacity-60">Bảo trì, sửa chữa, môi giới...</p>
                    </CardContent>
                </Card>

                <Card className="bg-white text-slate-800 border-none shadow-sm ring-1 ring-slate-200">
                    <CardContent className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thu nhập thực nhận (Net)</p>
                        <div className="text-3xl font-black text-emerald-500">{formatCurrencyTy(financialData.netIncome)}</div>
                        <p className="text-[10px] font-bold mt-2 text-slate-400">Lợi nhuận ròng của Chủ nhà</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 max-w-4xl">
                <Card className="border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Chi tiết dòng tiền năm {new Date().getFullYear()}</h3>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] bg-white border-slate-200">XUẤT CHI TIẾT</Button>
                    </div>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-700">Tổng doanh thu thực nhận (Cash basis)</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrencyTy(financialData.revenueTotal)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 italic pl-10">- Chi phí môi giới tìm khách</td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-500">-{formatCurrencyTy(financialData.costBrokerage)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 italic pl-10">- Chi phí bảo trì & sửa chữa</td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-500">-{formatCurrencyTy(financialData.costOperating)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 italic pl-10">- Phí quản lý Asset Care (CRM)</td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-500">-{formatCurrencyTy(financialData.careFeeAmount)}</td>
                                </tr>
                                <tr className="bg-indigo-50/30">
                                    <td className="px-6 py-4 font-black text-indigo-900">DOANH THU TRƯỚC THUẾ</td>
                                    <td className="px-6 py-4 text-right font-black text-indigo-700">{formatCurrencyTy(financialData.revenueTotal - financialData.totalCost - financialData.careFeeAmount)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-700">Thuế TNCN & GTGT (Tạm tính)</td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-500">-{formatCurrencyTy(financialData.taxPayable)}</td>
                                </tr>
                                <tr className="bg-slate-900 text-white">
                                    <td className="px-6 py-5 font-black uppercase tracking-widest">LỢI NHUẬN RÒNG (NET PROFIT)</td>
                                    <td className="px-6 py-5 text-right font-black text-emerald-400 text-lg">{formatCurrencyTy(financialData.netIncome)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

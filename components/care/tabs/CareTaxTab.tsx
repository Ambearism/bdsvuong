
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Button, Tabs, Badge, Skeleton, Input, Select, toast, Switch } from '../../ui';
import { CareCase, TaxPayment } from '../../../types';
import { formatNumber, cn } from '../../../utils';
import { 
    Info, AlertTriangle, CheckCircle2, TrendingUp, 
    FileText, Calendar, DollarSign, Upload, Plus,
    Settings, Filter, Download, ChevronRight, Calculator,
    PieChart, ArrowRight, History
} from 'lucide-react';

interface Props {
  careCase: CareCase;
}

// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
    { id: 't1', date: '2023-01-15', category: 'Tiền thuê nhà', amount: 15000000, type: 'revenue', isTaxable: true },
    { id: 't2', date: '2023-02-15', category: 'Tiền thuê nhà', amount: 15000000, type: 'revenue', isTaxable: true },
    { id: 't3', date: '2023-03-15', category: 'Tiền thuê nhà', amount: 15000000, type: 'revenue', isTaxable: true },
    { id: 'e1', date: '2023-01-20', category: 'Sửa chữa điện', amount: 2000000, type: 'expense', isTaxDeductible: true },
    { id: 'e2', date: '2023-02-20', category: 'Phí quản lý', amount: 500000, type: 'expense', isTaxDeductible: false },
];

const MOCK_PAYMENTS_HISTORY: TaxPayment[] = [
    { id: 'pay1', taxCaseId: 'tx1', year: 2023, period: 'Q1', amountTy: 0.002, paymentDate: '2023-04-20', status: 'verified', notes: 'Nộp qua eTax' }
];

const formatVND = (value: number) => {
    return `${formatNumber(value)} đ`;
};

export const CareTaxTab: React.FC<Props> = ({ careCase }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [taxMethod, setTaxMethod] = useState<'revenue' | 'net_income'>('revenue'); // revenue | net_income
  const [taxRate, setTaxRate] = useState(10); // %
  
  // Filter State
  const [periodFilter, setPeriodFilter] = useState('all'); // all, q1, q2, q3, q4
  const [dateRange, setDateRange] = useState({ from: '2023-01-01', to: '2023-12-31' });

  // Payment State
  const [payments, setPayments] = useState<TaxPayment[]>(MOCK_PAYMENTS_HISTORY);

  // --- CALCULATIONS ---
  const filteredTransactions = useMemo(() => {
      // Filter by date range (mock logic)
      return MOCK_TRANSACTIONS; 
  }, [dateRange]);

  const financials = useMemo(() => {
      const totalRevenue = filteredTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const taxableExpense = filteredTransactions.filter(t => t.type === 'expense' && t.isTaxDeductible).reduce((sum, t) => sum + t.amount, 0);
      
      let taxBase = 0;
      if (taxMethod === 'revenue') {
          taxBase = totalRevenue;
      } else {
          taxBase = Math.max(0, totalRevenue - taxableExpense);
      }

      const taxLiability = taxBase * (taxRate / 100);
      const netProfit = totalRevenue - totalExpense - taxLiability;

      return {
          totalRevenue,
          totalExpense,
          taxableExpense,
          taxBase,
          taxLiability,
          netProfit
      };
  }, [filteredTransactions, taxMethod, taxRate]);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amountTy * 1000000000), 0);
  const taxRemaining = Math.max(0, financials.taxLiability - totalPaid);

  const handleQuickFilter = (q: string) => {
      setPeriodFilter(q);
      // Mock date update
      if (q === 'q1') setDateRange({ from: '2023-01-01', to: '2023-03-31' });
      if (q === 'q2') setDateRange({ from: '2023-04-01', to: '2023-06-30' });
      if (q === 'q3') setDateRange({ from: '2023-07-01', to: '2023-09-30' });
      if (q === 'q4') setDateRange({ from: '2023-10-01', to: '2023-12-31' });
      if (q === 'all') setDateRange({ from: '2023-01-01', to: '2023-12-31' });
      toast(`Đã lọc dữ liệu theo ${q.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* --- 1. OVERVIEW CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng Doanh Thu</div>
                    <div className="text-2xl font-black text-slate-800">{formatVND(financials.totalRevenue)}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><TrendingUp size={12}/> +12% so với kỳ trước</div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chi Phí (Chịu thuế / Tổng)</div>
                    <div className="text-2xl font-black text-rose-600">{formatVND(financials.taxableExpense)}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">trên tổng {formatVND(financials.totalExpense)}</div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-5"><Calculator size={64}/></div>
                <CardContent className="p-5 relative z-10">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thuế Phải Nộp (Tạm tính)</div>
                    <div className="text-2xl font-black text-indigo-600">{formatVND(financials.taxLiability)}</div>
                    <div className="text-xs text-indigo-400 font-bold mt-1">Đã nộp: {formatVND(totalPaid)}</div>
                </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                <CardContent className="p-5">
                    <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Lợi Nhuận Ròng</div>
                    <div className="text-2xl font-black text-emerald-700">{formatVND(financials.netProfit)}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">ROI ước tính: 8.5%</div>
                </CardContent>
            </Card>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <Tabs 
            activeTab={activeSubTab}
            onChange={setActiveSubTab}
            tabs={[
                { id: 'overview', label: 'Tổng hợp & Cấu hình' },
                { id: 'history', label: 'Lịch sử nộp thuế' },
            ]}
            className="w-full bg-slate-100 p-1"
        />

        {/* --- TAB CONTENT: OVERVIEW & SETTINGS --- */}
        {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <Settings size={16} className="text-slate-500"/>
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">1. Thiết lập Thuế</h3>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700">Phương pháp tính thuế</label>
                                <div className="space-y-2">
                                    <div 
                                        onClick={() => setTaxMethod('revenue')}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                                            taxMethod === 'revenue' ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "bg-white border-slate-200 hover:border-indigo-200"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", taxMethod === 'revenue' ? "border-indigo-600" : "border-slate-300")}>
                                            {taxMethod === 'revenue' && <div className="w-2 h-2 rounded-full bg-indigo-600"/>}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">Theo Tổng Doanh Thu</div>
                                            <div className="text-[10px] text-slate-500">Thuế = Doanh thu * Hệ số</div>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setTaxMethod('net_income')}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                                            taxMethod === 'net_income' ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "bg-white border-slate-200 hover:border-indigo-200"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", taxMethod === 'net_income' ? "border-indigo-600" : "border-slate-300")}>
                                            {taxMethod === 'net_income' && <div className="w-2 h-2 rounded-full bg-indigo-600"/>}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">Theo Lợi Nhuận (DT - CP)</div>
                                            <div className="text-[10px] text-slate-500">Thuế = (DT - CP Chịu thuế) * Hệ số</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Hệ số tính thuế (%)</label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={taxRate} 
                                        onChange={(e: any) => setTaxRate(Number(e.target.value))}
                                        className="font-bold pl-10"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Ví dụ: 10% (5% GTGT + 5% TNCN)</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-xs font-bold uppercase tracking-wider">Lưu cấu hình</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Summary Table */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <PieChart size={16} className="text-slate-500"/>
                                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">2. Tổng hợp doanh thu theo kỳ</h3>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                {['q1', 'q2', 'q3', 'q4', 'all'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleQuickFilter(q)}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-black uppercase rounded transition-all",
                                            periodFilter === q ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {q === 'all' ? 'Tất cả' : q.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex gap-4">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Calendar size={14} className="text-slate-400"/>
                                <span className="font-bold">Từ:</span> {new Date(dateRange.from).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Calendar size={14} className="text-slate-400"/>
                                <span className="font-bold">Đến:</span> {new Date(dateRange.to).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Danh mục</th>
                                        <th className="px-6 py-4 text-right">Doanh thu</th>
                                        <th className="px-6 py-4 text-right">Chi phí (Chịu thuế)</th>
                                        <th className="px-6 py-4 text-right">Cơ sở tính thuế</th>
                                        <th className="px-6 py-4 text-right text-indigo-600">Thuế ({taxRate}%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-bold text-slate-800">Tiền thuê nhà</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatVND(45000000)}</td>
                                        <td className="px-6 py-4 text-right text-slate-400">-</td>
                                        <td className="px-6 py-4 text-right font-bold">{formatVND(45000000)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatVND(4500000)}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-bold text-slate-800">Phí dịch vụ</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatVND(5000000)}</td>
                                        <td className="px-6 py-4 text-right text-rose-500">{formatVND(2000000)}</td>
                                        <td className="px-6 py-4 text-right font-bold">{formatVND(3000000)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatVND(300000)}</td>
                                    </tr>
                                    <tr className="bg-slate-50 font-black text-slate-800">
                                        <td className="px-6 py-4 uppercase text-xs">Tổng cộng</td>
                                        <td className="px-6 py-4 text-right">{formatVND(financials.totalRevenue)}</td>
                                        <td className="px-6 py-4 text-right text-rose-600">{formatVND(financials.taxableExpense)}</td>
                                        <td className="px-6 py-4 text-right">{formatVND(financials.taxBase)}</td>
                                        <td className="px-6 py-4 text-right text-indigo-600">{formatVND(financials.taxLiability)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <FileText size={16} className="text-slate-500"/>
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">3. Chi tiết doanh thu</h3>
                        </div>
                        <CardContent className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3">Ngày</th>
                                        <th className="px-6 py-3">Nội dung</th>
                                        <th className="px-6 py-3 text-right">Số tiền</th>
                                        <th className="px-6 py-3 text-center">Loại</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {MOCK_TRANSACTIONS.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-3 text-slate-500 text-xs font-mono">{t.date}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{t.category}</td>
                                            <td className={cn("px-6 py-3 text-right font-bold", t.type === 'revenue' ? "text-emerald-600" : "text-rose-600")}>
                                                {t.type === 'revenue' ? '+' : '-'}{formatVND(t.amount)}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <Badge variant={t.type === 'revenue' ? 'success' : 'neutral'} className="text-[9px] uppercase px-1.5 py-0.5">
                                                    {t.type === 'revenue' ? 'Thu' : 'Chi'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

        {/* --- TAB CONTENT: PAYMENT HISTORY --- */}
        {activeSubTab === 'history' && (
            <Card className="border-slate-200 shadow-sm bg-white">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><History size={18} className="text-indigo-600"/> Lịch sử nộp thuế</h3>
                        <p className="text-xs text-slate-500 mt-1">Ghi nhận các khoản thuế đã nộp và chứng từ kèm theo.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold">
                            Còn phải nộp: {formatVND(taxRemaining)}
                        </div>
                        <Button className="bg-indigo-600 shadow-lg shadow-indigo-200 font-bold text-xs gap-2">
                            <Plus size={14}/> Ghi nhận nộp thuế
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Kỳ nộp</th>
                                <th className="px-6 py-4">Ngày nộp</th>
                                <th className="px-6 py-4 text-right">Số tiền</th>
                                <th className="px-6 py-4">Ghi chú</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Chứng từ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map(pay => (
                                <tr key={pay.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{pay.period} / {pay.year}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{new Date(pay.paymentDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600">{formatVND(pay.amountTy * 1000000000)}</td>
                                    <td className="px-6 py-4 text-slate-600 text-xs italic">{pay.notes}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="success" className="text-[9px] uppercase">Đã xác nhận</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"><Download size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        )}
    </div>
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Button, Select, Badge, Skeleton, Switch, TooltipWrapper } from '../../ui';
import { CareCase } from '../../../types';
import { formatCurrency, formatCurrencyTy, formatNumber } from '../../../utils';
import { 
    Filter, Calendar, TrendingUp, TrendingDown, DollarSign, 
    PieChart, Activity, Download, ChevronRight, Calculator, AlertTriangle, User
} from 'lucide-react';
import { PerformancePeriodDetailModal } from '../modals/PerformancePeriodDetailModal';

interface Props {
  careCase: CareCase;
}

// --- MOCK DATA GENERATOR ---
const generateMockFinancials = (year: number) => {
    const data = [];
    // Generate 12 months
    for (let i = 1; i <= 12; i++) {
        // Skip future months if current year
        if (year === new Date().getFullYear() && i > new Date().getMonth() + 1) break;

        const revenue = Math.random() * 0.05 + 0.02; // 20-70tr
        const cost = Math.random() * 0.01; // 0-10tr
        
        // Mock Lists
        const revenueList = [
            { date: `${year}-${String(i).padStart(2,'0')}-05`, refNo: `TX-${i}01`, type: 'Tiền thuê', amount: revenue * 0.8, payer: 'Nguyễn Văn A' },
            { date: `${year}-${String(i).padStart(2,'0')}-15`, refNo: `TX-${i}02`, type: 'Phí dịch vụ', amount: revenue * 0.2, payer: 'Nguyễn Văn A' }
        ];
        const costList = Math.random() > 0.5 ? [
            { date: `${year}-${String(i).padStart(2,'0')}-10`, category: 'Sửa chữa', amount: cost, hasDoc: true, note: 'Sửa bóng đèn' }
        ] : [];

        data.push({
            period: `Tháng ${i}/${year}`,
            month: i,
            year: year,
            revenue: revenue, // Billion
            cost: cost, // Billion
            tax: revenue * 0.1, // Mock 10%
            revenueList,
            costList
        });
    }
    return data;
};

export const PerformanceReportTab: React.FC<Props> = ({ careCase }) => {
  const [year, setYear] = useState(2023);
  const [viewMode, setViewMode] = useState<'month' | 'quarter'>('month');
  const [assetFilter, setAssetFilter] = useState('tat_ca');
  const [onlyApproved, setOnlyApproved] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);

  // Load Data Mock
  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setRawData(generateMockFinancials(year));
          setLoading(false);
      }, 600);
  }, [year, careCase.id]);

  // Aggregate Data based on View Mode
  const aggregatedData = useMemo(() => {
      if (viewMode === 'month') return rawData.sort((a,b) => b.month - a.month);
      
      // Quarter grouping
      const quarters: Record<string, any> = {};
      rawData.forEach(item => {
          const q = Math.ceil(item.month / 3);
          const key = `Quý ${q}/${item.year}`;
          if (!quarters[key]) {
              quarters[key] = { 
                  period: key, revenue: 0, cost: 0, tax: 0, 
                  revenueList: [], costList: [] 
              };
          }
          quarters[key].revenue += item.revenue;
          quarters[key].cost += item.cost;
          quarters[key].tax += item.tax;
          quarters[key].revenueList.push(...item.revenueList);
          quarters[key].costList.push(...item.costList);
      });
      return Object.values(quarters).reverse();
  }, [rawData, viewMode]);

  // Total KPIs
  const totals = useMemo(() => {
      return aggregatedData.reduce((acc, curr) => ({
          revenue: acc.revenue + curr.revenue,
          cost: acc.cost + curr.cost,
          tax: acc.tax + curr.tax
      }), { revenue: 0, cost: 0, tax: 0 });
  }, [aggregatedData]);

  const netIncome = totals.revenue - totals.cost - totals.tax;
  const netCashflow = totals.revenue - totals.cost; // Simplified
  const mockAssetValue = 5.5; // 5.5 Ty
  const roi = (netIncome / mockAssetValue) * 100; // Simplified period ROI (not annualized)

  const KPICard = ({ title, value, sub, color, icon: Icon }: any) => (
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden relative">
          <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
                  <div className={`p-1.5 rounded-lg ${color.bg} ${color.text}`}><Icon size={16}/></div>
              </div>
              <div className={`text-2xl font-black ${color.textValue || 'text-slate-800'}`}>
                  {value}
              </div>
              {sub && <div className="text-[10px] text-slate-400 mt-1 font-medium">{sub}</div>}
          </CardContent>
      </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <PerformancePeriodDetailModal 
            isOpen={!!selectedPeriod} 
            onClose={() => setSelectedPeriod(null)} 
            periodData={selectedPeriod} 
        />

        {/* --- FILTER BAR --- */}
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                        <User size={16} className="text-slate-500"/>
                        <span className="text-xs font-bold text-slate-700">{careCase.ownerName}</span>
                    </div>
                    
                    <Select 
                        className="w-[140px] h-9 text-xs" 
                        value={year.toString()} 
                        onChange={(v) => setYear(parseInt(v))}
                        options={[{label: 'Năm 2023', value: '2023'}, {label: 'Năm 2022', value: '2022'}]}
                    />
                    
                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Tháng</button>
                        <button onClick={() => setViewMode('quarter')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'quarter' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Quý</button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <Switch checked={onlyApproved} onChange={setOnlyApproved} />
                        <div className="text-xs">
                            <span className="font-bold text-slate-700 block group-hover:text-indigo-600">Chỉ dòng tiền ĐÃ DUYỆT</span>
                            <span className="text-[10px] text-slate-400 font-medium">Bỏ qua trạng thái Pending</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-2"><Download size={14}/> Xuất báo cáo</Button>
                </div>
            </CardContent>
        </Card>

        {/* --- KPI SECTION --- */}
        {loading ? <Skeleton className="h-32 w-full rounded-2xl" /> : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard title="Tổng doanh thu" value={formatCurrencyTy(totals.revenue)} icon={DollarSign} color={{bg:'bg-emerald-50', text:'text-emerald-600'}} sub="Dòng tiền thực thu" />
                <KPICard title="Tổng chi phí" value={formatCurrencyTy(totals.cost)} icon={TrendingDown} color={{bg:'bg-rose-50', text:'text-rose-600', textValue:'text-rose-600'}} sub="Phí vận hành, sửa chữa" />
                <KPICard title="Thuế tạm tính" value={formatCurrencyTy(totals.tax)} icon={Calculator} color={{bg:'bg-amber-50', text:'text-amber-600'}} sub="TNCN + GTGT (10%)" />
                <KPICard title="Lợi nhuận ròng" value={formatCurrencyTy(netIncome)} icon={Activity} color={{bg:'bg-indigo-50', text:'text-indigo-600', textValue:'text-indigo-600'}} sub="Sau khi trừ tất cả" />
                <KPICard title="Dòng tiền ròng" value={formatCurrencyTy(netCashflow)} icon={TrendingUp} color={{bg:'bg-blue-50', text:'text-blue-600'}} sub="Cash In - Cash Out" />
                <KPICard title="ROI (Ước tính)" value={`${roi.toFixed(2)}%`} icon={PieChart} color={{bg:'bg-violet-50', text:'text-violet-600'}} sub={`Trên giá trị ${mockAssetValue} tỷ`} />
            </div>
        )}

        {/* --- FORMULA EXPLANATION --- */}
        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-slate-400"/> <b>Công thức:</b></div>
            <div>• Lợi nhuận ròng = Doanh thu - Chi phí - Thuế</div>
            <div>• Thuế = 10% x Doanh thu (Khoán)</div>
            <div>• ROI = Lợi nhuận ròng / Giá trị tài sản (Ước tính)</div>
        </div>

        {/* --- MAIN TABLE --- */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 w-[150px]">Kỳ báo cáo</th>
                            <th className="px-6 py-4 text-right">Doanh thu</th>
                            <th className="px-6 py-4 text-right">Chi phí</th>
                            <th className="px-6 py-4 text-right">Thuế (Tạm)</th>
                            <th className="px-6 py-4 text-right">Lợi nhuận ròng</th>
                            <th className="px-6 py-4 text-right">ROI</th>
                            <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 z-10 w-[100px]">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8"><Skeleton className="h-10 w-full"/></td></tr>
                        ) : aggregatedData.length === 0 ? (
                            <tr><td colSpan={7} className="p-16 text-center text-slate-400 italic">Không có dữ liệu trong khoảng thời gian này.</td></tr>
                        ) : aggregatedData.map((row: any, idx: number) => {
                            const net = row.revenue - row.cost - row.tax;
                            const rowRoi = (net / mockAssetValue) * 100;
                            return (
                                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedPeriod(row)}>
                                    <td className="px-6 py-4 font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        {row.period}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatCurrency(row.revenue, 'cho_thue')}</td>
                                    <td className="px-6 py-4 text-right font-medium text-rose-600">{formatCurrency(row.cost, 'cho_thue')}</td>
                                    <td className="px-6 py-4 text-right font-medium text-amber-600">{formatCurrency(row.tax, 'cho_thue')}</td>
                                    <td className="px-6 py-4 text-right font-black text-indigo-600">{formatCurrency(net, 'cho_thue')}</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{rowRoi.toFixed(2)}%</td>
                                    <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-indigo-50/30 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"><ChevronRight size={16}/></Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
}
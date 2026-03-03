
import React from 'react';
import { TaxCase, Lease } from '../../../types';
import { Card, CardContent, Button, Badge, Skeleton, TooltipWrapper } from '../../ui';
import { formatCurrency, formatCurrencyTy, cn } from '../../../utils';
import { Landmark, Info, AlertTriangle, CheckCircle2, History, FileText, Download, Settings, PieChart } from 'lucide-react';

interface Props {
  lease: Lease;
  taxCase?: TaxCase;
}

export const LeaseTaxTab: React.FC<Props> = ({ lease, taxCase }) => {
  if (!taxCase) return <div className="p-20 text-center text-slate-400 italic">Dữ liệu thuế chưa được khởi tạo.</div>;

  const progress = Math.min(100, (taxCase.revenueYtdTy / taxCase.thresholdTy) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-400">
      {/* Dynamic Alert Banner */}
      {taxCase.isThresholdExceeded ? (
        <div className="p-5 bg-rose-600 rounded-2xl flex items-center gap-5 text-white shadow-xl shadow-rose-100">
           <div className="p-3 bg-white/20 rounded-xl"><AlertTriangle size={24}/></div>
           <div className="flex-1">
             <p className="font-black uppercase tracking-widest text-[11px] opacity-80 mb-1">Cảnh báo pháp lý</p>
             <p className="font-bold text-lg leading-tight">Đã vượt ngưỡng miễn nộp thuế (100tr/năm)</p>
             <p className="text-sm opacity-90 mt-1">Hệ thống ghi nhận tích lũy: {formatCurrency(taxCase.revenueYtdTy, 'cho_thue')}.</p>
           </div>
           <Button className="bg-white text-rose-700 hover:bg-rose-50 font-black h-11 px-6 rounded-xl">Lập tờ khai</Button>
        </div>
      ) : (
        <div className="p-5 bg-white border border-indigo-100 rounded-2xl flex items-center gap-5 text-indigo-900 shadow-sm">
           <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Info size={24}/></div>
           <div className="flex-1">
             <p className="font-bold text-sm">Theo dõi ngưỡng thuế năm {taxCase.year}</p>
             <p className="text-xs text-slate-500 font-medium mt-1">Chủ nhà hiện thu tích lũy đạt {Math.round(progress)}% ngưỡng quy định.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Progress Circle Card */}
        <div className="xl:col-span-4">
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trạng thái tích lũy</h3>
                   <div className="relative inline-flex items-center justify-center mb-8">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                        <circle className={cn(progress >= 100 ? "text-rose-600" : "text-indigo-600")} strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * progress) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-black text-slate-900 leading-none">{Math.round(progress)}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">Đã đạt</span>
                      </div>
                   </div>
                   <div className="space-y-4 w-full pt-6 border-t border-slate-50">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Đã thực thu:</span>
                         <span className="font-black text-slate-900">{formatCurrency(taxCase.revenueYtdTy, 'cho_thue')}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Ngưỡng nộp:</span>
                         <span className="font-black text-slate-400">{formatCurrency(taxCase.thresholdTy, 'cho_thue')}</span>
                       </div>
                   </div>
              </CardContent>
            </Card>
        </div>

        {/* Detailed Info */}
        <div className="xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-sm"><Landmark size={18} className="text-indigo-600"/> Quy tắc áp dụng</h3>
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Settings size={18}/></button>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-slate-500 font-medium">Niên độ thuế:</span>
                      <Badge variant="indigo" className="font-bold">PAID DATE</Badge>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-slate-500 font-medium">Thuế suất dự kiến:</span>
                      <span className="font-black text-slate-900">10% <span className="text-slate-400 font-normal text-xs">(GTGT + TNCN)</span></span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic leading-relaxed">"Áp dụng cho mọi hợp đồng của cùng một Mã số thuế chủ nhà trong năm dương lịch."</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart size={120}/></div>
                  <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                      <div>
                          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Lịch nộp tờ khai</h3>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black">1</div>
                                 <div>
                                    <p className="text-sm font-bold">Khai thuế năm {taxCase.year}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hạn: 30/01/{taxCase.year + 1}</p>
                                 </div>
                             </div>
                          </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/20 text-white text-xs font-black h-10 hover:bg-white/10">Quản lý MST Chủ nhà</Button>
                  </CardContent>
              </Card>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
             <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Lịch sử nộp thuế & Tờ khai</h3>
                <Button size="sm" variant="outline" className="bg-white border-slate-200 h-9 font-bold text-slate-700 shadow-sm"><Download size={14} className="mr-2"/> Xuất báo cáo thuế</Button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                  <tr>
                    <th className="px-6 py-4">Năm tài chính</th>
                    <th className="px-6 py-4">Hồ sơ</th>
                    <th className="px-6 py-4 text-right">Số tiền</th>
                    <th className="px-6 py-4">Chứng từ đính kèm</th>
                    <th className="px-6 py-4 text-center">Tình trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-5 font-black text-slate-900">2023</td>
                    <td className="px-6 py-5 font-bold text-slate-600">Tạm nộp Q1, Q2</td>
                    <td className="px-6 py-5 text-right font-black text-indigo-700">4.500.000đ</td>
                    <td className="px-6 py-5">
                       <button className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"><FileText size={16}/> UNC_Tax_23.pdf</button>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black">HOÀN TẤT</Badge>
                    </td>
                  </tr>
                </tbody>
             </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

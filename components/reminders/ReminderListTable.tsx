
import React from 'react';
import { Badge, Button, TooltipWrapper, Skeleton } from '../ui';
import { Reminder, ReminderLevel, ReminderStatus, ReminderType } from '../../types';
import { formatCurrencyTy, formatDateTimeVi } from '../../utils';
import { 
    AlertTriangle, CheckCircle2, Clock, 
    FileText, Eye, MoreHorizontal, User, Building, AlertCircle, Info
} from 'lucide-react';
import { cn } from '../../utils';

interface Props {
  data: Reminder[];
  loading: boolean;
  onViewDetail: (reminder: Reminder) => void;
  onQuickAction: (id: string, action: string) => void;
}

const TYPE_MAP: Record<ReminderType, { label: string, color: string }> = {
    payment: { label: 'Thu Tiền', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    tax: { label: 'Thuế', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    fee: { label: 'Phí DV', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    cost: { label: 'Chi Phí', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    contract: { label: 'Hợp Đồng', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    care: { label: 'Care', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    legal: { label: 'Pháp Lý', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    other: { label: 'Khác', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const LEVEL_MAP: Record<ReminderLevel, { label: string, icon: any, color: string }> = {
    low: { label: 'Thấp', icon: CheckCircle2, color: 'text-slate-500' },
    medium: { label: 'Trung bình', icon: Info, color: 'text-amber-600 font-bold' },
    high: { label: 'Cao', icon: AlertTriangle, color: 'text-rose-600 font-bold' },
    critical: { label: 'Rất cao', icon: AlertCircle, color: 'text-rose-700 font-black' },
};

export const ReminderListTable: React.FC<Props> = ({ data, loading, onViewDetail, onQuickAction }) => {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (data.length === 0) {
      return <div className="p-16 text-center text-slate-400 italic">Không có nhắc việc nào phù hợp.</div>;
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 w-[140px]">Mức độ / Loại</th>
            <th className="px-6 py-4 min-w-[250px]">Nội dung nhắc việc</th>
            <th className="px-6 py-4">Liên quan</th>
            <th className="px-6 py-4 text-right">Số tiền</th>
            <th className="px-6 py-4 text-right">Hạn xử lý</th>
            <th className="px-6 py-4">Phụ trách</th>
            <th className="px-6 py-4 text-center">Trạng thái</th>
            <th className="sticky right-0 bg-slate-50 px-6 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((item) => {
            const levelConfig = LEVEL_MAP[item.level];
            const typeConfig = TYPE_MAP[item.type];
            const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'done';

            return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => onViewDetail(item)}>
                    <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                            <div className={cn("flex items-center gap-1.5 text-xs", levelConfig.color)}>
                                <levelConfig.icon size={14}/> {levelConfig.label}
                            </div>
                            <Badge className={cn("text-[10px] uppercase", typeConfig.color)}>{typeConfig.label}</Badge>
                        </div>
                    </td>
                    
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{item.description}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">{item.code}</div>
                    </td>

                    <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                            {item.ownerName && <div className="flex items-center gap-1 font-bold text-indigo-700"><User size={12}/> {item.ownerName}</div>}
                            {(item.propertyName || item.leaseCode) && (
                                <div className="flex items-center gap-1 text-slate-600 font-medium">
                                    <Building size={12}/> {item.leaseCode || item.propertyName}
                                </div>
                            )}
                        </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                        {item.relatedAmountTy ? (
                            <div className="flex flex-col">
                                <span className="font-black text-rose-600">{formatCurrencyTy(item.remainingAmountTy || item.relatedAmountTy)}</span>
                                <span className="text-[10px] text-slate-400 line-through font-bold">{formatCurrencyTy(item.relatedAmountTy)}</span>
                            </div>
                        ) : <span className="text-slate-300">--</span>}
                    </td>

                    <td className="px-6 py-4 text-right">
                        <div className={cn("text-xs font-black", isOverdue ? "text-rose-600" : "text-slate-700")}>
                            {formatDateTimeVi(item.dueDate).split(' ')[0]}
                        </div>
                        {isOverdue && <div className="text-[10px] text-rose-600 font-black bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-block mt-1">QUÁ HẠN</div>}
                    </td>

                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-full w-fit shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                                {item.assigneeName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{item.assigneeName}</span>
                        </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                        <Badge variant={item.status === 'new' ? 'indigo' : item.status === 'processing' ? 'warning' : item.status === 'done' ? 'success' : 'neutral'} className="shadow-sm">
                            {item.status === 'new' ? 'MỚI' : item.status === 'processing' ? 'ĐANG XỬ LÝ' : item.status === 'done' ? 'HOÀN TẤT' : 'HỦY'}
                        </Badge>
                    </td>

                    <td className="sticky right-0 bg-white group-hover:bg-slate-50/80 px-6 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipWrapper content="Xem chi tiết">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" onClick={() => onViewDetail(item)}>
                                    <Eye size={14}/>
                                </Button>
                            </TooltipWrapper>
                            <TooltipWrapper content="Đánh dấu hoàn tất">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" onClick={() => onQuickAction(item.id, 'mark_done')}>
                                    <CheckCircle2 size={14}/>
                                </Button>
                            </TooltipWrapper>
                        </div>
                    </td>
                </tr>
            )})}
        </tbody>
      </table>
    </div>
  );
};

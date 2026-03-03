
import React from 'react';
import { Badge, Button, TooltipWrapper, Skeleton } from '../ui';
import { Lease, LeaseStatus } from '../../types';
import { formatCurrency, formatCurrencyTy, cn } from '../../utils';
import { Edit, Eye, Trash2, ArrowRightLeft, PowerOff, AlertCircle, Clock, CalendarPlus, AlertTriangle, FileText, CheckCircle2, MoreHorizontal, Plus } from 'lucide-react';

interface Props {
  data: Lease[];
  loading: boolean;
  onViewHub: (id: string) => void;
  onRenew: (lease: Lease) => void;
  onTransfer: (lease: Lease) => void;
  onAddCashflow: (lease: Lease) => void;
  onAddDebtNote: (lease: Lease) => void;
}

const STATUS_MAP: Record<LeaseStatus, { label: string, color: string }> = {
  active: { label: 'Đang Hiệu Lực', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  expiring: { label: 'Sắp Hết Hạn', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  expired: { label: 'Đã Hết Hạn', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  pending_deposit: { label: 'Chờ Cọc', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  terminated: { label: 'Chấm Dứt Sớm', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  paused: { label: 'Tạm Dừng', color: 'bg-slate-200 text-slate-600 border-slate-300' },
  transferred: { label: 'Đã Chuyển Nhượng', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export const LeaseListTable: React.FC<Props> = ({ data, loading, onViewHub, onRenew, onTransfer, onAddCashflow, onAddDebtNote }) => {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1800px]">
        <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 w-[100px]">Mã HĐ</th>
            <th className="px-6 py-4 w-[250px]">Bất Động Sản / Căn</th>
            <th className="px-6 py-4 min-w-[200px]">Khách Thuê / Chủ Nhà</th>
            <th className="px-6 py-4 text-right">Tiền Thuê/Kỳ</th>
            <th className="px-6 py-4 text-right">Hạn Thanh Toán</th>
            <th className="px-6 py-4 text-right w-[150px]">Công Nợ</th>
            <th className="px-6 py-4 w-[150px]">Trạng Thái</th>
            <th className="px-6 py-4 w-[120px] text-center">Cảnh Báo</th>
            <th className="sticky right-0 bg-slate-50 px-6 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 w-[180px]">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((lease) => (
            <tr key={lease.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onViewHub(lease.id)}>
              <td className="px-6 py-4 font-bold text-indigo-600">{lease.code}</td>
              
              <td className="px-6 py-4">
                 <div className="font-semibold text-slate-800 line-clamp-1 hover:text-indigo-600 transition-colors">{lease.propertyName}</div>
                 <div className="text-xs text-indigo-500 font-medium">{lease.unitCode}</div>
              </td>

              <td className="px-6 py-4">
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-800 hover:text-indigo-600">{lease.tenantName}</span>
                    <span className="text-[10px] text-slate-400">Chủ nhà: {lease.ownerName}</span>
                 </div>
              </td>

              <td className="px-6 py-4 text-right">
                <div className="font-bold text-emerald-600">{formatCurrency(lease.rentAmountTy, 'cho_thue')}</div>
                <div className="text-[10px] text-slate-400 capitalize">{lease.cycle.replace('_', ' ')}</div>
              </td>

              <td className="px-6 py-4 text-right">
                 <div className={cn(
                   "text-xs font-bold",
                   lease.isOverdue ? "text-rose-600" : "text-slate-600"
                 )}>
                    {new Date(lease.nextDueDate).toLocaleDateString('vi-VN')}
                 </div>
                 {lease.maxOverdueDays > 0 && (
                     <div className="text-[10px] text-rose-500 font-bold">Quá {lease.maxOverdueDays} ngày</div>
                 )}
              </td>

              <td className="px-6 py-4 text-right">
                 {lease.outstandingAmountTy > 0 ? (
                   <span className="font-extrabold text-rose-600">{formatCurrency(lease.outstandingAmountTy, 'cho_thue')}</span>
                 ) : (
                   <span className="text-slate-300 font-bold">--</span>
                 )}
                 {lease.unappliedCreditTy > 0 && (
                     <div className="text-[10px] text-emerald-600 font-medium mt-0.5">(Dư: {formatCurrency(lease.unappliedCreditTy, 'cho_thue')})</div>
                 )}
              </td>

              <td className="px-6 py-4">
                 <Badge className={STATUS_MAP[lease.status].color}>
                    {STATUS_MAP[lease.status].label}
                 </Badge>
              </td>

              <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                      {lease.isOverdue && <TooltipWrapper content="Quá hạn thanh toán"><AlertTriangle size={16} className="text-rose-500"/></TooltipWrapper>}
                      {lease.hasPendingCashflow && <TooltipWrapper content="Có dòng tiền chờ duyệt"><Clock size={16} className="text-amber-500"/></TooltipWrapper>}
                      {lease.hasDebtNote && <TooltipWrapper content="Có ghi chú nợ"><FileText size={16} className="text-indigo-500"/></TooltipWrapper>}
                      {lease.inspectionRisk && <TooltipWrapper content="Rủi ro kiểm tra"><AlertCircle size={16} className="text-rose-600"/></TooltipWrapper>}
                  </div>
              </td>

              <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-2 py-4 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                    <TooltipWrapper content="Thêm Dòng Tiền">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => onAddCashflow(lease)}>
                            <Plus size={14} />
                        </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="Thêm Ghi Chú Nợ">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => onAddDebtNote(lease)}>
                            <FileText size={14} />
                        </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="Chuyển Nhượng">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => onTransfer(lease)}>
                            <ArrowRightLeft size={14} />
                        </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="Xem Chi Tiết">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:bg-slate-100" onClick={() => onViewHub(lease.id)}>
                            <Eye size={14} />
                        </Button>
                    </TooltipWrapper>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

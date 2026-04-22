
import React, { useState } from 'react';
import { Badge, Button, TooltipWrapper, Skeleton, toast } from '../ui';
import { Transaction, TransactionStatus } from '../../types';
import { formatCurrency, formatDateTimeVi, formatNumber, cn } from '../../utils';
import { updateTransactionStatus } from '../../data/transactionFactory';
import {
  Eye, Trash2, FileText, CheckCircle2, AlertCircle, Clock, Search, ExternalLink,
  ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { UploadDocumentsModal } from './modals/UploadDocumentsModal';
import { InternalNoteModal } from './modals/InternalNoteModal';
import { ViewContractModal, DocumentItem } from '../common/modals/ViewContractModal';

interface Props {
  data: Transaction[];
  loading: boolean;
  onUpdate: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  'Mua': 'bg-[#ecfdf5] text-[#10b981] border-[#10b981] border',
  'Thuê': 'bg-[#fff1f2] text-[#e11d48] border-[#e11d48] border',
  'Ký Gửi Bán': 'bg-[#fffbeb] text-[#f59e0b] border-[#f59e0b] border',
  'Đặt Cọc': 'bg-[#3b82f6] text-white',
  'Đã Hủy': 'bg-[#78350f] text-white',
  'GD Hoàn Tất': 'bg-[#10b981] text-white',
};

const STATUS_CONFIG: Record<string, { label: string, variant: 'success' | 'danger' | 'indigo' | 'warning' | 'neutral' }> = {
    'hoan_tat': { label: 'Hoàn Tất', variant: 'success' },
    'that_bai': { label: 'Thất Bại', variant: 'danger' },
    'dat_coc': { label: 'Đặt Cọc', variant: 'indigo' },
    'dang_xu_ly': { label: 'Đang Xử Lý', variant: 'warning' },
    'dang_xu_ly_hs': { label: 'Đang Xử Lý HS', variant: 'warning' },
    'ky_hop_dong': { label: 'Ký Hợp Đồng', variant: 'indigo' },
    'thanh_toan_dot1': { label: 'TT Đợt 1', variant: 'indigo' },
    'thanh_toan_day_du': { label: 'TT Đầy Đủ', variant: 'success' },
    'huy': { label: 'Đã Hủy', variant: 'danger' },
};

export const TransactionsTable: React.FC<Props> = ({ data, loading, onUpdate }) => {
  const [uploadTarget, setUploadTarget] = useState<Transaction | null>(null);
  const [noteTarget, setNoteTarget] = useState<Transaction | null>(null);
  const [viewContractTarget, setViewContractTarget] = useState<Transaction | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast(`Đã copy: ${text}`);
  };

  const handleStatusChange = (txId: string, newStatus: TransactionStatus) => {
    const success = updateTransactionStatus(txId, newStatus);
    if (success) {
      toast("Cập nhật trạng thái thành công");
      onUpdate();
    }
  };

  if (loading) return <div className="p-8 space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (data.length === 0) return <div className="p-16 text-center text-slate-400 italic">Không có giao dịch nào phù hợp bộ lọc</div>;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1800px]">
        <thead className="bg-[#f8fafc] sticky top-0 z-10 text-[10px] font-black text-slate-500">
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã GD</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tên KH</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">BĐS</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Khu Vực</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loại HĐ</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng Thái GD</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giá Trị HĐ</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phí Môi Giới</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã thu</th>
            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Còn Lại</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phụ Trách</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Bàn Giao Dự Kiến</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ngày Ký</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cập Nhật</th>
            <th className="sticky right-0 bg-slate-50 px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-[12px] text-[#1e2b3c] font-medium bg-white">
          {data.map((tx, idx) => {
            const displayStatusLabel = 
                 tx.status === 'dat_coc' ? 'Đặt Cọc' : 
                 tx.status === 'hoan_tat' ? 'GD Hoàn Tất' : 
                 tx.status === 'huy' ? 'Đã Hủy' : 'Đặt Cọc';
            
            const displayPurposeLabel = tx.purpose === 'ban' ? 'Mua' : 'Thuê';

            return (
              <tr key={tx.id} className={cn(
                  "border-b border-slate-50 transition-colors cursor-pointer group hover:bg-slate-50/50",
                  idx % 2 === 0 ? "bg-white" : "bg-white"
              )}>
                <td className="px-4 py-3 text-xs font-mono text-slate-500">#{tx.id}</td>
                <td className="px-4 py-3">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{tx.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Bản chính thức</span>
                    </div>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-600">{tx.propertyName}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{tx.area}</td>
                <td className="px-4 py-3">
                    <Badge variant={tx.purpose === 'Mua' ? 'indigo' : 'danger'} className="text-[9px] px-1.5 h-4 min-w-[40px] justify-center">
                        {tx.purpose.toUpperCase()}
                    </Badge>
                </td>
                <td className="px-4 py-3">
                    <Badge variant={STATUS_CONFIG[tx.status]?.variant || 'neutral'} className="text-[9px] px-1.5 h-4 whitespace-nowrap">
                        {STATUS_CONFIG[tx.status]?.label || tx.status}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-slate-800">{formatNumber(tx.dealValueTy).replace('.', ',')} tỷ</span>
                </td>
                <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-indigo-600">{tx.commissionFee}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs font-medium text-emerald-600">{formatNumber(tx.depositAmountTy)} tỷ</td>
                <td className="px-4 py-3 text-right text-xs font-medium text-rose-500">{formatNumber(tx.dealValueTy - tx.depositAmountTy)} tỷ</td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200 uppercase">
                            {tx.assigneeName ? tx.assigneeName.charAt(0) : '?'}
                        </div>
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{tx.assigneeName}</span>
                    </div>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-600">30.12.2023</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDateTimeVi(tx.createdAt).split(' ')[0]}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDateTimeVi(tx.updatedAt).split(' ')[0]}</td>
                <td className="sticky right-0 bg-white/80 backdrop-blur-sm px-4 py-2 group-hover:bg-slate-50/80 transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-center gap-1.5">
                        <TooltipWrapper content="Xem Chi Tiết">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border-transparent"
                                onClick={() => setViewContractTarget(tx)}
                            >
                                <Eye size={16} />
                            </Button>
                        </TooltipWrapper>
                        <TooltipWrapper content="Xóa Giao Dịch">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-transparent"
                                onClick={() => { if(window.confirm("Xóa giao dịch này?")) onUpdate(); }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </TooltipWrapper>
                    </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {uploadTarget && <UploadDocumentsModal tx={uploadTarget} isOpen={!!uploadTarget} onClose={() => setUploadTarget(null)} onSuccess={onUpdate} />}
      {noteTarget && <InternalNoteModal tx={noteTarget} isOpen={!!noteTarget} onClose={() => setNoteTarget(null)} onSuccess={onUpdate} />}

      {viewContractTarget && (
        <ViewContractModal
          isOpen={!!viewContractTarget}
          onClose={() => setViewContractTarget(null)}
          title={`Giao dịch ${viewContractTarget.id}`}
          subtitle={`${viewContractTarget.customerName} - ${viewContractTarget.propertyName}`}
          badgeText={STATUS_CONFIG[viewContractTarget.status]?.label || 'Đặt Cọc'}
          headerColor="bg-slate-800"
          documents={[
            ...(viewContractTarget.hasContract ? [{
              id: 'doc-1',
              name: 'Hợp Đồng Giao Dịch - Bản chính thức.pdf',
              url: '#',
              sizeKb: 2450,
              uploadedAt: formatDateTimeVi(viewContractTarget.updatedAt).split(' ')[0]
            }] : []),
            ...(viewContractTarget.hasDepositProof ? [{
              id: 'doc-2',
              name: 'UNC_Dat_Coc.pdf',
              url: '#',
              sizeKb: 850,
              uploadedAt: formatDateTimeVi(viewContractTarget.updatedAt).split(' ')[0]
            }] : []),
          ]}
        />
      )}
    </div>
  );
};

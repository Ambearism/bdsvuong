
import React, { useState } from 'react';
import { Badge, Button, TooltipWrapper, Skeleton, toast } from '../ui';
import { Transaction, TransactionStatus } from '../../types';
import { formatCurrency, formatDateTimeVi, formatNumber } from '../../utils';
import { updateTransactionStatus } from '../../data/transactionFactory';
import { 
  FileUp, MessageSquare, Trash2, Copy, ExternalLink, 
  FileText, Receipt, User, Building, AlertCircle
} from 'lucide-react';
import { UploadDocumentsModal } from './modals/UploadDocumentsModal';
import { InternalNoteModal } from './modals/InternalNoteModal';

interface Props {
  data: Transaction[];
  loading: boolean;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<TransactionStatus, { label: string, color: string }> = {
    dat_coc: { label: 'Đặt Cọc', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    dang_xu_ly_hs: { label: 'Đang Xử Lý HS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    ky_hop_dong: { label: 'Ký Hợp Đồng', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    thanh_toan_dot1: { label: 'TT Đợt 1', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    thanh_toan_day_du: { label: 'TT Đầy Đủ', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    hoan_tat: { label: 'Hoàn Tất', color: 'bg-emerald-600 text-white border-emerald-700' },
    huy: { label: 'Đã Hủy', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const TransactionsTable: React.FC<Props> = ({ data, loading, onUpdate }) => {
  const [uploadTarget, setUploadTarget] = useState<Transaction | null>(null);
  const [noteTarget, setNoteTarget] = useState<Transaction | null>(null);

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
      <table className="w-full text-left border-collapse min-w-[2000px]">
        <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-4 py-4 w-[120px]">Mã GD</th>
            <th className="px-4 py-4 w-[180px]">Trạng Thái</th>
            <th className="px-4 py-4 w-[100px]">Nguồn</th>
            <th className="px-4 py-4 min-w-[200px]">Khách Hàng</th>
            <th className="px-4 py-4 min-w-[250px]">Bất Động Sản</th>
            <th className="px-4 py-4">Mục Đích / Pháp Lý</th>
            <th className="px-4 py-4 text-right">Giá Trị Giao Dịch</th>
            <th className="px-4 py-4 text-right">Tiền Cọc Thực Tế</th>
            <th className="px-4 py-4 text-right">Hoa Hồng</th>
            <th className="px-4 py-4 text-center">Tài Liệu</th>
            <th className="px-4 py-4">Ghi Chú</th>
            <th className="px-4 py-4 text-right">Cập Nhật</th>
            <th className="sticky right-0 bg-slate-50 px-4 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 w-[140px]">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-4">
                <div className="font-bold text-slate-800">{tx.id}</div>
                <div className="text-[10px] text-indigo-500 font-medium">#{tx.dealId}</div>
              </td>
              <td className="px-4 py-4">
                 <select 
                    value={tx.status} 
                    onChange={(e) => handleStatusChange(tx.id, e.target.value as any)}
                    className={`appearance-none px-3 py-1.5 rounded-lg border font-bold text-[11px] uppercase transition-all cursor-pointer ${STATUS_CONFIG[tx.status].color}`}
                 >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                 </select>
              </td>
              <td className="px-4 py-4">
                  <Badge variant={tx.source === 'auto_from_deal' ? 'indigo' : 'neutral'} className="text-[10px]">{tx.source === 'auto_from_deal' ? 'AUTO' : 'MANUAL'}</Badge>
              </td>
              <td className="px-4 py-4">
                 <div className="font-bold text-slate-800">{tx.customerName}</div>
                 <div className="text-xs text-slate-500">{tx.customerPhone}</div>
              </td>
              <td className="px-4 py-4">
                 <div className="font-semibold text-indigo-700 line-clamp-1">{tx.propertyName}</div>
                 <div className="text-xs text-slate-400 font-mono">{tx.propertyCode}</div>
              </td>
              <td className="px-4 py-4">
                 <div className="flex gap-1">
                    <Badge variant={tx.purpose === 'ban' ? 'warning' : 'success'} className="text-[9px] uppercase">{tx.purpose === 'ban' ? 'Bán' : 'Thuê'}</Badge>
                    <Badge variant="outline" className="text-[9px] capitalize italic">{tx.legalStatus.replace('_', ' ')}</Badge>
                 </div>
              </td>
              <td className="px-4 py-4 text-right">
                 <div className="font-bold text-slate-900">{formatCurrency(tx.dealValueTy, tx.purpose)}</div>
                 <div className="text-[10px] text-slate-400 font-mono">{formatNumber(tx.areaM2)} m²</div>
              </td>
              <td className="px-4 py-4 text-right">
                 <div className="font-bold text-amber-600">{formatCurrency(tx.depositAmountTy, tx.purpose)}</div>
                 {tx.hasDepositProof && <Badge variant="success" className="text-[8px] h-4 mt-1">Đã khớp UNC</Badge>}
              </td>
              <td className="px-4 py-4 text-right font-bold text-indigo-600">
                  {tx.commissionFee}
              </td>
              <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                     <FileText size={16} className={tx.hasContract ? 'text-indigo-600' : 'text-slate-200'} />
                     <Receipt size={16} className={tx.hasDepositProof ? 'text-amber-500' : 'text-slate-200'} />
                  </div>
              </td>
              <td className="px-4 py-4">
                  <p className="text-xs text-slate-500 italic line-clamp-2 max-w-[200px]">{tx.internalNote || '...'}</p>
              </td>
              <td className="px-4 py-4 text-right text-xs text-slate-400">
                 {formatDateTimeVi(tx.updatedAt).split(' ')[0]}
              </td>
              
              <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-2 py-4 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20">
                <div className="flex items-center justify-center gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600" onClick={() => setUploadTarget(tx)}><FileUp size={14} /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600" onClick={() => setNoteTarget(tx)}><MessageSquare size={14} /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500"><Trash2 size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {uploadTarget && <UploadDocumentsModal tx={uploadTarget} isOpen={!!uploadTarget} onClose={() => setUploadTarget(null)} onSuccess={onUpdate} />}
      {noteTarget && <InternalNoteModal tx={noteTarget} isOpen={!!noteTarget} onClose={() => setNoteTarget(null)} onSuccess={onUpdate} />}
    </div>
  );
};

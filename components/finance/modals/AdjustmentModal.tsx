
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast, Badge } from '../../ui';
import { CashflowEntry } from '../../../types';
import { createAdjustment } from '../../../data/financeFactory';
import { RefreshCcw, Info, ArrowRight } from 'lucide-react';
import { formatCurrencyTy } from '../../../utils';

interface Props {
  originalEntry: CashflowEntry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustmentModal: React.FC<Props> = ({ originalEntry, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
      type: 'INCREASE', // INCREASE | DECREASE
      amountMillion: 0,
      reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
      if (formData.amountMillion <= 0) return toast("Số tiền điều chỉnh phải lớn hơn 0", "error");
      if (!formData.reason.trim()) return toast("Vui lòng nhập lý do điều chỉnh", "error");

      setLoading(true);
      await createAdjustment(originalEntry.id, {
          ...formData,
          amountTy: formData.amountMillion / 1000
      });
      toast("Đã tạo bút toán điều chỉnh (Adjustment Created)", "success");
      setLoading(false);
      onSuccess();
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Điều Chỉnh (Adjustment)" size="md">
        <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Giao dịch gốc (Locked)</div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{originalEntry.refNo}</span>
                    <span className="font-black text-slate-900">{formatCurrencyTy(originalEntry.amountTy)}</span>
                </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-xs text-amber-800">
                <Info size={16} className="shrink-0 mt-0.5"/>
                <p>Theo nguyên tắc kế toán, giao dịch đã duyệt không thể sửa/xóa. Hệ thống sẽ tạo một bút toán điều chỉnh (+/-) tham chiếu đến giao dịch gốc.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="Loại điều chỉnh"
                    value={formData.type}
                    onChange={v => setFormData({...formData, type: v})}
                    options={[
                        {label: 'Tăng (+)', value: 'INCREASE'},
                        {label: 'Giảm (-)', value: 'DECREASE'}
                    ]}
                />
                <Input 
                    label="Số tiền chênh lệch (Triệu)"
                    type="number"
                    value={formData.amountMillion}
                    onChange={e => setFormData({...formData, amountMillion: parseFloat(e.target.value) || 0})}
                />
            </div>

            <Textarea 
                label="Lý do điều chỉnh (Bắt buộc)"
                placeholder="VD: Nhập sai số tiền thực tế, điều chỉnh phí..."
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
            />

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={loading}>
                    <RefreshCcw size={16}/> Lưu Điều Chỉnh
                </Button>
            </div>
        </div>
    </Modal>
  );
};

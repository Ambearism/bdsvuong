
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast, Badge } from '../../ui';
import { Lease } from '../../../types';
import { formatCurrencyTy } from '../../../utils';
import { User, DollarSign, Calendar, Paperclip, Check, FileUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease;
}

export const CreateReceiptModal: React.FC<Props> = ({ isOpen, onClose, lease }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    receiptNo: `PT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-002`,
    date: new Date().toISOString().split('T')[0],
    amountTy: '', // Changed from 0 to '' for easier typing
    note: '',
    transactionId: '',
  });

  const handleSubmit = () => {
    const amount = parseFloat(formData.amountTy);
    if (!amount || amount <= 0) return toast("Số tiền phải lớn hơn 0", "error");
    
    setLoading(true);
    setTimeout(() => {
        toast("Đã tạo phiếu thu thành công!", "success");
        setLoading(false);
        onClose();
    }, 800);
  };

  const handleTransactionSelect = (val: string) => {
      // Mock logic for auto-fill amount
      const autoAmount = val === 'PT-001' ? '0.015' : val === '992' ? '0.010' : '';
      setFormData({...formData, transactionId: val, amountTy: autoAmount});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Phiếu Thu & Chứng Từ" size="lg">
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Số phiếu thu" 
                    value={formData.receiptNo} 
                    onChange={e => setFormData({...formData, receiptNo: e.target.value})} 
                />
                <Input 
                    label="Ngày lập phiếu" 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liên kết dòng tiền (Không bắt buộc)</label>
                <Select 
                    placeholder="Chọn giao dịch ngân hàng để đối soát..."
                    options={[
                        { label: 'PT-001 (15tr) - Khách chuyển Techcombank', value: 'PT-001' },
                        { label: 'Giao dịch #992 (10tr) - Tiền mặt', value: '992' }
                    ]}
                    value={formData.transactionId}
                    onChange={handleTransactionSelect}
                />
                {formData.transactionId && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg">
                        <Check size={14}/> Đã tự động khớp số tiền từ giao dịch ngân hàng
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                    label="Số tiền thu thực tế (Tỷ)" 
                    type="number" step="0.001"
                    icon={<DollarSign size={14}/>}
                    value={formData.amountTy}
                    onChange={e => setFormData({...formData, amountTy: e.target.value})}
                    placeholder="0.000"
                />
                 <Select 
                    label="Lập cho kỳ hạn"
                    placeholder="Chọn kỳ hạn..."
                    options={[
                        { label: 'Kỳ tháng 11', value: 'k1' },
                        { label: 'Kỳ tháng 12', value: 'k2' }
                    ]}
                    value=""
                    onChange={() => {}}
                />
            </div>

            <Textarea 
                label="Ghi chú phiếu thu" 
                placeholder="Nội dung thu tiền: ví dụ thu tiền nhà tháng 11..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
            />

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Chứng từ đính kèm (UNC / Ảnh chụp)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                    <FileUp size={24} className="mb-2 opacity-50"/>
                    <span className="text-xs font-medium">Nhấn hoặc kéo thả tệp tin vào đây</span>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Xác nhận & Lưu phiếu"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

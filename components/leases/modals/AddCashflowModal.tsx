
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../../ui';
import { Lease } from '../../../types';
import { formatCurrency } from '../../../utils';
import { DollarSign, FileUp, CheckCircle2 } from 'lucide-react';

interface Props {
  lease: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCashflowModal: React.FC<Props> = ({ lease, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amountMillion: '', // Changed to string
    method: 'bank_transfer',
    payer: lease.tenantName,
    revenueCode: '',
    isTaxable: true,
    note: ''
  });

  const handleSubmit = () => {
    const amount = parseFloat(formData.amountMillion);
    if (!amount || amount <= 0) return toast("Số tiền phải lớn hơn 0", "error");
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
        toast("Đã tạo dòng tiền (Pending Approval)", "success");
        setLoading(false);
        onSuccess();
        onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Dòng Tiền (Cashflow Entry)" size="lg">
        <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-center gap-2">
                <CheckCircle2 size={16}/>
                <span>Dòng tiền sẽ được tạo với trạng thái <b>PENDING</b>. Cần duyệt để tính vào báo cáo.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Ngày nhận tiền" 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                />
                <Input 
                    label="Người nộp / Chuyển khoản" 
                    value={formData.payer} 
                    onChange={e => setFormData({...formData, payer: e.target.value})} 
                />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input 
                            label="Số tiền thực nhận (Triệu VNĐ)" 
                            type="number" step="0.1"
                            icon={<DollarSign size={14}/>}
                            value={formData.amountMillion}
                            onChange={e => setFormData({...formData, amountMillion: e.target.value})}
                            className="font-bold text-emerald-700 text-lg"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1">
                        <Select 
                            label="Phương thức"
                            options={[
                                { label: 'Chuyển khoản', value: 'bank_transfer' },
                                { label: 'Tiền mặt', value: 'cash' },
                                { label: 'Thẻ / POS', value: 'card' }
                            ]}
                            value={formData.method}
                            onChange={v => setFormData({...formData, method: v})}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Select 
                    label="Mã doanh thu (Revenue Code)"
                    placeholder="Chọn loại doanh thu..."
                    options={[
                        { label: 'Tiền thuê (Rent)', value: 'rent' },
                        { label: 'Tiền cọc (Deposit)', value: 'deposit' },
                        { label: 'Phí dịch vụ', value: 'fee' },
                        { label: 'Khác', value: 'other' }
                    ]}
                    value={formData.revenueCode}
                    onChange={v => setFormData({...formData, revenueCode: v})}
                />
                <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isTaxable} onChange={e => setFormData({...formData, isTaxable: e.target.checked})} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Tính thuế (Taxable)</span>
                    </label>
                </div>
            </div>

            <Textarea 
                label="Ghi chú / Diễn giải" 
                placeholder="VD: Thanh toán tiền nhà T12/2023..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
            />

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                <FileUp size={20} className="mb-1"/>
                <span className="text-xs font-bold uppercase">Đính kèm UNC / Chứng từ</span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Lưu Dòng Tiền"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

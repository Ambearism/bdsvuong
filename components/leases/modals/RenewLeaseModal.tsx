
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../../ui';
import { Lease, PaymentCycle } from '../../../types';
import { renewLease } from '../../../data/leaseFactory';
import { formatCurrency, cn } from '../../../utils';
import { Calendar, DollarSign, ArrowRight, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  lease: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewLeaseModal: React.FC<Props> = ({ lease, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    rentAmountMillion: 0,
    cycle: '1_month' as PaymentCycle,
    note: ''
  });

  // Init form data when opening
  useEffect(() => {
    if (lease && isOpen) {
        const oldEnd = new Date(lease.endDate);
        const newStart = new Date(oldEnd);
        newStart.setDate(oldEnd.getDate() + 1); // Start next day
        
        const newEnd = new Date(newStart);
        newEnd.setFullYear(newStart.getFullYear() + 1); // Default 1 year extension

        setFormData({
            startDate: newStart.toISOString().split('T')[0],
            endDate: newEnd.toISOString().split('T')[0],
            rentAmountMillion: lease.rentAmountTy * 1000,
            cycle: lease.cycle,
            note: ''
        });
    }
  }, [lease, isOpen]);

  const handleSubmit = async () => {
    if (formData.rentAmountMillion <= 0) return toast("Giá thuê phải lớn hơn 0", "error");
    if (!formData.startDate || !formData.endDate) return toast("Vui lòng chọn đầy đủ ngày tháng", "error");

    setLoading(true);
    try {
        await renewLease(lease.id, {
            startDate: formData.startDate,
            endDate: formData.endDate,
            rentAmountTy: formData.rentAmountMillion / 1000,
            cycle: formData.cycle,
            note: formData.note
        });
        toast(`Gia hạn hợp đồng thành công!`, "success");
        onSuccess();
        onClose();
    } catch (e) {
        toast("Lỗi khi gia hạn", "error");
    } finally {
        setLoading(false);
    }
  };

  const oldPrice = lease.rentAmountTy * 1000;
  const newPrice = formData.rentAmountMillion;
  const diffPercent = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gia Hạn Hợp Đồng Thuê" size="lg">
        <div className="p-6 space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Hợp đồng gốc</div>
                    <div className="font-bold text-slate-800">{lease.code}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(lease.startDate).toLocaleDateString('vi-VN')} - {new Date(lease.endDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <ArrowRight className="text-indigo-300"/>
                <div className="text-right">
                    <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Khách thuê</div>
                    <div className="font-bold text-slate-800">{lease.tenantName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Giá cũ: {formatCurrency(lease.rentAmountTy, 'cho_thue')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={16}/> Thời hạn mới</h4>
                    <Input 
                        label="Ngày bắt đầu (Tiếp nối)" 
                        type="date" 
                        value={formData.startDate} 
                        onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    />
                    <Input 
                        label="Ngày kết thúc" 
                        type="date" 
                        value={formData.endDate} 
                        onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16}/> Giá trị & Thanh toán</h4>
                    <div className="relative">
                        <Input 
                            label="Giá thuê mới (Triệu/Kỳ)" 
                            type="number"
                            value={formData.rentAmountMillion}
                            onChange={e => setFormData({...formData, rentAmountMillion: parseFloat(e.target.value) || 0})}
                            className={cn(
                                "font-bold",
                                diffPercent > 0 ? "text-emerald-600" : diffPercent < 0 ? "text-rose-600" : "text-slate-700"
                            )}
                        />
                        {diffPercent !== 0 && (
                            <div className={cn("absolute right-2 top-8 text-xs font-bold flex items-center gap-1", diffPercent > 0 ? "text-emerald-600" : "text-rose-600")}>
                                {diffPercent > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                {Math.abs(diffPercent).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <Select 
                        label="Kỳ thanh toán"
                        value={formData.cycle}
                        onChange={v => setFormData({...formData, cycle: v as PaymentCycle})}
                        options={[
                            { label: '1 Tháng / lần', value: '1_month' },
                            { label: '3 Tháng / lần', value: '3_months' },
                            { label: '6 Tháng / lần', value: '6_months' },
                            { label: '1 Năm / lần', value: '12_months' },
                        ]}
                    />
                </div>
            </div>

            <Textarea 
                label="Ghi chú gia hạn / Phụ lục" 
                placeholder="Ghi chú về các thay đổi điều khoản khác..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                className="min-h-[100px]"
            />

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                <Button className="flex-1 gap-2 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    <ArrowRightLeft size={16}/> 
                    {loading ? "Đang xử lý..." : "Xác nhận Gia Hạn"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, toast } from '../../ui';
import { DollarSign, FileUp } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreatePaymentTermModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        periodName: '', // e.g., Kỳ tháng 12
        dueDate: new Date().toISOString().split('T')[0],
        amountTy: '', // expected amount Ty
    });

    const handleSubmit = () => {
        const amount = parseFloat(formData.amountTy);
        if (!formData.periodName.trim()) return toast("Vui lòng nhập tên kỳ hạn", "error");
        if (!amount || amount <= 0) return toast("Số tiền phải lớn hơn 0", "error");

        setLoading(true);
        setTimeout(() => {
            toast("Đã thêm kỳ hạn mới thành công!", "success");
            setLoading(false);
            onClose();
        }, 800);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm Kỳ Hạn Thanh Toán" size="md">
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Tên kỳ hạn"
                        placeholder="VD: Kỳ tháng 12/2023"
                        value={formData.periodName}
                        onChange={e => setFormData({ ...formData, periodName: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Hạn thanh toán"
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                        <Input
                            label="Số tiền cấn thu (Triệu)"
                            type="number" step="0.001"
                            icon={<DollarSign size={14} />}
                            value={formData.amountTy}
                            onChange={e => setFormData({ ...formData, amountTy: e.target.value })}
                            placeholder="0.000"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chứng từ (Tùy chọn)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                        <FileUp size={24} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">Kéo thả file hợp đồng, phụ lục, giấy báo nhắc nợ...</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                    <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Lưu kỳ hạn"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

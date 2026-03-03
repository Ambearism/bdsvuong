import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input } from '../../../components/ui';

interface AdjustCareFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFee: number;
    onSave: (fee: number) => Promise<void>;
}

export const AdjustCareFeeModal: React.FC<AdjustCareFeeModalProps> = ({ isOpen, onClose, currentFee, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [fee, setFee] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setFee(currentFee.toString());
        }
    }, [isOpen, currentFee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numFee = parseFloat(fee);
        if (isNaN(numFee) || numFee < 0) return;

        setLoading(true);
        await onSave(numFee);
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh mức phí Care">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mức phí mới (Triệu VNĐ / Tháng)</label>
                    <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={fee}
                        onChange={(e: any) => setFee(e.target.value)}
                        required
                        placeholder="Ví dụ: 5.5"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Lưu ý: Việc điều chỉnh sẽ áp dụng cho các kỳ thanh toán tiếp theo.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600">
                        {loading ? 'Đang lưu...' : 'Áp dụng mức phí mới'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

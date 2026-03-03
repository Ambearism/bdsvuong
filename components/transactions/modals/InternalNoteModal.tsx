
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Textarea, toast } from '../../ui';
import { Transaction } from '../../../types';
import { Save } from 'lucide-react';

interface Props {
  tx: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InternalNoteModal: React.FC<Props> = ({ tx, isOpen, onClose, onSuccess }) => {
  const [note, setNote] = useState(tx.internalNote || '');

  const handleSave = () => {
    tx.internalNote = note;
    tx.updatedAt = new Date().toISOString();
    toast("Đã lưu ghi chú thành công");
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ghi chú GD: ${tx.id}`} size="md">
        <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 leading-relaxed">
                Ghi chú này là <b>nội bộ</b>, chỉ quản trị viên và sale phụ trách mới có thể xem. Hãy điền các lưu ý quan trọng về tiến độ thanh toán hoặc rủi ro pháp lý.
            </div>
            <Textarea 
                placeholder="Nhập ghi chú chi tiết tại đây..."
                className="min-h-[200px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                <Button variant="primary" className="flex-1 gap-2" onClick={handleSave}>
                    <Save size={16}/> Lưu Ghi Chú
                </Button>
            </div>
        </div>
    </Modal>
  );
};

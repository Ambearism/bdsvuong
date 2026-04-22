
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Textarea, toast, Select } from '../../ui';
import { Lease } from '../../../types';
import { FileText, Save } from 'lucide-react';

interface Props {
  lease: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DebtNoteModal: React.FC<Props> = ({ lease, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: 'general',
    amountMillion: ''
  });

  const handleSubmit = () => {
    if (!formData.title) return toast("Vui lòng nhập tiêu đề", "error");
    
    // Mock save
    toast("Đã thêm ghi chú nợ", "success");
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Ghi Chú Nợ (Debt Note)" size="md">
        <div className="p-6 space-y-5">
            <Input 
                label="Tiêu đề" 
                placeholder="VD: Phạt chậm thanh toán, Phí sửa chữa..." 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                autoFocus
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="Phân loại"
                    value={formData.tag}
                    onChange={v => setFormData({...formData, tag: v})}
                    options={[
                        { label: 'Chung', value: 'general' },
                        { label: 'Phạt', value: 'penalty' },
                        { label: 'Phí dịch vụ', value: 'fee' },
                        { label: 'Khác', value: 'other' }
                    ]}
                />
                <Input 
                    label="Số tiền (nếu có - Triệu)" 
                    type="number"
                    value={formData.amountMillion} 
                    onChange={e => setFormData({...formData, amountMillion: e.target.value})} 
                />
            </div>

            <Textarea 
                label="Nội dung chi tiết" 
                placeholder="Mô tả chi tiết nguyên nhân, cam kết của khách..."
                rows={4}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})} 
            />

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit}>
                    <Save size={16}/> Lưu Ghi Chú
                </Button>
            </div>
        </div>
    </Modal>
  );
};

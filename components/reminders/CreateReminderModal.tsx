
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../ui';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers';
import { MOCK_USERS } from '../../data';
import { Reminder } from '../../types';
import { createReminder } from '../../data/reminderFactory';
import { Bell, Calendar, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReminderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Reminder>>({
      type: 'other',
      level: 'medium',
      title: '',
      description: '',
      dueDate: '',
      ownerId: '',
      assigneeName: ''
  });

  const handleSubmit = async () => {
      if (!formData.title || !formData.dueDate) return toast("Vui lòng điền đủ thông tin", "error");
      
      setLoading(true);
      const owner = MOCK_CUSTOMERS.find(c => c.id === formData.ownerId);
      
      const newReminder: any = {
          id: `REM-${Date.now()}`,
          code: `R-MAN-${Date.now().toString().slice(-4)}`,
          status: 'new',
          checklist: [],
          logs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerName: owner?.name,
          ...formData
      };

      await createReminder(newReminder);
      setLoading(false);
      toast("Đã tạo nhắc việc thành công", "success");
      onSuccess();
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Nhắc Việc Thủ Công" size="md">
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="Loại nhắc việc"
                    value={formData.type}
                    onChange={(v) => setFormData({...formData, type: v as any})}
                    options={[
                        { label: 'Thu Tiền', value: 'payment' },
                        { label: 'Pháp Lý / Thuế', value: 'tax' },
                        { label: 'Chăm sóc KH', value: 'care' },
                        { label: 'Khác', value: 'other' }
                    ]}
                />
                <Select 
                    label="Mức độ ưu tiên"
                    value={formData.level}
                    onChange={(v) => setFormData({...formData, level: v as any})}
                    options={[
                        { label: 'Bình thường', value: 'medium' },
                        { label: 'Cao', value: 'high' },
                        { label: 'Khẩn cấp', value: 'critical' }
                    ]}
                />
            </div>

            <Input 
                label="Tiêu đề" 
                placeholder="VD: Gọi điện chúc mừng sinh nhật..." 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Hạn xử lý (Due Date)" 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
                <Select 
                    label="Người phụ trách"
                    value={formData.assigneeName}
                    onChange={(v) => setFormData({...formData, assigneeName: v})}
                    options={MOCK_USERS.map(u => ({ label: u.label, value: u.label }))}
                />
            </div>

            <Select 
                label="Liên quan Khách hàng (Optional)"
                value={formData.ownerId}
                onChange={(v) => setFormData({...formData, ownerId: v})}
                options={MOCK_CUSTOMERS.map(c => ({ label: c.name, value: c.id }))}
                showClear
            />

            <Textarea 
                label="Nội dung chi tiết" 
                placeholder="Mô tả công việc cần làm..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    <Bell size={16}/> Tạo Nhắc Việc
                </Button>
            </div>
        </div>
    </Modal>
  );
};

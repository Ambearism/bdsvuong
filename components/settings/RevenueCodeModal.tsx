
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, Switch } from '../ui';
import { RevenueCode, RevenueCategory } from '../../types';
import { Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: RevenueCode;
  onSave: (code: RevenueCode) => void;
}

const CATEGORIES: { label: string, value: RevenueCategory }[] = [
    { label: 'Tiền Thuê (Rent)', value: 'RENT' },
    { label: 'Dịch Vụ (Service)', value: 'SERVICE' },
    { label: 'Tiện Ích (Utility)', value: 'UTILITY' },
    { label: 'Phạt (Penalty)', value: 'PENALTY' },
    { label: 'Cọc Mất (Forfeit)', value: 'DEPOSIT_FORFEIT' },
    { label: 'Khác (Other)', value: 'OTHER' },
];

export const RevenueCodeModal: React.FC<Props> = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState<Partial<RevenueCode>>({
      code: '',
      name: '',
      category: 'OTHER',
      isTaxable: true,
      description: '',
      isSystem: false
  });

  useEffect(() => {
      if (data && data.id) {
          setFormData(data);
      } else {
          setFormData({
            code: '', name: '', category: 'OTHER', isTaxable: true, description: '', isSystem: false
          });
      }
  }, [data, isOpen]);

  const handleSubmit = () => {
      if (!formData.code || !formData.name) return;
      onSave({
          ...formData,
          id: formData.id || '', // Will be handled by factory if empty
      } as RevenueCode);
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "Chỉnh sửa Revenue Code" : "Thêm Revenue Code"} size="md">
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Mã (Code)" 
                    placeholder="VD: RENT_APT" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    disabled={formData.isSystem}
                />
                <Select 
                    label="Nhóm (Category)"
                    value={formData.category}
                    onChange={v => setFormData({...formData, category: v as any})}
                    options={CATEGORIES}
                />
            </div>
            
            <Input 
                label="Tên hiển thị" 
                placeholder="VD: Tiền thuê căn hộ..." 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
            />

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                    <span className="text-sm font-bold text-slate-700 block">Chịu thuế (Taxable)</span>
                    <span className="text-xs text-slate-500">Mặc định tính vào doanh thu chịu thuế</span>
                </div>
                <Switch checked={!!formData.isTaxable} onChange={v => setFormData({...formData, isTaxable: v})} />
            </div>

            <Textarea 
                label="Mô tả / Ghi chú" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit}>
                    <Tag size={16}/> Lưu Mã
                </Button>
            </div>
        </div>
    </Modal>
  );
};

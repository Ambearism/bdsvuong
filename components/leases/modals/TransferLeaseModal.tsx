
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../../ui';
import { Lease } from '../../../types';
import { transferLease } from '../../../data/leaseFactory';
import { MOCK_CUSTOMERS } from '../../../data/mockCustomers';
import { User, ArrowRightLeft, Calendar, FileText } from 'lucide-react';

interface Props {
  lease: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferLeaseModal: React.FC<Props> = ({ lease, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('change_tenant');
  
  const [formData, setFormData] = useState({
    newTenantId: '',
    transferDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = async () => {
    if (type === 'change_tenant' && !formData.newTenantId) return toast("Vui lòng chọn khách mới", "error");
    
    setLoading(true);
    try {
        await transferLease(lease.id, {
            type,
            newTenantId: formData.newTenantId,
            transferDate: formData.transferDate,
            note: formData.note
        });
        toast(`Chuyển nhượng thành công!`, "success");
        onSuccess();
        onClose();
    } catch (e) {
        toast("Lỗi xử lý", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển Nhượng Hợp Đồng" size="md">
        <div className="p-6 space-y-6">
            <Select 
                label="Loại hình chuyển nhượng"
                value={type}
                onChange={setType}
                options={[
                    { label: 'Đổi Khách Thuê (Change Tenant)', value: 'change_tenant' },
                    { label: 'Đổi Chủ Nhà (Change Owner)', value: 'change_owner' },
                    { label: 'Đổi Căn/Đơn vị (Change Unit)', value: 'change_unit' },
                ]}
            />

            {type === 'change_tenant' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <Select 
                        label="Khách nhận chuyển nhượng"
                        placeholder="Tìm kiếm khách hàng..."
                        options={MOCK_CUSTOMERS.filter(c => c.id !== lease.tenantId).map(c => ({ label: `${c.name} - ${c.phone}`, value: c.id }))}
                        value={formData.newTenantId}
                        onChange={(v) => setFormData({...formData, newTenantId: v})}
                    />
                </div>
            )}

            <Input 
                label="Ngày hiệu lực (Effective Date)" 
                type="date" 
                value={formData.transferDate} 
                onChange={(e) => setFormData({...formData, transferDate: e.target.value})}
                description="Ngày bắt đầu tính cho bên mới. Dữ liệu cũ sẽ được chốt đến ngày trước đó."
            />

            <Textarea 
                label="Ghi chú / Lý do" 
                placeholder="Nhập lý do chuyển nhượng..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
            />

            <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={loading}>
                    <ArrowRightLeft size={16}/> 
                    {loading ? "Đang xử lý..." : "Xác nhận"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

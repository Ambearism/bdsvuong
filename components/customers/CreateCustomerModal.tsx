
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../ui';
import { Customer, CustomerSegment, CustomerSource } from '../../data/mockCustomers';
import { User, Phone, Mail, Tag, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: Customer) => void;
}

export const CreateCustomerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    segment: 'chu_nha' as CustomerSegment,
    source: 'khac' as CustomerSource,
    address: '',
    note: ''
  });

  const handleSubmit = () => {
    if (!formData.name) return toast("Vui lòng nhập tên khách hàng", "error");
    if (!formData.phone) return toast("Vui lòng nhập số điện thoại", "error");

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        const newCustomer: Customer = {
            id: `cus_new_${Date.now()}`,
            code: `KH${Math.floor(1000 + Math.random() * 9000)}`,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            segment: formData.segment,
            source: formData.source,
            status: 'tiem_nang', // Default status
            assigneeName: 'Bạn (Admin)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        toast("Đã thêm khách hàng mới thành công!", "success");
        onSuccess(newCustomer);
        setLoading(false);
        onClose();
        // Reset form
        setFormData({ name: '', phone: '', email: '', segment: 'chu_nha', source: 'khac', address: '', note: '' });
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Khách Hàng Mới" size="lg">
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Họ và Tên" 
                    placeholder="VD: Nguyễn Văn A" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    autoFocus
                    icon={<User size={16}/>}
                />
                <Input 
                    label="Số điện thoại" 
                    placeholder="VD: 0912 xxx xxx" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                    icon={<Phone size={16}/>}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Email" 
                    placeholder="email@example.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    icon={<Mail size={16}/>}
                />
                <Input 
                    label="Địa chỉ liên hệ" 
                    placeholder="VD: Hà Đông, Hà Nội" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    icon={<MapPin size={16}/>}
                />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={14}/> Phân loại khách hàng
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="Nhóm khách hàng"
                        value={formData.segment}
                        onChange={v => setFormData({...formData, segment: v as CustomerSegment})}
                        options={[
                            {label: 'Chủ nhà', value: 'chu_nha'},
                            {label: 'Nhà đầu tư', value: 'nha_dau_tu'},
                            {label: 'Khách mua ở', value: 'mua_o'},
                            {label: 'Khách thuê', value: 'thue'},
                            {label: 'Môi giới / CTV', value: 'ctv'},
                            {label: 'Khác', value: 'khac'}
                        ]}
                    />
                    <Select 
                        label="Nguồn gốc"
                        value={formData.source}
                        onChange={v => setFormData({...formData, source: v as CustomerSource})}
                        options={[
                            {label: 'Hotline', value: 'hotline'},
                            {label: 'Facebook', value: 'facebook'},
                            {label: 'Zalo', value: 'zalo'},
                            {label: 'Giới thiệu', value: 'gioi_thieu'},
                            {label: 'Website', value: 'website'},
                            {label: 'Văn phòng', value: 'van_phong'},
                            {label: 'Khác', value: 'khac'}
                        ]}
                    />
                </div>
            </div>

            <Textarea 
                label="Ghi chú thêm" 
                placeholder="Nhu cầu sơ bộ, tính cách, giờ rảnh..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                rows={3}
            />

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu Khách Hàng"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};


import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../ui';
import { Property } from '../../data/mockProperties';
import { Building, MapPin, DollarSign, Ruler, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProperty: Property) => void;
}

export const CreatePropertyModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    ward: '',
    type: 'chung_cu',
    purpose: 'ban',
    areaM2: '',
    price: '', // Total price in Billion
    legalStatus: 'co_so_do'
  });

  const handleSubmit = () => {
    if (!formData.name) return toast("Vui lòng nhập tên BĐS", "error");
    if (!formData.areaM2) return toast("Vui lòng nhập diện tích", "error");

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        const area = parseFloat(formData.areaM2) || 0;
        const totalTy = parseFloat(formData.price) || 0;
        const pricePerM2 = area > 0 ? (totalTy * 1000) / area : 0; // Million per m2

        const newProp: Property = {
            id: `prop_new_${Date.now()}`,
            code: `P${Math.floor(1000 + Math.random() * 9000)}`,
            name: formData.name,
            project: formData.project || 'Nhà lẻ',
            ward: formData.ward || 'Chưa cập nhật',
            type: formData.type as any,
            purpose: formData.purpose as any,
            areaM2: area,
            legalStatus: formData.legalStatus as any,
            // Dynamic pricing fields
            sellTotalTy: formData.purpose === 'ban' ? totalTy : undefined,
            sellPricePerM2: formData.purpose === 'ban' ? pricePerM2 : undefined,
            rentTotalTy: formData.purpose === 'cho_thue' ? totalTy : undefined,
            rentPricePerM2: formData.purpose === 'cho_thue' ? pricePerM2 : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        toast("Đã thêm BĐS mới thành công!", "success");
        onSuccess(newProp);
        setLoading(false);
        onClose();
        // Reset
        setFormData({ name: '', project: '', ward: '', type: 'chung_cu', purpose: 'ban', areaM2: '', price: '', legalStatus: 'co_so_do' });
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Bất Động Sản Mới" size="lg">
        <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <Input 
                        label="Tên BĐS / Tiêu đề tin" 
                        placeholder="VD: Căn hộ 2PN tòa S2.01 Ocean Park..." 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                        autoFocus
                        icon={<Building size={16}/>}
                    />
                </div>
                
                <Input 
                    label="Dự án / Khu vực" 
                    placeholder="VD: Vinhomes Ocean Park" 
                    value={formData.project} 
                    onChange={e => setFormData({...formData, project: e.target.value})}
                    icon={<MapPin size={16}/>}
                />
                
                <Input 
                    label="Phường / Xã" 
                    placeholder="VD: Đa Tốn" 
                    value={formData.ward} 
                    onChange={e => setFormData({...formData, ward: e.target.value})}
                />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="Mục đích"
                        value={formData.purpose}
                        onChange={v => setFormData({...formData, purpose: v})}
                        options={[
                            {label: 'Bán (Sell)', value: 'ban'},
                            {label: 'Cho Thuê (Rent)', value: 'cho_thue'}
                        ]}
                    />
                    <Select 
                        label="Loại hình"
                        value={formData.type}
                        onChange={v => setFormData({...formData, type: v})}
                        options={[
                            {label: 'Chung cư', value: 'chung_cu'},
                            {label: 'Nhà riêng', value: 'nha_rieng'},
                            {label: 'Biệt thự', value: 'biet_thu'},
                            {label: 'Liền kề', value: 'lien_ke'},
                            {label: 'Đất nền', value: 'dat_nen'},
                            {label: 'Shophouse', value: 'shophouse_kiosk'},
                            {label: 'Khác', value: 'bds_khac'}
                        ]}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                    <Input 
                        label="Diện tích (m²)" 
                        type="number" 
                        value={formData.areaM2} 
                        onChange={e => setFormData({...formData, areaM2: e.target.value})}
                        required
                        icon={<Ruler size={16}/>}
                    />
                </div>
                <div className="relative">
                    <Input 
                        label={`Giá ${formData.purpose === 'ban' ? 'Bán' : 'Thuê'} (Tỷ)`}
                        type="number" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.0"
                        icon={<DollarSign size={16}/>}
                    />
                </div>
                <Select 
                    label="Pháp lý"
                    value={formData.legalStatus}
                    onChange={v => setFormData({...formData, legalStatus: v})}
                    options={[
                        {label: 'Đã có sổ đỏ', value: 'co_so_do'},
                        {label: 'HĐMB / Tiến độ', value: 'dong_tien_do'},
                        {label: 'Chưa có sổ', value: 'chua_so_do'}
                    ]}
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                <Button className="flex-1 shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu Bất Động Sản"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

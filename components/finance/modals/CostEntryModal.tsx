
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast } from '../../ui';
import { CostEntry, CostCategoryGroup, CostCategoryItem } from '../../../types';
import { getCostGroups, getCostItems } from '../../../data/settingsFactory';
import { saveCostEntry } from '../../../data/costFactory';
import { MOCK_PROPERTIES } from '../../../data/mockProperties';
import { MOCK_CUSTOMERS } from '../../../data/mockCustomers';
import { DollarSign, FileUp, Info, AlertTriangle, Building, Tag, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLeaseId?: string; // New prop
  initialAssetId?: string; // New prop
}

export const CostEntryModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialLeaseId, initialAssetId }) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<CostCategoryGroup[]>([]);
  const [items, setItems] = useState<CostCategoryItem[]>([]);
  
  // Form Data
  const [formData, setFormData] = useState<Partial<CostEntry>>({
      date: new Date().toISOString().split('T')[0],
      amountTy: 0,
      groupId: '',
      itemId: '',
      assetId: '',
      tenantId: '',
      note: '',
      attachments: []
  });
  const [amountMillion, setAmountMillion] = useState('');

  // Initial Load & Reset
  useEffect(() => {
      if(isOpen) {
          Promise.all([getCostGroups(), getCostItems()]).then(([g, i]) => {
              setGroups(g.filter(x => x.isActive));
              setItems(i.filter(x => x.isActive));
          });

          // Reset form with context if provided
          setFormData({
              date: new Date().toISOString().split('T')[0],
              amountTy: 0,
              groupId: '',
              itemId: '',
              assetId: initialAssetId || '',
              leaseId: initialLeaseId || '',
              tenantId: '', // Could auto-fill if we had lease details passed, but user can select
              note: '',
              attachments: []
          });
          setAmountMillion('');
      }
  }, [isOpen, initialLeaseId, initialAssetId]);

  // Dependent Logic
  const filteredItems = items.filter(i => i.groupId === formData.groupId);
  const selectedItem = items.find(i => i.id === formData.itemId);

  const handleSubmit = async () => {
      if (!formData.assetId) return toast("Vui lòng chọn Bất động sản", "error");
      if (!formData.groupId || !formData.itemId) return toast("Vui lòng chọn loại chi phí", "error");
      if (!formData.amountTy || formData.amountTy <= 0) return toast("Số tiền phải lớn hơn 0", "error");
      
      if (selectedItem?.tenantRelatedFlag && !formData.tenantId) {
          return toast("Loại chi phí này yêu cầu chọn Khách thuê liên quan", "error");
      }
      if (selectedItem?.requiresAttachment && (!formData.attachments || formData.attachments.length === 0)) {
          return toast("Loại chi phí này bắt buộc đính kèm chứng từ", "error");
      }

      setLoading(true);
      const newEntry: CostEntry = {
          id: '', // Will be generated
          refNo: `EXP-${Date.now()}`,
          date: formData.date!,
          amountTy: formData.amountTy!,
          groupId: formData.groupId!,
          itemId: formData.itemId!,
          assetId: formData.assetId!,
          leaseId: formData.leaseId, // Include lease ID
          tenantId: formData.tenantId,
          note: formData.note || '',
          attachments: formData.attachments || [],
          createdBy: 'Admin', // In real app: Current User
          createdAt: new Date().toISOString()
      };

      await saveCostEntry(newEntry);
      setLoading(false);
      toast("Đã lưu chi phí thành công", "success");
      onSuccess();
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ghi Nhận Chi Phí Vận Hành" size="lg">
        <div className="p-6 space-y-6">
            {/* Context Banner */}
            {initialLeaseId && (
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center gap-2 text-xs text-indigo-800 font-medium">
                    <Lock size={12} />
                    Đang ghi nhận chi phí cho Hợp đồng: <b>{initialLeaseId}</b>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Ngày phát sinh" 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                />
                
                <div className="relative">
                    <Input 
                        label="Số tiền (Triệu VNĐ)" 
                        type="number"
                        step="0.1"
                        value={amountMillion}
                        onChange={e => {
                            setAmountMillion(e.target.value);
                            setFormData({...formData, amountTy: (parseFloat(e.target.value) || 0) / 1000});
                        }}
                        className="font-bold text-rose-700 pr-8"
                        icon={<DollarSign size={14}/>}
                    />
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
                    <Building size={16} className="text-indigo-600"/> Thông tin tài sản & Đối tượng
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                        label="Bất động sản (Asset)" 
                        value={formData.assetId}
                        onChange={v => setFormData({...formData, assetId: v})}
                        options={MOCK_PROPERTIES.map(p => ({ label: p.name, value: p.id }))}
                        placeholder="Chọn BĐS..."
                        disabled={!!initialAssetId} // Disable if passed from props
                        className={initialAssetId ? "bg-slate-100" : ""}
                    />
                    
                    {/* Conditional Tenant Select */}
                    {selectedItem?.tenantRelatedFlag && (
                        <div className="animate-in fade-in slide-in-from-left-2">
                            <Select 
                                label="Khách thuê liên quan (Required)"
                                value={formData.tenantId}
                                onChange={v => setFormData({...formData, tenantId: v})}
                                options={MOCK_CUSTOMERS.map(c => ({ label: c.name, value: c.id }))}
                                placeholder="Chọn khách thuê..."
                                className="border-amber-300 bg-amber-50"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
                    <Tag size={16} className="text-indigo-600"/> Phân loại chi phí
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                        label="1. Nhóm chi phí" 
                        value={formData.groupId}
                        onChange={v => setFormData({...formData, groupId: v, itemId: ''})}
                        options={groups.map(g => ({ label: g.name, value: g.id }))}
                        placeholder="Chọn nhóm..."
                    />
                    <Select 
                        label="2. Loại chi phí" 
                        value={formData.itemId}
                        onChange={v => setFormData({...formData, itemId: v})}
                        options={filteredItems.map(i => ({ label: i.name, value: i.id }))}
                        placeholder="Chọn mục chi phí..."
                        disabled={!formData.groupId}
                    />
                </div>
                {selectedItem && (
                    <div className="flex gap-3 text-xs text-slate-500 bg-white p-3 rounded-lg border border-indigo-100">
                        <Info size={16} className="shrink-0 text-indigo-500"/>
                        <div>
                            <span className="font-bold block text-indigo-900 mb-1">Mô tả:</span>
                            {selectedItem.description || "Không có mô tả"}
                            {selectedItem.requiresAttachment && (
                                <div className="mt-2 text-rose-600 font-bold flex items-center gap-1">
                                    <AlertTriangle size={12}/> Yêu cầu đính kèm chứng từ
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Textarea 
                label="Ghi chú chi tiết" 
                placeholder="VD: Thay bóng đèn phòng khách, mua tại cửa hàng điện nước..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
            />

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                <FileUp size={24} className="mb-2 opacity-50"/>
                <span className="text-xs font-medium">Nhấn hoặc kéo thả hóa đơn/chứng từ vào đây</span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu Chi Phí"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

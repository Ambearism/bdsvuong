
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast, Badge } from '../../ui';
import { MOCK_CUSTOMERS } from '../../../data/mockCustomers';
import { MOCK_PROPERTIES } from '../../../data/mockProperties';
import { MOCK_USERS } from '../../../data';
import { Transaction, TransactionStatus } from '../../../types';
import { getTransactionsStore, syncStatusOnTransactionUpdate } from '../../../data/transactionFactory';
import { User, Building, DollarSign, ArrowRight, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTransactionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  const [formData, setFormData] = useState({
    status: 'dat_coc' as TransactionStatus,
    dealValueTy: '',
    depositAmountTy: '',
    commissionFee: '',
    assigneeName: '',
    internalNote: ''
  });

  const customer = MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId);
  const property = MOCK_PROPERTIES.find(p => p.id === selectedPropertyId);

  const handleSubmit = () => {
      if (!customer || !property) return;
      
      const newTx: Transaction = {
          id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: "manual_admin",
          customerId: customer.id,
          customerCode: customer.code,
          customerName: customer.name,
          customerPhone: customer.phone,
          propertyId: property.id,
          propertyCode: property.code,
          propertyName: property.name,
          propertyType: property.type.replace('_', ' '),
          purpose: property.purpose,
          project: property.project,
          ward: property.ward,
          areaM2: property.areaM2,
          dealValueTy: Number(formData.dealValueTy),
          depositAmountTy: Number(formData.depositAmountTy),
          commissionFee: formData.commissionFee,
          status: formData.status,
          legalStatus: property.legalStatus,
          assigneeName: formData.assigneeName || 'Admin',
          internalNote: formData.internalNote,
          documents: [],
          hasContract: false,
          hasDepositProof: Number(formData.depositAmountTy) > 0,
          riskFlag: "ok"
      };

      const store = getTransactionsStore();
      store.unshift(newTx);
      syncStatusOnTransactionUpdate(newTx);
      
      toast("Tạo giao dịch thành công!");
      onSuccess();
      handleClose();
  };

  const handleClose = () => {
      setStep(1);
      setSelectedCustomerId('');
      setSelectedPropertyId('');
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo Giao Dịch Mới" size="xl">
        <div className="flex flex-col h-full max-h-[80vh]">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className={`flex items-center gap-2 text-sm font-bold ${step === 1 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 1 ? 'border-indigo-600' : 'border-emerald-600 bg-emerald-600 text-white'}`}>
                        {step === 1 ? '1' : <Check size={12}/>}
                    </div>
                    <span>Chọn KH & BĐS</span>
                </div>
                <div className="w-12 h-px bg-slate-200" />
                <div className={`flex items-center gap-2 text-sm font-bold ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'border-indigo-600' : 'border-slate-300'}`}>2</div>
                    <span>Thông tin giao dịch</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {step === 1 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><User size={14}/> 1. Chọn Khách Hàng</label>
                            <Select 
                                value={selectedCustomerId}
                                onChange={setSelectedCustomerId}
                                options={MOCK_CUSTOMERS.map(c => ({ label: `${c.name} (${c.phone}) - ${c.code}`, value: c.id }))}
                                placeholder="Tìm kiếm tên, SĐT hoặc mã KH..."
                            />
                            {customer && (
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center animate-in zoom-in-95">
                                    <div className="text-sm">
                                        <div className="font-bold text-indigo-900">{customer.name}</div>
                                        <div className="text-indigo-600 mt-0.5">{customer.phone} • {customer.code}</div>
                                    </div>
                                    <Badge variant="indigo" className="capitalize">{customer.segment.replace('_', ' ')}</Badge>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Building size={14}/> 2. Chọn Bất Động Sản</label>
                            <Select 
                                value={selectedPropertyId}
                                onChange={setSelectedPropertyId}
                                options={MOCK_PROPERTIES.map(p => ({ label: `${p.name} (${p.code}) - ${p.project}`, value: p.id }))}
                                placeholder="Tìm kiếm tên hoặc mã BĐS..."
                            />
                            {property && (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 animate-in zoom-in-95">
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm">
                                            <div className="font-bold text-emerald-900">{property.name}</div>
                                            <div className="text-emerald-600 mt-0.5">{property.project} • {property.code}</div>
                                        </div>
                                        <Badge variant={property.purpose === 'ban' ? 'warning' : 'success'}>{property.purpose === 'ban' ? 'Bán' : 'Thuê'}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100 text-xs font-medium text-emerald-800">
                                        <span>Diện tích: {property.areaM2} m²</span>
                                        <span>Pháp lý: {property.legalStatus.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
                        <Select 
                            label="Trạng thái giao dịch"
                            value={formData.status}
                            onChange={(v) => setFormData({...formData, status: v as any})}
                            options={[
                                { label: 'Đặt Cọc', value: 'dat_coc' },
                                { label: 'Đang Xử Lý HS', value: 'dang_xu_ly_hs' },
                                { label: 'Ký Hợp Đồng', value: 'ky_hop_dong' },
                                { label: 'Hoàn Tất', value: 'hoan_tat' }
                            ]}
                        />
                         <Select 
                            label="Sale phụ trách"
                            value={formData.assigneeName}
                            onChange={(v) => setFormData({...formData, assigneeName: v})}
                            options={MOCK_USERS.map(u => ({ label: u.label, value: u.label }))}
                        />
                        <Input 
                            label="Giá trị Deal (Tỷ)" 
                            type="number" 
                            placeholder="VD: 2.88" 
                            value={formData.dealValueTy} 
                            onChange={(e) => setFormData({...formData, dealValueTy: e.target.value})} 
                        />
                        <Input 
                            label="Tiền cọc thực tế (Tỷ)" 
                            type="number" 
                            placeholder="VD: 0.1" 
                            value={formData.depositAmountTy} 
                            onChange={(e) => setFormData({...formData, depositAmountTy: e.target.value})} 
                        />
                        <Input 
                            label="Phí hoa hồng" 
                            placeholder="VD: 3% hoặc 100tr" 
                            className="col-span-2"
                            value={formData.commissionFee} 
                            onChange={(e) => setFormData({...formData, commissionFee: e.target.value})} 
                        />
                        <Textarea 
                            label="Ghi chú nội bộ" 
                            placeholder="Lưu ý về tiến độ, hồ sơ, khách hàng..." 
                            className="col-span-2"
                            value={formData.internalNote}
                            onChange={(e) => setFormData({...formData, internalNote: e.target.value})}
                        />
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                <Button variant="ghost" onClick={handleClose}>Hủy bỏ</Button>
                <div className="flex gap-2">
                    {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>}
                    <Button 
                        disabled={step === 1 && (!selectedCustomerId || !selectedPropertyId)}
                        onClick={() => step === 1 ? setStep(2) : handleSubmit()}
                        className="gap-2"
                    >
                        {step === 1 ? 'Tiếp tục' : 'Tạo Giao Dịch'}
                        {step === 1 && <ArrowRight size={16}/>}
                    </Button>
                </div>
            </div>
        </div>
    </Modal>
  );
};

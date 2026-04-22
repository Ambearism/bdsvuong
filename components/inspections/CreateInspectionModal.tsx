
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, Badge } from '../ui';
import { InspectionCategory, RiskLevel } from '../../types';
import { Calendar, AlertTriangle, Shield, Check, FileUp, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

export const CreateInspectionModal: React.FC<Props> = ({ isOpen, onClose, propertyId, onSuccess }) => {
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    category: 'other' as InspectionCategory,
    riskLevel: 'low' as RiskLevel,
    purposeCompliance: 'yes' as 'yes' | 'no',
    findings: '',
    recommendation: '',
    nextInspectionDate: '',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập Biên Bản Kiểm Tra Tài Sản" size="lg">
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Ngày kiểm tra" type="date" value={formData.inspectionDate} onChange={e => setFormData({...formData, inspectionDate: e.target.value})} />
                <Select 
                    label="Hạng mục chính" 
                    value={formData.category} 
                    onChange={v => setFormData({...formData, category: v as any})}
                    options={[
                        { label: 'Hệ thống Điện', value: 'electric' },
                        { label: 'Hệ thống Nước', value: 'water' },
                        { label: 'Kết cấu & Sơn bả', value: 'structure' },
                        { label: 'Nội thất & Gia dụng', value: 'interior' },
                        { label: 'Khác', value: 'other' }
                    ]}
                />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mức độ rủi ro</label>
                    <div className="flex gap-2">
                        {[
                            { v: 'low', l: 'Thấp', c: 'bg-emerald-500' },
                            { v: 'medium', l: 'Trung bình', c: 'bg-amber-500' },
                            { v: 'high', l: 'Cao', c: 'bg-rose-500' }
                        ].map(r => (
                            <button 
                                key={r.v}
                                onClick={() => setFormData({...formData, riskLevel: r.v as any})}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${formData.riskLevel === r.v ? 'bg-white border-slate-900 shadow-sm ring-2 ring-slate-100' : 'bg-transparent border-slate-200 text-slate-500'}`}
                            >
                                <div className={`w-2 h-2 rounded-full inline-block mr-2 ${r.c}`} /> {r.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tuân thủ mục đích (Sử dụng đúng)?</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setFormData({...formData, purposeCompliance: 'yes'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${formData.purposeCompliance === 'yes' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-500'}`}
                        >Đúng mục đích</button>
                        <button 
                            onClick={() => setFormData({...formData, purposeCompliance: 'no'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${formData.purposeCompliance === 'no' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-slate-500'}`}
                        >Sai mục đích</button>
                    </div>
                </div>
            </div>

            <Textarea label="Phát hiện thực tế" placeholder="Mô tả các vấn đề quan sát được..." rows={3} value={formData.findings} onChange={e => setFormData({...formData, findings: e.target.value})} />
            <Textarea label="Khuyến nghị xử lý" placeholder="Cần sửa chữa gì, ai làm, bao giờ xong..." rows={2} value={formData.recommendation} onChange={e => setFormData({...formData, recommendation: e.target.value})} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <Input label="Hẹn ngày kiểm tra tới" type="date" value={formData.nextInspectionDate} onChange={e => setFormData({...formData, nextInspectionDate: e.target.value})} />
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ảnh hiện trạng</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-2 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer h-10">
                        <FileUp size={16} className="mr-2"/> <span className="text-[10px] font-bold uppercase">Upload Ảnh</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 gap-2 shadow-lg shadow-indigo-100" onClick={onSuccess}>
                    <Check size={18}/> Lưu biên bản
                </Button>
            </div>
        </div>
    </Modal>
  );
};

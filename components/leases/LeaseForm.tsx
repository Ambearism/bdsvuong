
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea, Badge, toast } from '../ui';
import { LeaseDraft, LeaseScheduleItem, PaymentCycle, DueDateRule } from '../../types';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers';
import { MOCK_PROPERTIES } from '../../data/mockProperties';
import { generateSchedule, validateLeaseOverlap, saveLease } from '../../data/leaseFactory';
import { formatCurrency, cn } from '../../utils';
import { Calendar, DollarSign, User, Building, Clock, Info, ShieldCheck, AlertCircle, Save, X, RefreshCw, FileUp, Paperclip } from 'lucide-react';

interface Props {
  initialData?: Partial<LeaseDraft>;
  onCancel: () => void;
  onSuccess: () => void;
}

export const LeaseForm: React.FC<Props> = ({ initialData, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<LeaseDraft>({
    ownerId: '', tenantId: '', propertyId: '', unitCode: '',
    rentAmountTy: 0, depositAmountTy: 0, currency: 'VND',
    cycle: '1_month', startDate: '', endDate: '',
    dueDateRule: 'fixed_day', dueDayOfMonth: 1, graceDays: 3,
    status: 'active', notes: '', schedule: [], isAutoSchedule: true,
    ...initialData
  });

  // Local state for "Triệu" inputs to improve UX
  const [rentMillion, setRentMillion] = useState<string>(initialData?.rentAmountTy ? (initialData.rentAmountTy * 1000).toString() : '');
  const [depositMillion, setDepositMillion] = useState<string>(initialData?.depositAmountTy ? (initialData.depositAmountTy * 1000).toString() : '');
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert Million -> Billion for internal state
  const handleRentChange = (val: string) => {
      setRentMillion(val);
      const ty = parseFloat(val) / 1000;
      setFormData(prev => ({ ...prev, rentAmountTy: isNaN(ty) ? 0 : ty }));
  };

  const handleDepositChange = (val: string) => {
      setDepositMillion(val);
      const ty = parseFloat(val) / 1000;
      setFormData(prev => ({ ...prev, depositAmountTy: isNaN(ty) ? 0 : ty }));
  };

  // Auto-fill owner from property if possible (Mock logic)
  useEffect(() => {
      if (formData.propertyId && !formData.ownerId) {
          // Simple random assignment for demo
          const randomOwner = MOCK_CUSTOMERS.find(c => c.segment === 'chu_nha');
          if (randomOwner) setFormData(p => ({...p, ownerId: randomOwner.id}));
      }
  }, [formData.propertyId]);

  // Auto-generate schedule when terms change
  useEffect(() => {
    if (formData.isAutoSchedule && formData.startDate && formData.endDate && formData.rentAmountTy > 0) {
        const newSchedule = generateSchedule(formData);
        setFormData(prev => ({ ...prev, schedule: newSchedule }));
    }
  }, [
      formData.startDate, formData.endDate, formData.rentAmountTy, 
      formData.cycle, formData.dueDateRule, formData.dueDayOfMonth, 
      formData.isAutoSchedule
  ]);

  const validate = async () => {
      const newErrors: Record<string, string> = {};
      if (!formData.ownerId) newErrors.ownerId = "Chọn chủ nhà";
      if (!formData.tenantId) newErrors.tenantId = "Chọn khách thuê";
      if (!formData.propertyId) newErrors.propertyId = "Chọn BĐS";
      if (formData.rentAmountTy <= 0) newErrors.rentAmountTy = "Giá thuê phải lớn hơn 0";
      if (!formData.startDate) newErrors.startDate = "Chọn ngày bắt đầu";
      if (!formData.endDate) newErrors.endDate = "Chọn ngày kết thúc";
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          toast("Vui lòng kiểm tra lại thông tin nhập", "error");
          return false;
      }

      setValidating(true);
      const overlapCheck = await validateLeaseOverlap(formData.propertyId, formData.startDate, formData.endDate, formData.id);
      setValidating(false);

      if (overlapCheck.overlap) {
          toast(overlapCheck.message || "Bất động sản đã có hợp đồng trong thời gian này", "error");
          return false;
      }

      return true;
  };

  const handleSubmit = async () => {
      if (await validate()) {
          setLoading(true);
          try {
              await saveLease(formData);
              toast("Lưu hợp đồng thành công", "success");
              onSuccess();
          } catch (e) {
              toast("Lỗi khi lưu dữ liệu", "error");
          } finally {
              setLoading(false);
          }
      }
  };

  const totalContractValue = useMemo(() => formData.schedule.reduce((acc, curr) => acc + curr.amountTy, 0), [formData.schedule]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Form Fields (Scrollable) */}
        <div className="xl:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
            {/* 1. Parties */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold uppercase text-slate-600"><User size={16} className="text-indigo-600 mr-2"/> Bên Cho Thuê & Bên Thuê</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Select 
                        label="Chủ nhà (Bên A)" 
                        required
                        value={formData.ownerId} 
                        onChange={(v) => setFormData({...formData, ownerId: v})}
                        options={MOCK_CUSTOMERS.map(c => ({ label: `${c.name} - ${c.phone}`, value: c.id }))}
                        error={errors.ownerId}
                        placeholder="Tìm kiếm chủ nhà..."
                        showClear
                    />
                    <Select 
                        label="Khách thuê (Bên B)" 
                        required
                        value={formData.tenantId} 
                        onChange={(v) => setFormData({...formData, tenantId: v})}
                        options={MOCK_CUSTOMERS.map(c => ({ label: `${c.name} - ${c.phone}`, value: c.id }))}
                        error={errors.tenantId}
                        placeholder="Tìm kiếm khách thuê..."
                        showClear
                    />
                </CardContent>
            </Card>

            {/* 2. Property & Financials */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold uppercase text-slate-600"><Building size={16} className="text-indigo-600 mr-2"/> Tài sản & Giá trị</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select 
                            label="Bất động sản" 
                            required
                            value={formData.propertyId} 
                            onChange={(v) => setFormData({...formData, propertyId: v})}
                            options={MOCK_PROPERTIES.map(p => ({ label: `${p.code} - ${p.name}`, value: p.id }))}
                            error={errors.propertyId}
                            placeholder="Chọn mã BĐS..."
                            showClear
                        />
                        <Input 
                            label="Mã căn / Phòng (Nếu cho thuê lẻ)" 
                            placeholder="VD: Phòng 201, Tầng 2"
                            value={formData.unitCode}
                            onChange={(e) => setFormData({...formData, unitCode: e.target.value})}
                        />
                    </div>
                    
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <Input 
                                label="Tiền thuê / Kỳ (Triệu VNĐ)" 
                                required
                                type="number" 
                                value={rentMillion}
                                onChange={(e) => handleRentChange(e.target.value)}
                                error={errors.rentAmountTy}
                                className="font-bold text-emerald-700"
                            />
                            {formData.rentAmountTy > 0 && <span className="absolute right-2 top-8 text-xs text-slate-400 font-medium">~ {formatCurrency(formData.rentAmountTy, 'ban')}</span>}
                        </div>
                        <div className="relative">
                            <Input 
                                label="Tiền cọc (Triệu VNĐ)" 
                                type="number" 
                                value={depositMillion}
                                onChange={(e) => handleDepositChange(e.target.value)}
                                className="font-bold text-amber-700"
                            />
                        </div>
                        <Select 
                            label="Chu kỳ thanh toán" 
                            value={formData.cycle}
                            onChange={(v) => setFormData({...formData, cycle: v as PaymentCycle})}
                            options={[
                                { label: '1 Tháng / lần', value: '1_month' },
                                { label: '3 Tháng / lần', value: '3_months' },
                                { label: '6 Tháng / lần', value: '6_months' },
                                { label: '1 Năm / lần', value: '12_months' },
                                { label: 'Thanh toán 1 lần', value: 'one_time' },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Time & Rules */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold uppercase text-slate-600 flex "><Clock size={16} className="text-indigo-600 mr-2"/> Thời hạn & Quy tắc đóng tiền</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Ngày bắt đầu HĐ" required type="date" value={formData.startDate.split('T')[0]} onChange={(e) => setFormData({...formData, startDate: e.target.value})} error={errors.startDate}/>
                        <Input label="Ngày kết thúc HĐ" required type="date" value={formData.endDate.split('T')[0]} onChange={(e) => setFormData({...formData, endDate: e.target.value})} error={errors.endDate}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                         <div>
                             <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quy tắc hạn đóng</label>
                             <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", formData.dueDateRule === 'fixed_day' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                    onClick={() => setFormData({...formData, dueDateRule: 'fixed_day'})}
                                >Cố định ngày</button>
                                <button 
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", formData.dueDateRule === 'every_n_days' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                    onClick={() => setFormData({...formData, dueDateRule: 'every_n_days'})}
                                >Đầu mỗi kỳ</button>
                             </div>
                         </div>
                         {formData.dueDateRule === 'fixed_day' && (
                             <Input 
                                label="Ngày chốt (vd: ngày 5 hàng tháng)" 
                                type="number" min="1" max="31"
                                value={formData.dueDayOfMonth}
                                onChange={(e) => setFormData({...formData, dueDayOfMonth: parseInt(e.target.value)})}
                             />
                         )}
                         <Input 
                            label="Cho phép trễ (ngày)" 
                            type="number"
                            value={formData.graceDays}
                            onChange={(e) => setFormData({...formData, graceDays: parseInt(e.target.value)})}
                         />
                    </div>

                    <Textarea 
                        label="Điều khoản bổ sung / Ghi chú" 
                        placeholder="VD: Giá điện 4k/số, nước 30k/khối. Khách được nuôi mèo..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="min-h-[80px]"
                    />
                </CardContent>
            </Card>

            {/* 4. Files */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold uppercase text-slate-600"><FileUp size={16} className="text-indigo-600 mr-2"/> Đính kèm hợp đồng</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div 
                        className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors group"
                        onClick={() => {
                            // Mock upload
                            const mockFile = new File(["content"], "Hop_dong_thue_nha_signed.pdf", { type: "application/pdf" });
                            setFiles(prev => [...prev, mockFile]);
                            toast("Đã tải lên tệp đính kèm");
                        }}
                    >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <FileUp size={20}/>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Nhấn để tải lên bản Scan Hợp đồng / PDF</p>
                    </div>
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg font-medium">
                                    <Paperclip size={12}/> {f.name}
                                    <button onClick={(e) => {e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i))}} className="ml-auto text-slate-400 hover:text-rose-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Preview & Actions (Sticky) */}
        <div className="xl:col-span-4 flex flex-col h-full space-y-4">
            <Card className="border-slate-200 shadow-md flex-1 flex flex-col overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-600"/> Lịch thanh toán dự kiến
                    </h3>
                    <Badge variant="outline" className="font-normal text-[10px]">Tự động</Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {formData.schedule.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <Info size={32} className="mb-2 opacity-20"/>
                            <p className="text-xs">Nhập ngày bắt đầu, kết thúc và giá thuê để xem lịch thanh toán</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {formData.schedule.map((item, idx) => (
                                <div key={item.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-700">{item.periodLabel.split(':')[0]}</div>
                                            <div className="text-[10px] text-slate-500">{new Date(item.dueDate).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600">
                                        {formatCurrency(item.amountTy, 'cho_thue')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 bg-slate-800 text-white shrink-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">Tổng giá trị hợp đồng</span>
                        <span className="text-xl font-black">{formatCurrency(totalContractValue, 'cho_thue')}</span>
                    </div>
                    {formData.depositAmountTy > 0 && (
                        <div className="flex justify-between items-center text-xs text-emerald-300">
                            <span>+ Tiền cọc</span>
                            <span className="font-bold">{formatCurrency(formData.depositAmountTy, 'cho_thue')}</span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-3 shrink-0">
                <Button variant="outline" className="bg-white border-slate-200 text-slate-600 h-11" onClick={onCancel} disabled={loading}>
                    <X size={16} className="mr-2"/> Hủy bỏ
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 h-11" onClick={handleSubmit} disabled={loading || validating}>
                    {loading ? <RefreshCw size={16} className="mr-2 animate-spin"/> : <Save size={16} className="mr-2"/>}
                    {initialData?.id ? "Cập Nhật" : "Lưu Hợp Đồng"}
                </Button>
            </div>
        </div>
    </div>
  );
};

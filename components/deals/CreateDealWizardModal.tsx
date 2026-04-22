
import React, { useState, useEffect } from 'react';
import { 
    Button, Input, Select, Textarea, toast, Skeleton
} from '../ui';
import { X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Briefcase, MapPin, DollarSign, AlertCircle, User, Link, Search } from 'lucide-react';
import { DealDraft, DealTaskItem, DealLinkMode } from '../../types';
import { MOCK_PROPERTIES, MOCK_USERS, MOCK_CITIES, MOCK_WARDS, MOCK_LEAD_SELECT_OPTIONS, MOCK_DEAL_SOURCES } from '../../data';
import { cn } from '../../utils';

interface CreateDealWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialLeadId?: string | null;
}

const STEPS = [
    { id: 1, label: "Thông tin Giao dịch & Khách hàng" },
    { id: 2, label: "BĐS & Điều kiện giao dịch" },
    { id: 3, label: "Nguồn Giao dịch & phân bổ" },
    { id: 4, label: "Ghi chú & tác vụ" }
];

const INITIAL_FORM: DealDraft = {
    linkMode: 'from_lead',
    leadId: '',
    // Step 1
    customerName: '', phone: '', email: '', gender: 'khong_xac_dinh', need: '', propertyType: '',
    // Step 2
    propertyId: '', projectOrAreaAuto: '', ward: '', areaText: '', addressDetail: '', province: '',
    minArea: '', maxArea: '', minBudgetTy: '', maxBudgetTy: '',
    expectedCloseWindow: 'khong_xac_dinh', paymentMethodNote: '', dealValueTy: '', depositAmountTy: '',
    // Step 3
    dealSource: '', assigneeId: '', dealStage: 'deal_mo', sourceDetail: '',
    // Step 4
    note: '', tasks: []
};

export const CreateDealWizardModal: React.FC<CreateDealWizardModalProps> = ({ isOpen, onClose, onSuccess, initialLeadId }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<DealDraft>(INITIAL_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [maxStepReached, setMaxStepReached] = useState(1);

    // Deep Link Logic
    useEffect(() => {
        if (initialLeadId && isOpen) {
            handleLeadSelection(initialLeadId);
        }
    }, [initialLeadId, isOpen]);

    // Handle Lead Selection (Auto-fill)
    const handleLeadSelection = (leadId: string) => {
        const leadOpt = MOCK_LEAD_SELECT_OPTIONS.find(l => l.value === leadId);
        if (leadOpt) {
            const raw = leadOpt.raw;
            setFormData(prev => ({
                ...prev,
                leadId: raw.id,
                customerName: raw.customerName,
                phone: raw.phone,
                need: raw.need,
                propertyType: raw.propertyType === 'Chung Cư' ? 'chung_cu' : raw.propertyType === 'Liền Kề' ? 'lien_ke' : 'biet_thu', // Simple map
                areaText: raw.area,
                // Partial fill for step 2 if possible (mock logic)
                minBudgetTy: (raw.budgetTy * 0.9).toFixed(1),
                maxBudgetTy: (raw.budgetTy * 1.1).toFixed(1),
            }));
            toast("Đã tự động điền thông tin từ Lead");
        }
    };

    // Handle Property Selection (Autofill Step 2)
    useEffect(() => {
        if (formData.propertyId) {
            const prop = MOCK_PROPERTIES.find(p => p.id === formData.propertyId);
            if (prop) {
                setFormData(prev => ({
                    ...prev,
                    projectOrAreaAuto: prop.project,
                    province: prop.city,
                    ward: prop.ward,
                    areaText: prop.project,
                    addressDetail: prop.address,
                    minArea: (prop.area * 0.9).toString(),
                    maxArea: (prop.area * 1.1).toString(),
                    minBudgetTy: (prop.price * 0.9).toFixed(1),
                    maxBudgetTy: (prop.price * 1.05).toFixed(1),
                    dealValueTy: prop.price.toString()
                }));
            }
        }
    }, [formData.propertyId]);

    const handleChange = (field: keyof DealDraft, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }
    };

    // --- Validation ---
    const validateStep = async (currentStep: number): Promise<boolean> => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (formData.linkMode === 'from_lead' && !formData.leadId) {
                newErrors.leadId = "Vui lòng chọn Khách để liên kết";
            }
            if (!formData.customerName.trim()) newErrors.customerName = "Họ tên là bắt buộc";
            if (!formData.phone.trim()) newErrors.phone = "SĐT là bắt buộc";
            if (!formData.need) newErrors.need = "Vui lòng chọn nhu cầu";
            if (!formData.propertyType) newErrors.propertyType = "Vui lòng chọn loại BĐS";
            
            // Mock Phone Check
            if (formData.linkMode === 'direct' && formData.phone.includes("999")) {
                const confirmLink = window.confirm("SĐT này trùng với Khách #00123. Bạn có muốn liên kết với Khách đó thay vì tạo mới?");
                if (confirmLink) {
                    handleChange('linkMode', 'from_lead');
                    handleLeadSelection('#00123'); // Mock ID
                    return false; // Stop navigation to let user review
                }
            }
        }

        if (currentStep === 2) {
            if (!formData.province) newErrors.province = "Vui lòng chọn Tỉnh/Thành";
            if (!formData.ward) newErrors.ward = "Vui lòng chọn Xã/Phường";
            if (!formData.minArea) newErrors.minArea = "Nhập diện tích Min";
            if (!formData.maxArea) newErrors.maxArea = "Nhập diện tích Max";
            if (!formData.minBudgetTy) newErrors.minBudgetTy = "Nhập ngân sách Min";
            if (!formData.maxBudgetTy) newErrors.maxBudgetTy = "Nhập ngân sách Max";
            
            if (Number(formData.minArea) > Number(formData.maxArea)) newErrors.minArea = "Min không được lớn hơn Max";
            if (Number(formData.minBudgetTy) > Number(formData.maxBudgetTy)) newErrors.minBudgetTy = "Min không được lớn hơn Max";
        }

        if (currentStep === 3) {
            if (!formData.dealSource) newErrors.dealSource = "Chọn nguồn Giao dịch";
            if (!formData.assigneeId) newErrors.assigneeId = "Chọn sale phụ trách";
            if (!formData.dealStage) newErrors.dealStage = "Chọn trạng thái";

            // Logic Check: Deposit Amount required if stage >= dat_coc
            if (['dat_coc', 'hoan_tat'].includes(formData.dealStage) && !formData.depositAmountTy) {
                const addNow = window.confirm("Trạng thái này yêu cầu nhập 'Tiền cọc dự kiến'. Bạn có muốn nhập ngay không?");
                if (!addNow) return false;
                // Focus logic could go here, but simple alert for now
                newErrors.depositAmountTy = "Yêu cầu nhập tiền cọc";
            }

            // Logic Check: Won/Lost Confirmation
            if (formData.dealStage === 'hoan_tat' && !window.confirm("Đánh dấu giao dịch hoàn tất? Hành động này sẽ cập nhật KPI.")) return false;
            if (formData.dealStage === 'huy' && !window.confirm("Xác nhận chuyển Hủy/Thất bại?")) return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && isValid;
    };

    // --- Navigation ---
    const handleNext = async () => {
        if (await validateStep(step)) {
            if (step < 4) {
                setLoading(true);
                setTimeout(() => {
                    setStep(prev => prev + 1);
                    setMaxStepReached(prev => Math.max(prev, step + 1));
                    setLoading(false);
                }, 400);
            } else {
                // Submit
                setLoading(true);
                setTimeout(() => {
                    if (Math.random() < 0.05) {
                        toast("Không tải được dữ liệu. Vui lòng thử lại", "error");
                        setLoading(false);
                        return;
                    }
                    toast("Tạo Giao dịch thành công!");
                    onSuccess();
                    onClose();
                }, 800);
            }
        }
    };

    const handleBack = () => { if (step > 1) setStep(prev => prev - 1); };
    const handleClose = () => {
        if (isDirty && window.confirm("Thoát mà không lưu?")) onClose();
        else if (!isDirty) onClose();
    };

    // --- Tasks ---
    const addTask = () => {
        const newTask: DealTaskItem = { id: Date.now().toString(), title: '', assigneeId: '', assigneeName: '', dueAt: '' };
        setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    };
    const updateTask = (id: string, field: keyof DealTaskItem, val: string) => {
        setFormData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, [field]: val } : t) }));
    };
    const removeTask = (id: string) => {
        setFormData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[1000px] h-[95vh] md:h-auto md:max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tạo Giao dịch Mới</h2>
                        <p className="text-xs text-slate-500 mt-1">Thiết lập giao dịch mới cho khách hàng</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- STEPPER --- */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0 -translate-y-1/2 rounded-full hidden md:block" />
                        {STEPS.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const isClickable = s.id <= maxStepReached;
                            return (
                                <div key={s.id} onClick={() => isClickable && setStep(s.id)} className={cn("relative z-10 flex flex-col items-center gap-2 cursor-default md:w-1/4", isClickable && "cursor-pointer group")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white", isCompleted ? "bg-indigo-600 text-white" : isCurrent ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" : "bg-slate-200 text-slate-500 group-hover:bg-slate-300")}>
                                        {isCompleted ? <Check size={14} /> : s.id}
                                    </div>
                                    <span className={cn("text-xs font-semibold whitespace-nowrap transition-colors hidden md:block", isCurrent ? "text-indigo-700" : isCompleted ? "text-indigo-600" : "text-slate-400")}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="md:hidden text-center mt-3 text-sm font-bold text-indigo-700">Bước {step}: {STEPS[step-1].label}</div>
                </div>

                {/* --- CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#ffffff]">
                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            <Skeleton className="h-20 w-full" />
                            <div className="grid grid-cols-2 gap-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : (
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            
                            {/* STEP 1: INFO */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    {/* Source Selection */}
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                                        <label className="text-sm font-semibold text-slate-700 mb-3 block">Nguồn tạo Giao dịch:</label>
                                        <div className="flex gap-6 mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={formData.linkMode === 'from_lead'} onChange={() => handleChange('linkMode', 'from_lead')} className="text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm font-medium text-slate-700">Tạo từ Khách có sẵn</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={formData.linkMode === 'direct'} onChange={() => handleChange('linkMode', 'direct')} className="text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm font-medium text-slate-700">Tạo Giao dịch trực tiếp</span>
                                            </label>
                                        </div>

                                        {formData.linkMode === 'from_lead' && (
                                            <div className="animate-in fade-in duration-200">
                                                <Select 
                                                    label="Chọn Khách (Tìm kiếm theo Tên/SĐT)" 
                                                    placeholder="-- Chọn Khách --"
                                                    options={MOCK_LEAD_SELECT_OPTIONS}
                                                    value={formData.leadId || ''}
                                                    onChange={handleLeadSelection}
                                                    error={errors.leadId}
                                                    showClear
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                        <Input label="Họ tên Khách Hàng" required value={formData.customerName} onChange={e => handleChange('customerName', e.target.value)} error={errors.customerName} icon={<User size={16}/>} />
                                        <Input 
                                            label="Số điện thoại" 
                                            required 
                                            value={formData.phone} 
                                            onChange={e => handleChange('phone', e.target.value)} 
                                            error={errors.phone} 
                                            readOnly={formData.linkMode === 'from_lead'}
                                            className={formData.linkMode === 'from_lead' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
                                        />
                                        <Input label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                        <Select label="Giới tính" value={formData.gender || ''} onChange={v => handleChange('gender', v)} options={[{value:'khong_xac_dinh', label:'Không xác định'}, {value:'nam', label:'Nam'}, {value:'nu', label:'Nữ'}]} />
                                        <Select label="Nhu cầu chính" required value={formData.need} onChange={v => handleChange('need', v)} error={errors.need} options={[{value:'mua', label:'Mua'}, {value:'thue', label:'Thuê'}, {value:'ky_gui', label:'Ký gửi'}]} />
                                        <Select label="Loại BĐS quan tâm" required value={formData.propertyType} onChange={v => handleChange('propertyType', v)} error={errors.propertyType} options={[{value:'chung_cu', label:'Chung Cư'}, {value:'lien_ke', label:'Liền Kề'}, {value:'biet_thu', label:'Biệt Thự'}, {value:'dat_nen', label:'Đất Nền'}]} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PROPERTY */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm"><Briefcase size={18}/></div>
                                            <div className="flex-1">
                                                 <Select 
                                                    label="Chọn BĐS trong kho hàng" 
                                                    placeholder="Tìm kiếm mã hoặc tên BĐS..." 
                                                    options={MOCK_PROPERTIES.map(p => ({value: p.id, label: p.name}))}
                                                    value={formData.propertyId || ''}
                                                    onChange={v => handleChange('propertyId', v)}
                                                    showClear
                                                />
                                                <p className="text-[11px] text-slate-500 mt-1 ml-1">* Dữ liệu sẽ tự động điền khi chọn BĐS</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <Select label="Tỉnh / Thành phố" required value={formData.province || ''} onChange={v => handleChange('province', v)} error={errors.province} options={MOCK_CITIES} />
                                        <Select label="Xã / Phường" required value={formData.ward || ''} onChange={v => handleChange('ward', v)} error={errors.ward} options={MOCK_WARDS} />
                                        <Input label="Thuộc Dự án / Khu vực" value={formData.areaText} onChange={e => handleChange('areaText', e.target.value)} readOnly={!!formData.propertyId} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex gap-3">
                                            <Input label="Diện tích Min (m²)" required type="number" value={formData.minArea} onChange={e => handleChange('minArea', e.target.value)} error={errors.minArea} />
                                            <Input label="Max" required type="number" value={formData.maxArea} onChange={e => handleChange('maxArea', e.target.value)} error={errors.maxArea} />
                                        </div>
                                        <div className="flex gap-3">
                                            <Input label="Ngân sách Min (Tỷ)" required type="number" step="0.1" value={formData.minBudgetTy} onChange={e => handleChange('minBudgetTy', e.target.value)} error={errors.minBudgetTy} />
                                            <Input label="Max" required type="number" step="0.1" value={formData.maxBudgetTy} onChange={e => handleChange('maxBudgetTy', e.target.value)} error={errors.maxBudgetTy} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input label="Địa chỉ chi tiết" icon={<MapPin size={16}/>} value={formData.addressDetail} onChange={e => handleChange('addressDetail', e.target.value)} />
                                        <div className="flex gap-3">
                                            <Input label="HT Thanh toán" icon={<DollarSign size={16}/>} placeholder="VD: Vay bank..." value={formData.paymentMethodNote} onChange={e => handleChange('paymentMethodNote', e.target.value)} />
                                            <Select label="TG Giao dịch" value={formData.expectedCloseWindow || 'khong_xac_dinh'} onChange={v => handleChange('expectedCloseWindow', v)} options={[{value:'khong_xac_dinh', label:'Không xác định'}, {value:'trong_1_thang', label:'Trong 1 tháng'}, {value:'1_3_thang', label:'1-3 tháng'}]} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                                        <Input label="Giá trị Giao dịch dự kiến (Tỷ)" type="number" step="0.1" value={formData.dealValueTy} onChange={e => handleChange('dealValueTy', e.target.value)} />
                                        <Input label="Tiền cọc dự kiến (Tỷ)" type="number" step="0.05" value={formData.depositAmountTy} onChange={e => handleChange('depositAmountTy', e.target.value)} error={errors.depositAmountTy} placeholder="Nhập nếu đã có cọc" />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SOURCE & STAGE */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Nguồn Giao dịch" required value={formData.dealSource} onChange={v => handleChange('dealSource', v)} error={errors.dealSource} options={MOCK_DEAL_SOURCES} />
                                        <Select label="Sale Phụ Trách" required value={formData.assigneeId} onChange={v => handleChange('assigneeId', v)} error={errors.assigneeId} options={MOCK_USERS} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select 
                                            label="Trạng thái Giao dịch" 
                                            required 
                                            value={formData.dealStage} 
                                            onChange={v => handleChange('dealStage', v)} 
                                            error={errors.dealStage} 
                                            options={[
                                                {value:'deal_mo', label:'Giao dịch Mở'}, 
                                                {value:'dam_phan', label:'Đàm Phán'}, 
                                                {value:'dat_coc', label:'Đặt Cọc'},
                                                {value:'hoan_tat', label:'Hoàn Tất'},
                                                {value:'huy', label:'Hủy / Thất Bại'}
                                            ]} 
                                        />
                                        <Input label="Chi tiết nguồn" placeholder="VD: Giới thiệu từ anh X..." value={formData.sourceDetail} onChange={e => handleChange('sourceDetail', e.target.value)} />
                                    </div>

                                    {/* Warnings */}
                                    {formData.dealStage === 'hoan_tat' && (
                                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-start gap-3">
                                            <Check size={18} className="mt-0.5"/>
                                            <span className="text-sm">Bạn đang đánh dấu <b>Hoàn Tất</b>. Giao dịch này sẽ được tính vào doanh thu và KPI ngay lập tức.</span>
                                        </div>
                                    )}
                                    {formData.dealStage === 'huy' && (
                                        <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 flex items-start gap-3">
                                            <AlertCircle size={18} className="mt-0.5"/>
                                            <span className="text-sm">Xác nhận chuyển trạng thái <b>Hủy/Thất Bại</b>. Giao dịch sẽ bị đóng lại.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: NOTES */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <Textarea label="Ghi chú Deals" placeholder="Ghi chú các thông tin quan trọng, lịch sử làm việc sơ bộ..." rows={4} value={formData.note} onChange={e => handleChange('note', e.target.value)} />
                                    
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                            <h4 className="font-semibold text-slate-700 text-sm">Danh sách tác vụ</h4>
                                            <Button type="button" size="sm" variant="outline" className="h-8 gap-1 bg-white" onClick={addTask}><Plus size={14}/> Thêm việc</Button>
                                        </div>
                                        <div className="p-0">
                                            {formData.tasks.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-sm">Chưa có tác vụ nào được thêm</div>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {formData.tasks.map((task) => (
                                                        <div key={task.id} className="grid grid-cols-12 gap-2 p-3 items-center group hover:bg-slate-50">
                                                            <div className="col-span-5">
                                                                <Input placeholder="Tên công việc..." className="h-9 text-sm" value={task.title} onChange={e => updateTask(task.id, 'title', e.target.value)} />
                                                            </div>
                                                            <div className="col-span-3">
                                                                 <Select className="w-full" placeholder="Người làm" options={MOCK_USERS} value={task.assigneeId} onChange={v => updateTask(task.id, 'assigneeId', v)} />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <Input type="datetime-local" className="h-9 text-xs" value={task.dueAt} onChange={e => updateTask(task.id, 'dueAt', e.target.value)} />
                                                            </div>
                                                            <div className="col-span-1 text-right">
                                                                <button onClick={() => removeTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={loading} className="text-slate-500 hover:bg-slate-200">
                        Hủy bỏ
                    </Button>
                    <div className="flex gap-3">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                                <ArrowLeft size={16} /> Quay lại
                            </Button>
                        )}
                        <Button type="button" variant="primary" onClick={handleNext} disabled={loading} className="gap-2 w-[140px]">
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            {step === 4 ? "Tạo Deals" : "Tiếp theo"}
                            {step < 4 && !loading && <ArrowRight size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

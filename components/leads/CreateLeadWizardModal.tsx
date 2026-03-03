
import React, { useState, useEffect } from 'react';
import { 
    Button, Input, Select, Textarea, toast, Skeleton
} from '../ui';
import { X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Briefcase, MapPin, DollarSign, AlertCircle, User } from 'lucide-react';
import { LeadDraft, TaskItem } from '../../types';
import { MOCK_PROPERTIES, MOCK_USERS, MOCK_CITIES, MOCK_WARDS } from '../../data';
import { cn } from '../../utils';

interface CreateLeadWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, label: "Thông tin Lead & Liên hệ" },
    { id: 2, label: "Khu vực & Ngân sách" },
    { id: 3, label: "Nguồn Lead & phân bổ" },
    { id: 4, label: "Ghi chú & tác vụ" }
];

const INITIAL_FORM: LeadDraft = {
    // Step 1
    name: '', email: '', need: '', propertyTypeInterest: '', gender: 'unknown', phone: '',
    // Step 2
    refPropertyId: '', projectArea: '', city: '', ward: '', projectDetail: '', 
    areaMin: '', areaMax: '', address: '', budgetMin: '', budgetMax: '', 
    paymentMethod: '', timeframe: 'unknown',
    // Step 3
    source: '', assignee: '', status: 'lead_moi', sourceDetail: '',
    // Step 4
    note: '', tasks: []
};

export const CreateLeadWizardModal: React.FC<CreateLeadWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<LeadDraft>(INITIAL_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [maxStepReached, setMaxStepReached] = useState(1);
    
    // Autofill logic for Property Selection
    useEffect(() => {
        if (formData.refPropertyId) {
            const prop = MOCK_PROPERTIES.find(p => p.id === formData.refPropertyId);
            if (prop) {
                setFormData(prev => ({
                    ...prev,
                    projectArea: prop.project,
                    city: prop.city,
                    ward: prop.ward,
                    projectDetail: prop.project,
                    address: prop.address,
                    areaMin: (prop.area * 0.9).toString(),
                    areaMax: (prop.area * 1.1).toString(),
                    budgetMin: (prop.price * 0.9).toFixed(1),
                    budgetMax: (prop.price * 1.05).toFixed(1),
                }));
            }
        }
    }, [formData.refPropertyId]);

    // Handle Input Change
    const handleChange = (field: keyof LeadDraft, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Clear error on change
        if (errors[field as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }
    };

    // --- Validation Logic ---
    const validateStep = async (currentStep: number): Promise<boolean> => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = "Họ tên là bắt buộc";
            if (!formData.need) newErrors.need = "Vui lòng chọn nhu cầu";
            if (!formData.propertyTypeInterest) newErrors.propertyTypeInterest = "Vui lòng chọn loại BĐS";
            if (!formData.phone.trim()) {
                newErrors.phone = "SĐT là bắt buộc";
            } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
                newErrors.phone = "SĐT không đúng định dạng";
            } else {
                // Mock Async Check
                setLoading(true);
                await new Promise(r => setTimeout(r, 600)); 
                if (formData.phone.includes("999")) { // Mock duplicated phone
                    newErrors.phone = "Số điện thoại này đã có trong hệ thống";
                    isValid = false;
                }
                setLoading(false);
            }
        }

        if (currentStep === 2) {
            if (!formData.city) newErrors.city = "Vui lòng chọn Tỉnh/Thành";
            if (!formData.ward) newErrors.ward = "Vui lòng chọn Xã/Phường";
            if (!formData.areaMin) newErrors.areaMin = "Nhập diện tích tối thiểu";
            if (!formData.areaMax) newErrors.areaMax = "Nhập diện tích tối đa";
            if (Number(formData.areaMin) > Number(formData.areaMax)) {
                newErrors.areaMin = "Diện tích Min không được lớn hơn Max";
            }
            if (!formData.budgetMin) newErrors.budgetMin = "Nhập ngân sách tối thiểu";
            if (!formData.budgetMax) newErrors.budgetMax = "Nhập ngân sách tối đa";
             if (Number(formData.budgetMin) > Number(formData.budgetMax)) {
                newErrors.budgetMin = "Ngân sách Min không được lớn hơn Max";
            }
        }

        if (currentStep === 3) {
            if (!formData.source) newErrors.source = "Vui lòng chọn nguồn Lead";
            if (!formData.assignee) newErrors.assignee = "Vui lòng chọn chuyên viên";
            if (!formData.status) newErrors.status = "Vui lòng chọn trạng thái";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && isValid;
    };

    // --- Navigation Handlers ---
    const handleNext = async () => {
        if (await validateStep(step)) {
            if (step < 4) {
                setLoading(true);
                // Mock transition delay
                setTimeout(() => {
                    setStep(prev => prev + 1);
                    setMaxStepReached(prev => Math.max(prev, step + 1));
                    setLoading(false);
                }, 400);
            } else {
                // Submit
                setLoading(true);
                setTimeout(() => {
                    // Mock Error random
                    if (Math.random() < 0.05) {
                        toast("Không tải được dữ liệu. Vui lòng thử lại", "error");
                        setLoading(false);
                        return;
                    }
                    toast("Tạo Lead thành công!");
                    onSuccess();
                    onClose();
                }, 800);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleClose = () => {
        if (isDirty) {
            if (window.confirm("Bạn có muốn thoát? Dữ liệu chưa được lưu.")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    // --- Task List Handlers ---
    const addTask = () => {
        const newTask: TaskItem = {
            id: Date.now().toString(),
            title: '',
            assigneeName: '',
            dueAt: '',
            task: '',
            assignee: '',
            deadline: ''
        };
        setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    };

    const updateTask = (id: string, field: keyof TaskItem, val: string) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, [field]: val } : t)
        }));
    };

    const removeTask = (id: string) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[1000px] h-[95vh] md:h-auto md:max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tạo Lead Mới</h2>
                        <p className="text-xs text-slate-500 mt-1">Nhập thông tin khách hàng tiềm năng vào hệ thống</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- STEPPER --- */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0 -translate-y-1/2 rounded-full hidden md:block" />
                        
                        {STEPS.map((s, idx) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const isClickable = s.id <= maxStepReached;

                            return (
                                <div 
                                    key={s.id} 
                                    onClick={() => isClickable && setStep(s.id)}
                                    className={cn(
                                        "relative z-10 flex flex-col items-center gap-2 cursor-default md:w-1/4",
                                        isClickable && "cursor-pointer group"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white",
                                        isCompleted ? "bg-emerald-500 text-white" : 
                                        isCurrent ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" : 
                                        "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                                    )}>
                                        {isCompleted ? <Check size={14} /> : s.id}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold whitespace-nowrap transition-colors hidden md:block",
                                        isCurrent ? "text-indigo-700" : isCompleted ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Mobile Step Label */}
                    <div className="md:hidden text-center mt-3 text-sm font-bold text-indigo-700">
                        Bước {step}: {STEPS[step-1].label}
                    </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#ffffff]">
                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="grid grid-cols-2 gap-6">
                                <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : (
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            
                            {/* STEP 1 */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-in slide-in-from-right-4 duration-300">
                                    <Input label="Họ tên Khách Hàng" placeholder="VD: Nguyễn Văn A" required value={formData.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} icon={<User size={16}/>} autoFocus />
                                    <Input label="Số điện thoại" placeholder="09xx xxx xxx" required value={formData.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} icon={<Briefcase size={16}/>} />
                                    <Input label="Email" placeholder="nguyenvana@gmail.com" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                    <Select label="Giới tính" value={formData.gender} onChange={v => handleChange('gender', v)} options={[{value:'unknown', label:'Không xác định'}, {value:'male', label:'Nam'}, {value:'female', label:'Nữ'}]} />
                                    <Select label="Nhu cầu chính" required value={formData.need} onChange={v => handleChange('need', v)} error={errors.need} options={[{value:'mua', label:'Mua'}, {value:'thue', label:'Thuê'}, {value:'ky_gui', label:'Ký gửi Bán'}]} />
                                    <Select label="Loại BĐS quan tâm" required value={formData.propertyTypeInterest} onChange={v => handleChange('propertyTypeInterest', v)} error={errors.propertyTypeInterest} options={[{value:'chung_cu', label:'Chung Cư'}, {value:'lien_ke', label:'Liền Kề'}, {value:'biet_thu', label:'Biệt Thự'}, {value:'dat_nen', label:'Đất Nền'}]} />
                                </div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm"><Briefcase size={18}/></div>
                                            <div className="flex-1">
                                                 <Select 
                                                    label="Chọn BĐS từ kho hàng (Autofill)" 
                                                    placeholder="Tìm kiếm BĐS..." 
                                                    options={MOCK_PROPERTIES.map(p => ({value: p.id, label: p.name}))}
                                                    value={formData.refPropertyId}
                                                    onChange={v => handleChange('refPropertyId', v)}
                                                    showClear
                                                />
                                                <p className="text-[11px] text-slate-500 mt-1 ml-1">* Chọn BĐS để tự động điền thông tin bên dưới</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <Select label="Tỉnh / Thành phố" required value={formData.city} onChange={v => handleChange('city', v)} error={errors.city} options={MOCK_CITIES} />
                                        <Select label="Xã / Phường" required value={formData.ward} onChange={v => handleChange('ward', v)} error={errors.ward} options={MOCK_WARDS} />
                                        <Input label="Dự án / Khu vực" placeholder="VD: KĐT Dương Nội..." value={formData.projectDetail} onChange={e => handleChange('projectDetail', e.target.value)} readOnly={!!formData.refPropertyId} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex gap-3">
                                            <Input label="Diện tích Min (m²)" required placeholder="80" type="number" value={formData.areaMin} onChange={e => handleChange('areaMin', e.target.value)} error={errors.areaMin} />
                                            <Input label="Max" required placeholder="150" type="number" value={formData.areaMax} onChange={e => handleChange('areaMax', e.target.value)} error={errors.areaMax} />
                                        </div>
                                        <div className="flex gap-3">
                                            <Input label="Ngân sách Min (Tỷ)" required placeholder="3.5" type="number" step="0.1" value={formData.budgetMin} onChange={e => handleChange('budgetMin', e.target.value)} error={errors.budgetMin} />
                                            <Input label="Max" required placeholder="5.2" type="number" step="0.1" value={formData.budgetMax} onChange={e => handleChange('budgetMax', e.target.value)} error={errors.budgetMax} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input label="Địa chỉ cụ thể" icon={<MapPin size={16}/>} placeholder="VD: Số 3 ngõ 1..." value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                                        <div className="flex gap-3">
                                            <Input label="HT Thanh toán" icon={<DollarSign size={16}/>} placeholder="VD: Vay bank..." value={formData.paymentMethod} onChange={e => handleChange('paymentMethod', e.target.value)} />
                                            <Select label="TG Giao dịch" value={formData.timeframe} onChange={v => handleChange('timeframe', v)} options={[{value:'unknown', label:'Không xác định'}, {value:'1_month', label:'Trong 1 tháng'}, {value:'3_month', label:'1-3 tháng'}]} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Nguồn Lead" required value={formData.source} onChange={v => handleChange('source', v)} error={errors.source} options={[{value:'facebook', label:'Facebook Ads'}, {value:'zalo', label:'Zalo'}, {value:'website', label:'Website'}, {value:'ctv', label:'CTV Giới thiệu'}]} />
                                        <Select label="Chuyên viên phụ trách" required value={formData.assignee} onChange={v => handleChange('assignee', v)} error={errors.assignee} options={MOCK_USERS} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Trạng thái Lead" required value={formData.status} onChange={v => handleChange('status', v)} error={errors.status} options={[{value:'lead_moi', label:'Lead Mới'}, {value:'dang_cham', label:'Đang Chăm'}, {value:'hen_xem_nha', label:'Hẹn Xem Nhà'}]} />
                                        <Input label="Chi tiết nguồn" placeholder="VD: CTV Anh Tuấn giới thiệu..." value={formData.sourceDetail} onChange={e => handleChange('sourceDetail', e.target.value)} />
                                    </div>

                                    {/* Warning Logic for Deal */}
                                    {['hen_xem_nha', 'deal_mo', 'dam_phan'].includes(formData.status) && (
                                        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-sm">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Lưu ý:</span> Bạn đang chọn trạng thái <b>"{formData.status === 'hen_xem_nha' ? 'Hẹn Xem Nhà' : 'Deal Mở'}"</b>. 
                                                Hệ thống sẽ tự động tạo một <b>Deal</b> tương ứng sau khi bạn hoàn tất tạo Lead.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4 */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <Textarea label="Ghi chú chi tiết" placeholder="VD: Khách hàng kỹ tính, thích hướng Đông Nam..." rows={4} value={formData.note} onChange={e => handleChange('note', e.target.value)} />
                                    
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
                                                    {formData.tasks.map((task, idx) => (
                                                        <div key={task.id} className="grid grid-cols-12 gap-2 p-3 items-center group hover:bg-slate-50">
                                                            <div className="col-span-5">
                                                                <Input placeholder="Tên công việc..." className="h-9 text-sm" value={task.task} onChange={e => updateTask(task.id, 'task', e.target.value)} />
                                                            </div>
                                                            <div className="col-span-3">
                                                                 <Select className="w-full" placeholder="Người làm" options={MOCK_USERS} value={task.assignee} onChange={v => updateTask(task.id, 'assignee', v)} />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <Input type="datetime-local" className="h-9 text-xs" value={task.deadline} onChange={e => updateTask(task.id, 'deadline', e.target.value)} />
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
                            {step === 4 ? "Tạo Lead" : "Tiếp theo"}
                            {step < 4 && !loading && <ArrowRight size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

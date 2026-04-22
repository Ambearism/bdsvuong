
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Textarea, toast, Badge } from '../../ui';
import { MOCK_CUSTOMERS, Customer } from '../../../data/mockCustomers';
import { MOCK_PROPERTIES, Property } from '../../../data/mockProperties';
import { MOCK_LEASES } from '../../../data/mockLeases';
import { MOCK_USERS } from '../../../data';
import { CareCase } from '../../../types';
import { createCareCase } from '../../../data/careFactory';
import { User, Building, HeartHandshake, FileText, UserPlus, Plus, X, Search, UploadCloud, FileType } from 'lucide-react';
import { CreateCustomerModal } from '../../customers/CreateCustomerModal';
import { CreatePropertyModal } from '../../properties/CreatePropertyModal';
import { cn } from '../../../utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateCareCaseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const [localCustomers, setLocalCustomers] = useState(MOCK_CUSTOMERS);
    const [localProperties, setLocalProperties] = useState(MOCK_PROPERTIES);

    const [ownerId, setOwnerId] = useState('');
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [assignee, setAssignee] = useState('');
    const [initialNote, setInitialNote] = useState('');
    const [careFeeMillion, setCareFeeMillion] = useState('0');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

    const [propertySearchId, setPropertySearchId] = useState('');

    const owner = localCustomers.find(c => c.id === ownerId);
    const selectedProperties = localProperties.filter(p => selectedPropertyIds.includes(p.id));

    useEffect(() => {
        if (ownerId) {
            const relatedLeases = MOCK_LEASES.filter(l => l.ownerId === ownerId);
            const relatedIds = Array.from(new Set(relatedLeases.map(l => l.propertyId)));
            if (selectedPropertyIds.length === 0) {
                setSelectedPropertyIds(relatedIds);
            }
        }
    }, [ownerId]);

    const handleNewCustomer = (newCustomer: Customer) => {
        setLocalCustomers(prev => [newCustomer, ...prev]);
        setOwnerId(newCustomer.id);
    };

    const handleNewProperty = (newProperty: Property) => {
        setLocalProperties(prev => [newProperty, ...prev]);
        setSelectedPropertyIds(prev => [...prev, newProperty.id]);
    };

    useEffect(() => {
        if (propertySearchId) {
            if (!selectedPropertyIds.includes(propertySearchId)) {
                setSelectedPropertyIds(prev => [...prev, propertySearchId]);
            }
            setPropertySearchId('');
        }
    }, [propertySearchId]);

    const handleSubmit = async () => {
        if (!ownerId) return toast("Vui lòng chọn Chủ nhà / Khách hàng", "error");
        if (!assignee) return toast("Vui lòng chọn nhân viên phụ trách", "error");

        setLoading(true);

        const linkedLeases = MOCK_LEASES.filter(l =>
            l.ownerId === ownerId && selectedPropertyIds.includes(l.propertyId)
        ).map(l => ({ id: l.id, code: l.code }));

        const newCase: CareCase = {
            id: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            ownerId,
            ownerName: owner?.name || 'Unknown',
            ownerPhone: owner?.phone || '',
            status: 'active',
            riskScore: 0, // Đã bỏ trường rủi ro, gán mặc định 0
            lastContactDate: new Date().toISOString(),
            assignedTo: assignee,
            linkedProperties: selectedProperties.map(p => ({ id: p.id, code: p.code, name: p.name })),
            linkedLeases,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            careFeeMillion: parseFloat(careFeeMillion) || 0
        };

        await createCareCase(newCase);

        setLoading(false);
        toast("Đã mở Case CSKH thành công!", "success");
        onSuccess();
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Mở Case Chăm Sóc (Care)" size="lg">
                <div className="p-6 space-y-6">

                    {/* 1. CHỦ NHÀ */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> 1. Chủ nhà / Khách hàng
                        </label>

                        <div className="flex gap-2 animate-in fade-in duration-300">
                            <div className="flex-1">
                                <Select
                                    value={ownerId}
                                    onChange={setOwnerId}
                                    options={localCustomers.map(c => ({
                                        label: `${c.name} - ${c.phone} [${c.code}]`,
                                        value: c.id
                                    }))}
                                    placeholder="Tìm kiếm hoặc chọn chủ nhà..."
                                    showClear
                                />
                            </div>
                            <Button variant="outline" className="bg-white border-dashed border-slate-300 text-indigo-600 h-10 px-3" onClick={() => setIsCustomerModalOpen(true)}>
                                <UserPlus size={18} />
                            </Button>
                        </div>

                        {owner && (
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">{owner.name.charAt(0)}</div>
                                    <div>
                                        <div className="font-bold text-indigo-900">{owner.name}</div>
                                        <div className="text-xs text-indigo-600">{owner.phone}</div>
                                    </div>
                                </div>
                                <Badge variant="indigo" className="capitalize">{owner.segment.replace('_', ' ')}</Badge>
                            </div>
                        )}
                    </div>

                    {/* 2. TÀI SẢN */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Building size={14} /> 2. Bất động sản liên quan
                        </label>

                        {selectedProperties.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 mb-3">
                                {selectedProperties.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg shadow-sm group animate-in slide-in-from-left-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded text-slate-500"><Building size={14} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold">{p.project} • {p.code}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedPropertyIds(prev => prev.filter(id => id !== p.id))}
                                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select
                                    placeholder="+ Thêm BĐS khác vào case này..."
                                    options={localProperties.filter(p => !selectedPropertyIds.includes(p.id)).map(p => ({
                                        label: `${p.name} (${p.project})`,
                                        value: p.id
                                    }))}
                                    value={propertySearchId}
                                    onChange={setPropertySearchId}
                                    showClear
                                />
                            </div>
                            <Button variant="outline" className="bg-white border-dashed border-slate-300 text-emerald-600 h-10 px-3" onClick={() => setIsPropertyModalOpen(true)}>
                                <Plus size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* 3. PHỤ TRÁCH & GHI CHÚ */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><HeartHandshake size={14} /> 3. Phân bổ & Ghi chú</label>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <Select
                                label="Người phụ trách (Assignee)"
                                value={assignee}
                                onChange={setAssignee}
                                options={MOCK_USERS.map(u => ({ label: u.label, value: u.label }))}
                                placeholder="Chọn nhân viên CSKH..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Phí Vuông Care hàng tháng (Triệu VND)"
                                type="number"
                                min="0"
                                step="0.1"
                                value={careFeeMillion}
                                onChange={(e: any) => setCareFeeMillion(e.target.value)}
                                placeholder="VD: 5.5"
                                required
                            />

                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Hợp đồng bản Scan (PDF/Image)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className={cn(
                                        "px-4 h-10 border rounded-xl flex items-center justify-between text-sm transition-all",
                                        uploadedFile ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                                    )}>
                                        <span className="truncate flex items-center gap-2">
                                            {uploadedFile ? <><FileType size={16} /> {uploadedFile.name}</> : "Nhấp để tải lên..."}
                                        </span>
                                        <UploadCloud size={16} className={uploadedFile ? "text-indigo-500" : "text-slate-400"} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            label="Ghi chú mở đầu / Tình trạng hiện tại"
                            placeholder="Mô tả tóm tắt lý do mở case hoặc các vấn đề cần lưu ý đặc biệt từ chủ nhà..."
                            value={initialNote}
                            onChange={(e: any) => setInitialNote(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                        <Button className="flex-1 gap-2 shadow-lg shadow-indigo-100 font-bold" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Đang mở Case..." : "Xác nhận Mở Case"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <CreateCustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSuccess={handleNewCustomer}
            />
            <CreatePropertyModal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
                onSuccess={handleNewProperty}
            />
        </>
    );
};

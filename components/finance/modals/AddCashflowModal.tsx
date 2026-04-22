import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Card, CardContent, toast, Select, Switch } from '../../ui';
import { CareCase, CostCategoryItem } from '../../../types';
import { Upload, Plus, X, Search } from 'lucide-react';
import { getCostItems, saveCostItem, getCostGroups } from '../../../data/settingsFactory';
import * as FinanceFactory from '../../../data/financeFactory';
import * as SettingsFactory from '../../../data/settingsFactory';
import { cn } from '../../../utils';

interface Props {
    careCase: CareCase;
    isOpen: boolean;
    onClose: () => void;
}

export const AddCashflowModal: React.FC<Props> = ({ careCase, isOpen, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'REVENUE' | 'EXPENSE'>('REVENUE');
    const [categoryName, setCategoryName] = useState('');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState(careCase.ownerName);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    // Categories Autocomplete & New Category State
    const [categories, setCategories] = useState<CostCategoryItem[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newCategoryGroupId, setNewCategoryGroupId] = useState('');
    const [newCategoryIsTaxable, setNewCategoryIsTaxable] = useState(true);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        SettingsFactory.getCostItems().then(setCategories);
        SettingsFactory.getCostGroups().then(setGroups);
    }, []);

    // Outside click to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSuggestions = categories.filter(c =>
        c.type === type &&
        c.name.toLowerCase().includes(categoryName.toLowerCase())
    );

    const isNewCategory = categoryName.trim().length > 0 &&
        !categories.some(c => c.type === type && c.name.toLowerCase() === categoryName.trim().toLowerCase());

    const availableGroups = groups.filter(g => g.type === type);

    useEffect(() => {
        setNewCategoryIsTaxable(type === 'EXPENSE');
        if (availableGroups.length > 0) {
            setNewCategoryGroupId(availableGroups[0].id);
        }
    }, [type, groups]);

    const handleSubmit = async () => {
        if (!date || !categoryName || !amount || !payer) {
            toast('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const amountNum = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(amountNum) || amountNum <= 0) {
            toast('Số tiền không hợp lệ');
            return;
        }

        setLoading(true);

        // Auto create category if doesn't exist
        let matchedCategory = categories.find(c => c.type === type && c.name.toLowerCase() === categoryName.toLowerCase());
        if (!matchedCategory) {
            matchedCategory = {
                id: `ITM_AUTO_${Date.now()}`,
                groupId: newCategoryGroupId || (type === 'REVENUE' ? 'GRP_OTHER' : 'GRP_TECH'),
                code: `AUTO_${Date.now().toString().slice(-4)}`,
                name: categoryName,
                description: 'Tự động tạo từ thêm dòng tiền',
                examples: '',
                type: type,
                tenantRelatedFlag: false,
                isTaxDeductible: newCategoryIsTaxable,
                requiresAttachment: false,
                isActive: true,
                displayOrder: 99,
                isDefaultSeeded: false
            };
            await SettingsFactory.saveCostItem(matchedCategory);
            // Refresh local state just in case
            setCategories(prev => [...prev, matchedCategory!]);
            toast(`Đã tự động tạo danh mục mới: ${categoryName}`);
        }

        // Create transaction amount (Ty VND) mock
        const amountTy = amountNum / 1000000000;

        const newEntry: any = {
            id: `cf_pending_${Date.now()}`,
            refNo: `CF-${Math.floor(Math.random() * 100000)}`,
            date: new Date(date).toISOString(),
            amountTy: amountTy,
            currency: 'VND',
            method: 'bank_transfer',
            payer: payer,
            type: matchedCategory.code, // Associate category code
            status: 'PENDING',
            createdBy: 'Admin Account',
            createdAt: new Date().toISOString(),
            isEnteredOnBehalf: false,
            allocatedAmountTy: 0,
            unappliedAmountTy: amountTy,
            attachments: attachedFile ? [{ id: 'att_1', fileName: attachedFile.name, sizeKb: Math.round(attachedFile.size / 1024), url: '#' }] : [],
            note: note,
            isTaxable: matchedCategory.isTaxDeductible
        };

        try {
            await FinanceFactory.createPendingCashflow(newEntry);
            toast('Đã thêm dòng tiền. Vui lòng chờ duyệt!');
            onClose();
        } catch (e) {
            toast('Có lỗi xảy ra khi tạo dòng tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB max
                toast('File quá lớn. Vui lòng chọn file dưới 2MB');
                return;
            }
            setAttachedFile(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm Dòng Tiền Mới" size="xl">
            <div className="p-6 space-y-6">

                {/* Type Selection */}
                <div className="flex space-x-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <button
                        onClick={() => { setType('REVENUE'); setCategoryName(''); }}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2 relative",
                            type === 'REVENUE' ? "bg-white text-emerald-600 border border-emerald-200" : "text-slate-500 hover:bg-slate-100 border border-transparent"
                        )}
                    >
                        {type === 'REVENUE' && <div className="absolute left-3 w-2 h-2 rounded-full bg-emerald-500" />}
                        DOANH THU (THU)
                    </button>
                    <button
                        onClick={() => { setType('EXPENSE'); setCategoryName(''); }}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2 relative",
                            type === 'EXPENSE' ? "bg-white text-rose-600 border border-rose-200" : "text-slate-500 hover:bg-slate-100 border border-transparent"
                        )}
                    >
                        {type === 'EXPENSE' && <div className="absolute left-3 w-2 h-2 rounded-full bg-rose-500" />}
                        CHI PHÍ (CHI)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Ngày nhận tiền <span className="text-rose-500">*</span></label>
                        <Input type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
                    </div>

                    <div className="space-y-2 relative" ref={suggestionsRef}>
                        <label className="text-xs font-bold text-slate-700 uppercase">Tên Danh mục (Thu/Chi) <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <Input
                                placeholder="VD: Tiền điện, Cọc..."
                                value={categoryName}
                                onChange={(e: any) => {
                                    setCategoryName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                        </div>
                        {showSuggestions && categoryName && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredSuggestions.length > 0 ? (
                                    filteredSuggestions.map(s => (
                                        <div
                                            key={s.id}
                                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium text-slate-700"
                                            onClick={() => {
                                                setCategoryName(s.name);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {s.name} <span className="text-[10px] text-slate-400 font-mono ml-2">{s.code}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-slate-500 italic flex items-center gap-2">
                                        <Plus size={14} className="text-indigo-500" /> Chưa có danh mục này. Sẽ tự động tạo mới khi lưu.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isNewCategory && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-900 uppercase">Thuộc Nhóm (Bắt buộc thiết lập) <span className="text-rose-500">*</span></label>
                                <Select
                                    value={newCategoryGroupId}
                                    onChange={(e: any) => setNewCategoryGroupId(e.target.value)}
                                    className="bg-white"
                                >
                                    {availableGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex items-center justify-between bg-white px-4 py-2 border border-slate-200 rounded-lg">
                                <div>
                                    <div className="text-sm font-bold text-slate-700">Tính thuế</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        {type === 'EXPENSE' ? 'Đánh dấu chi phí hợp lệ / có xuất hóa đơn' : 'Ghi nhận doanh thu chịu thuế'}
                                    </div>
                                </div>
                                <Switch
                                    checked={newCategoryIsTaxable}
                                    onChange={setNewCategoryIsTaxable}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Số tiền (VNĐ) <span className="text-rose-500">*</span></label>
                        <Input
                            placeholder="Vd: 15,000,000"
                            value={amount}
                            onChange={(e: any) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                            }}
                            className={cn("font-bold", type === 'REVENUE' ? "text-emerald-700" : "text-rose-700")}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Người nộp/người nhận tiền <span className="text-rose-500">*</span></label>
                        <Input value={payer} onChange={(e: any) => setPayer(e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Ghi chú</label>
                        <Input value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="Nhập ghi chú hoặc diễn giải..." />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Người nhập liệu (Tự động)</label>
                        <Input value="Admin Account" disabled className="bg-slate-50 text-slate-500 font-medium" />
                    </div>
                </div>

                {/* Upload Section */}
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                <Upload size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700">Tải lên chứng từ</h3>
                                <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, PDF (Tối đa 2MB)</p>
                            </div>

                            {attachedFile ? (
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 mt-2 shadow-sm">
                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{attachedFile.name}</span>
                                    <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="mt-4 inline-block cursor-pointer">
                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    <span className="inline-flex items-center gap-2 text-sm font-bold bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all">
                                        <Plus size={16} /> Chọn File
                                    </span>
                                </label>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" className="px-6 font-bold" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button className="px-8 font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi Phê Duyệt'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

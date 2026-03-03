import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select, Card, CardContent, toast } from '../../ui';
import { CareCase } from '../../../types';
import { Upload, Plus, X } from 'lucide-react';
import { createPendingCashflow } from '../../../data/financeFactory';

interface Props {
    careCase: CareCase;
    isOpen: boolean;
    onClose: () => void;
}

export const AddCashflowModal: React.FC<Props> = ({ careCase, isOpen, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('RENT_INCOME');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState(careCase.ownerName);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!date || !category || !amount || !payer) {
            toast('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const amountNum = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(amountNum) || amountNum <= 0) {
            toast('Số tiền không hợp lệ');
            return;
        }

        setLoading(true);

        // Tạo mốc tiền (Ty VND) mock
        const amountTy = amountNum / 1000000000;

        const newEntry: any = {
            id: `cf_pending_${Date.now()}`,
            refNo: `CF-${Math.floor(Math.random() * 100000)}`,
            date: new Date(date).toISOString(),
            amountTy: amountTy,
            currency: 'VND',
            method: 'bank_transfer', // Default for now
            payer: payer,
            type: category, // Giả sử map type thẳng từ category form
            status: 'PENDING',
            createdBy: 'Admin Account', // Demo user
            createdAt: new Date().toISOString(),
            isEnteredOnBehalf: false,
            allocatedAmountTy: 0,
            unappliedAmountTy: amountTy,
            attachments: attachedFile ? [{ id: 'att_1', fileName: attachedFile.name, sizeKb: Math.round(attachedFile.size / 1024), url: '#' }] : [],
            note: note,
            isTaxable: true // Auto for now
        };

        try {
            await createPendingCashflow(newEntry);
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
            if (file.size > 2 * 1024 * 1024) { // 2MB max cho demo
                toast('File quá lớn. Vui lòng chọn file dưới 2MB');
                return;
            }
            setAttachedFile(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm Dòng Tiền Mới" size="xl">
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Ngày nhận tiền <span className="text-rose-500">*</span></label>
                        <Input type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Danh mục <span className="text-rose-500">*</span></label>
                        <Select
                            value={category}
                            onChange={setCategory}
                            options={[
                                { value: 'RENT_INCOME', label: 'Thu tiền thuê nhà' },
                                { value: 'ASSET_OTHER_INCOME', label: 'Thu khác từ tài sản' },
                                { value: 'NON_REVENUE', label: 'Dòng tiền không doanh thu' },
                            ]}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Số tiền (VNĐ) <span className="text-rose-500">*</span></label>
                        <Input
                            placeholder="Vd: 15,000,000"
                            value={amount}
                            onChange={(e: any) => {
                                // Formatter simply numeric logic
                                const val = e.target.value.replace(/\D/g, '');
                                setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                            }}
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

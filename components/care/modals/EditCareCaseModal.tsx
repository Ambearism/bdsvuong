import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Input, Select } from '../../../components/ui';
import { CareCase } from '../../../types';

interface EditCareCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    careCase: CareCase;
    onSave: (data: Partial<CareCase>) => Promise<void>;
}

export const EditCareCaseModal: React.FC<EditCareCaseModalProps> = ({ isOpen, onClose, careCase, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CareCase>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ownerName: careCase.ownerName,
                ownerPhone: careCase.ownerPhone,
                assignedTo: careCase.assignedTo,
                status: careCase.status,
            });
        }
    }, [isOpen, careCase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa Care Case">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên chủ nhà/Đối tác</label>
                    <Input
                        value={formData.ownerName || ''}
                        onChange={(e: any) => setFormData({ ...formData, ownerName: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                    <Input
                        value={formData.ownerPhone || ''}
                        onChange={(e: any) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người phụ trách (CSKH)</label>
                    <Select
                        value={formData.assignedTo || ''}
                        onChange={(v) => setFormData({ ...formData, assignedTo: v })}
                        options={[
                            { label: 'Trịnh CSKH', value: 'Trịnh CSKH' },
                            { label: 'Lê CSKH', value: 'Lê CSKH' },
                            { label: 'Bảo CSKH', value: 'Bảo CSKH' }
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                    <Select
                        value={formData.status || 'active'}
                        onChange={(v) => setFormData({ ...formData, status: v as 'active' | 'inactive' })}
                        options={[
                            { label: 'Hoạt động', value: 'active' },
                            { label: 'Tạm ngưng', value: 'inactive' }
                        ]}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600">
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};


import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, toast } from '../ui';
import { Staff, Role } from '../../types';
import { User, Mail, Phone, Briefcase, Calendar, Facebook } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staff: Partial<Staff>) => void;
    editingStaff?: Staff | null;
    roles: Role[];
}

export const CreateStaffModal: React.FC<Props> = ({ isOpen, onClose, onSave, editingStaff, roles }) => {
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: '',
        email: '',
        phone: '',
        title: '',
        yearsOfExp: 0,
        roleId: roles[0]?.id || '',
        facebook: '',
        status: 'active'
    });

    useEffect(() => {
        if (editingStaff) {
            setFormData(editingStaff);
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                title: '',
                yearsOfExp: 0,
                roleId: roles[0]?.id || '',
                facebook: '',
                status: 'active'
            });
        }
    }, [editingStaff, isOpen, roles]);

    const handleSave = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast("Vui lòng điền đủ thông tin bắt buộc (Tên, Email, SĐT)", "error");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingStaff ? `Chỉnh sửa: ${editingStaff.name}` : "Tạo tài khoản nhân viên mới"}
            size="lg"
        >
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Họ và Tên <span className="text-rose-500">*</span></label>
                        <Input
                            placeholder="Nguyễn Văn A"
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            icon={<User size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại <span className="text-rose-500">*</span></label>
                        <Input
                            placeholder="0912345678"
                            value={formData.phone}
                            onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                            icon={<Phone size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="text-rose-500">*</span></label>
                        <Input
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                            icon={<Mail size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Chức danh</label>
                        <Input
                            placeholder="Chuyên viên môi giới"
                            value={formData.title}
                            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                            icon={<Briefcase size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Số năm kinh nghiệm</label>
                        <Input
                            type="number"
                            placeholder="10"
                            value={formData.yearsOfExp}
                            onChange={(e: any) => setFormData({ ...formData, yearsOfExp: parseInt(e.target.value) || 0 })}
                            icon={<Calendar size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phân quyền (Role)</label>
                        <Select
                            value={formData.roleId}
                            onChange={(val) => setFormData({ ...formData, roleId: val })}
                            options={roles.map(r => ({ label: r.name, value: r.id }))}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Link Facebook</label>
                    <Input
                        placeholder="https://facebook.com/username"
                        value={formData.facebook}
                        onChange={(e: any) => setFormData({ ...formData, facebook: e.target.value })}
                        icon={<Facebook size={18} className="text-slate-400" />}
                        className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all font-bold"
                    />
                </div>

                <div className="flex gap-4 pt-6">
                    <Button variant="ghost" className="flex-1 h-12 font-black text-slate-500 uppercase tracking-widest" onClick={onClose}>Hủy bỏ</Button>
                    <Button variant="primary" className="flex-1 h-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-100" onClick={handleSave}>
                        {editingStaff ? "Cập nhật" : "Tạo tài khoản"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

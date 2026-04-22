
import React, { useState } from 'react';
import { RoleSelectorList } from '../../../components/staff/RoleSelectorList';
import { PermissionsList } from '../../../components/staff/PermissionsList';
import { Modal } from '../../../components/common/Modal';
import { Button, Input, toast } from '../../../components/ui';
import { ALL_ROLES, PERMISSION_GROUPS } from '../../../data';
import { Role, PermissionGroup } from '../../../types';
import { ShieldAlert, Plus, Save, Settings } from 'lucide-react';

export default function PermissionsPage() {
    const [roles, setRoles] = useState<Role[]>(ALL_ROLES);
    const [selectedRoleId, setSelectedRoleId] = useState<string>(ALL_ROLES[0]?.id || '');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleName, setNewRoleName] = useState('');

    const selectedRole = roles.find(r => r.id === selectedRoleId) || null;

    const handleUpdatePermissions = (permissionKeys: string[]) => {
        setRoles(prev => prev.map(r =>
            r.id === selectedRoleId ? { ...r, permissions: permissionKeys } : r
        ));
    };

    const handleAddRole = () => {
        setEditingRole(null);
        setNewRoleName('');
        setIsRoleModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setNewRoleName(role.name);
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vai trò này? Tất cả nhân viên thuộc vai trò này sẽ bị ảnh hưởng.")) {
            setRoles(prev => prev.filter(r => r.id !== id));
            if (selectedRoleId === id) setSelectedRoleId(roles[0]?.id || '');
            toast("Đã xóa vai trò thành công");
        }
    };

    const handleSaveRole = () => {
        if (!newRoleName.trim()) {
            toast("Vui lòng nhập tên vai trò", "error");
            return;
        }

        if (editingRole) {
            setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: newRoleName } : r));
            toast("Đã cập nhật tên vai trò");
        } else {
            const newRole: Role = {
                id: `role_${Date.now()}`,
                name: newRoleName,
                color: 'slate',
                permissions: []
            };
            setRoles(prev => [...prev, newRole]);
            setSelectedRoleId(newRole.id);
            toast("Đã tạo vai trò mới");
        }
        setIsRoleModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                        <Settings className="text-indigo-500" size={28} />
                        PHÂN QUYỀN VAI TRÒ
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Thiết lập các nhóm quyền hạn chi tiết cho từng vai trò trong hệ thống</p>
                </div>
            </div>

            <div className="flex gap-6 h-full min-h-0">
                <div className="w-[350px] shrink-0">
                    <RoleSelectorList
                        roles={roles}
                        selectedRoleId={selectedRoleId}
                        onSelectRole={setSelectedRoleId}
                        onAddRole={handleAddRole}
                        onEditRole={handleEditRole}
                        onDeleteRole={handleDeleteRole}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <PermissionsList
                        permissionGroups={PERMISSION_GROUPS}
                        selectedRole={selectedRole}
                        onUpdatePermissions={handleUpdatePermissions}
                    />
                </div>
            </div>

            {/* Role Editor Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title={editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
                size="md"
            >
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tên vai trò (Role Name)</label>
                        <Input
                            placeholder="Ví dụ: Giám đốc kinh doanh"
                            value={newRoleName}
                            onChange={(e: any) => setNewRoleName(e.target.value)}
                            icon={<ShieldAlert size={18} className="text-slate-400" />}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 rounded-xl font-black"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" className="flex-1 h-12 font-black uppercase tracking-widest text-slate-500" onClick={() => setIsRoleModalOpen(false)}>Hủy</Button>
                        <Button variant="primary" className="flex-1 h-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-100" onClick={handleSaveRole}>
                            Lưu
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

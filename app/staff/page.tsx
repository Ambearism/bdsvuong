
import React, { useState } from 'react';
import { StaffListTable } from '../../components/staff/StaffListTable';
import { CreateStaffModal } from '../../components/staff/CreateStaffModal';
import { ALL_STAFF, ALL_ROLES } from '../../data';
import { Staff, Role } from '../../types';
import { Button, Input, Select, toast, Card, CardHeader, CardContent } from '../../components/ui';
import { Plus, Search, Filter, RefreshCcw, UserPlus } from 'lucide-react';

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>(ALL_STAFF);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('tat_ca');

    const filteredStaff = staffList.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.phone.includes(search) ||
            s.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'tat_ca' || s.roleId === roleFilter;
        return matchSearch && matchRole;
    });

    const handleSave = (data: Partial<Staff>) => {
        if (editingStaff) {
            setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
            toast("Đã cập nhật thông tin nhân viên");
        } else {
            const newStaff: Staff = {
                ...data as Staff,
                id: (staffList.length + 1).toString(),
                roleName: ALL_ROLES.find(r => r.id === data.roleId)?.name || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                avatar: `https://i.pravatar.cc/150?u=${staffList.length + 1}`
            };
            setStaffList(prev => [...prev, newStaff]);
            toast("Đã tạo tài khoản nhân viên mới");
        }
        setEditingStaff(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
            setStaffList(prev => prev.filter(s => s.id !== id));
            toast("Đã xóa tài khoản nhân viên");
        }
    };

    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const handleStatusChange = (id: string, status: 'active' | 'inactive') => {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s));
        toast(`Đã ${status === 'active' ? 'kích hoạt' : 'khóa'} tài khoản`);
    };

    const handleRoleChange = (id: string, roleId: string) => {
        const roleName = ALL_ROLES.find(r => r.id === roleId)?.name || '';
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, roleId, roleName, updatedAt: new Date().toISOString() } : s));
        toast(`Đã thay đổi quyền hạn thành: ${roleName}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">QUẢN LÝ NHÂN VIÊN</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Danh sách tất cả tài khoản nhân viên và cộng tác viên trong hệ thống</p>
                </div>
                <Button
                    className="gap-2 h-11 px-6 font-black uppercase tracking-widest shadow-lg shadow-indigo-100 ring-4 ring-indigo-50"
                    onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
                >
                    <UserPlus size={18} /> Tạo mới
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-visible">
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[300px] relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <Input
                                placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                                className="pl-11 h-11 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                                value={search}
                                onChange={(e: any) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl">
                                <Filter size={16} className="text-slate-500" />
                                <Select
                                    value={roleFilter}
                                    onChange={setRoleFilter}
                                    options={[
                                        { label: 'Tất cả vai trò', value: 'tat_ca' },
                                        ...ALL_ROLES.map(r => ({ label: r.name, value: r.id }))
                                    ]}
                                    className="border-none bg-transparent h-full font-bold text-slate-700 min-w-[150px]"
                                />
                            </div>

                            <Button variant="ghost" className="h-11 w-11 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all hover:rotate-180 duration-500">
                                <RefreshCcw size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <StaffListTable
                            staffList={filteredStaff}
                            roles={ALL_ROLES}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            onRoleChange={handleRoleChange}
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 italic">Hiển thị {filteredStaff.length} / {staffList.length} nhân viên</p>
                        <div className="flex items-center gap-2">
                            {/* Basic pagination mock */}
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-black rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">1</Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-bold text-slate-500 hover:bg-slate-50">2</Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-bold text-slate-500 hover:bg-slate-50">3</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CreateStaffModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingStaff(null); }}
                onSave={handleSave}
                editingStaff={editingStaff}
                roles={ALL_ROLES}
            />
        </div>
    );
}

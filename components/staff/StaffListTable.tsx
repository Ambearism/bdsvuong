
import React from 'react';
import { Staff, Role } from '../../types';
import {
    Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
    Button, Badge, Switch, Select, Avatar
} from '../ui';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../../utils';

interface Props {
    staffList: Staff[];
    roles: Role[];
    onEdit: (staff: Staff) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: 'active' | 'inactive') => void;
    onRoleChange: (id: string, roleId: string) => void;
}

export const StaffListTable: React.FC<Props> = ({
    staffList, roles, onEdit, onDelete, onStatusChange, onRoleChange
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="w-[80px] font-black text-slate-500 uppercase text-[10px]">ID NV</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Tên NV</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Số ĐT</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Email</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Chức Danh</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Năm KN</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px] text-center">Facebook</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px] w-[180px]">Role</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Ngày Tạo</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px]">Cập Nhật Cuối</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px] text-center">Trạng thái</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[10px] text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staffList.map((staff) => (
                        <TableRow key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="font-bold text-slate-500">{staff.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <img src={staff.avatar} alt={staff.name} className="object-cover" />
                                    </Avatar>
                                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">{staff.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-bold text-slate-600 tabular-nums whitespace-nowrap">{staff.phone}</TableCell>
                            <TableCell className="text-slate-500 text-xs whitespace-nowrap">{staff.email}</TableCell>
                            <TableCell className="text-slate-500 text-xs italic">{staff.title}</TableCell>
                            <TableCell className="font-bold text-slate-700 text-center">{staff.yearsOfExp}</TableCell>
                            <TableCell className="text-center">
                                {staff.facebook && (
                                    <a href={staff.facebook} target="_blank" rel="noopener noreferrer" className="inline-block p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                                {!staff.facebook && <span className="text-slate-300">--</span>}
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={staff.roleId}
                                    onChange={(val) => onRoleChange(staff.id, val)}
                                    options={roles.map(r => ({ label: r.name, value: r.id }))}
                                    className="h-8 text-[11px] font-bold min-w-[130px]"
                                />
                            </TableCell>
                            <TableCell className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                {new Date(staff.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                {new Date(staff.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(staff.updatedAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={staff.status === 'active'}
                                    onChange={(checked) => onStatusChange(staff.id, checked ? 'active' : 'inactive')}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100" onClick={() => onEdit(staff)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100" onClick={() => onDelete(staff.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

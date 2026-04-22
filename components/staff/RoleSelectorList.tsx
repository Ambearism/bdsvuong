
import React from 'react';
import { Role } from '../../types';
import { Button } from '../ui';
import { Shield, Edit2, Trash2, Plus } from 'lucide-react';
import { cn } from '../../utils';

interface Props {
    roles: Role[];
    selectedRoleId: string;
    onSelectRole: (roleId: string) => void;
    onAddRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
}

export const RoleSelectorList: React.FC<Props> = ({
    roles, selectedRoleId, onSelectRole, onAddRole, onEditRole, onDeleteRole
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Danh sách vai trò</h3>
                <Button size="sm" variant="primary" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-1.5 shadow-md shadow-indigo-100" onClick={onAddRole}>
                    <Plus size={14} /> Tạo mới
                </Button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        onClick={() => onSelectRole(role.id)}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                            selectedRoleId === role.id
                                ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                selectedRoleId === role.id ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                            )}>
                                <Shield size={16} />
                            </div>
                            <span className={cn(
                                "font-black text-sm",
                                selectedRoleId === role.id ? "text-indigo-700" : "text-slate-600"
                            )}>
                                {role.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                onClick={(e) => { e.stopPropagation(); onEditRole(role); }}
                            >
                                <Edit2 size={12} />
                            </button>
                            <button
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                onClick={(e) => { e.stopPropagation(); onDeleteRole(role.id); }}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

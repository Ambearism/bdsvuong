
import React from 'react';
import { PermissionGroup, Role } from '../../types';
import { Switch, Button, toast } from '../ui';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../utils';

interface Props {
    permissionGroups: PermissionGroup[];
    selectedRole: Role | null;
    onUpdatePermissions: (permissionKeys: string[]) => void;
}

export const PermissionsList: React.FC<Props> = ({
    permissionGroups, selectedRole, onUpdatePermissions
}) => {
    const [activePermissions, setActivePermissions] = React.useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = React.useState<string[]>(permissionGroups.map(g => g.category));

    React.useEffect(() => {
        if (selectedRole) {
            setActivePermissions(selectedRole.permissions);
        }
    }, [selectedRole]);

    const togglePermission = (key: string) => {
        setActivePermissions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleSave = () => {
        onUpdatePermissions(activePermissions);
        toast("Đã lưu thay đổi phân quyền thành công");
    };

    if (!selectedRole) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <ChevronRight size={32} />
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-2">Chưa chọn vai trò</h3>
                <p className="text-slate-500 text-xs font-medium max-w-[200px]">Hãy chọn một vai trò bên trái để bắt đầu thiết lập quyền hạn chi tiết</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Phân quyền chi tiết: {selectedRole.name}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {permissionGroups.map((group) => (
                    <div key={group.category} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/50">
                        <div
                            onClick={() => toggleCategory(group.category)}
                            className="px-4 py-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-indigo-500">
                                    {expandedCategories.includes(group.category) ? <ChevronDown size={18} strokeWidth={3} /> : <ChevronRight size={18} strokeWidth={3} />}
                                </div>
                                <span className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{group.category}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{group.permissions.length} Quyền</span>
                        </div>

                        {expandedCategories.includes(group.category) && (
                            <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                                {group.permissions.map((permission) => (
                                    <div
                                        key={permission.key}
                                        className={cn(
                                            "p-3 rounded-xl border border-slate-50 flex items-center justify-between transition-all group",
                                            activePermissions.includes(permission.key) ? "bg-indigo-50/30 border-indigo-100" : "hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className={cn(
                                                "text-[11px] font-black uppercase tracking-tight truncate",
                                                activePermissions.includes(permission.key) ? "text-indigo-600" : "text-slate-600"
                                            )}>
                                                {permission.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{permission.description}</span>
                                        </div>
                                        <Switch
                                            checked={activePermissions.includes(permission.key)}
                                            onChange={() => togglePermission(permission.key)}
                                            className="data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                <Button
                    variant="primary"
                    className="h-11 px-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 rounded-xl gap-2 active:scale-95 transition-transform"
                    onClick={handleSave}
                >
                    <Save size={18} /> Lưu thay đổi
                </Button>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Skeleton, TooltipWrapper, Select } from '../ui';
import { Project, ProjectProperty } from '../../types';
import { getProjects, getProjectProperties } from '../../data/mockProjects';
import { Building2, Search, Filter, Upload, Image as ImageIcon, ExternalLink, Edit2, Check, X, RotateCcw } from 'lucide-react';
import { BulkUploadModal } from './BulkUploadModal';
import { cn } from '../../utils';

interface ProjectHubDrawerProps {
    projectId: string | null;
    onClose: () => void;
}

export const ProjectHubDrawer: React.FC<ProjectHubDrawerProps> = ({ projectId, onClose }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [properties, setProperties] = useState<ProjectProperty[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [selectedZone, setSelectedZone] = useState('tat_ca');
    const [selectedBlock, setSelectedBlock] = useState('tat_ca');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', unitNo: '', block: '', zone: '' });
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        if (!projectId) return;

        setLoading(true);
        Promise.all([
            getProjects().then(res => res.find(p => p.id === projectId) || null),
            getProjectProperties(projectId)
        ]).then(([projData, propData]) => {
            setProject(projData);
            setProperties(propData);
            setLoading(false);
        });
    }, [projectId]);

    if (!projectId) return null;

    const handleEdit = (item: ProjectProperty, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(item.id);
        setEditForm({ name: item.name, unitNo: item.unitNo, block: item.block, zone: item.zone });
    };

    const handleSave = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProperties(prev => prev.map(p => p.id === id ? { ...p, ...editForm } : p));
        setEditingId(null);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleViewPropertyHub = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingId) return;
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'property_hub', id } }));
    };

    // Build Filter Options
    const zones = Array.from(new Set(properties.map(p => p.zone))).map(z => ({ label: z, value: z }));
    const blocks = Array.from(new Set(properties.map(p => p.block))).map(b => ({ label: b, value: b }));

    // Apply filters
    let filteredProps = properties;
    if (search) {
        filteredProps = filteredProps.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.unitNo.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedZone !== 'tat_ca') {
        filteredProps = filteredProps.filter(p => p.zone === selectedZone);
    }
    if (selectedBlock !== 'tat_ca') {
        filteredProps = filteredProps.filter(p => p.block === selectedBlock);
    }

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-[800px] h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300 border-l border-slate-200">
                {/* Header Breadcrumb */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-600" onClick={onClose}>Dự Án</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{project?.id}</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Building2 size={24} className="text-indigo-600" /> {project?.name || 'Đang tải...'}
                        </h1>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                    {/* Toolbar */}
                    <Card className="border-slate-200 shadow-sm bg-white shrink-0">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                <div className="relative w-full sm:w-[350px]">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white text-sm w-full transition-all"
                                        placeholder="Tìm Tên HH hoặc Căn Số..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md h-10 px-4 text-white text-sm" onClick={() => setIsUploadOpen(true)}>
                                        <Upload size={16} /> Upload Ảnh
                                    </Button>
                                    <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm h-10 px-4 text-sm" onClick={() => setIsUploadOpen(true)}>
                                        <ImageIcon size={16} /> Upload hàng loạt
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
                                    <Filter size={12} /> Lọc:
                                </div>
                                <Select
                                    className="h-10 text-sm w-[140px]"
                                    placeholder="Phân Khu"
                                    value={selectedZone}
                                    onChange={setSelectedZone}
                                    options={[{ label: 'Tất cả Khu', value: 'tat_ca' }, ...zones]}
                                />
                                <Select
                                    className="h-10 text-sm w-[140px]"
                                    placeholder="Phân Lô/Tòa"
                                    value={selectedBlock}
                                    onChange={setSelectedBlock}
                                    options={[{ label: 'Tất cả Lô/Tòa', value: 'tat_ca' }, ...blocks]}
                                />
                                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSelectedZone('tat_ca'); setSelectedBlock('tat_ca'); }} className="text-slate-400 hover:text-rose-600 h-10 px-3">
                                    <RotateCcw size={14} className="mr-2" /> Reset
                                </Button>
                                <TooltipWrapper content="Xem toàn màn hình">
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm" onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'project_hub', id: projectId } })); }}>
                                        <ExternalLink size={16} />
                                    </Button>
                                </TooltipWrapper>
                            </div>
                        </div>
                    </Card>

                    {/* Property List Table */}
                    <Card className="border-slate-200 shadow-md bg-white overflow-hidden flex flex-col">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Tên HH</th>
                                        <th className="px-4 py-3">Căn Số</th>
                                        <th className="px-4 py-3">Phân Lô</th>
                                        <th className="px-4 py-3">Phân Khu</th>
                                        <th className="px-4 py-3 w-16 text-center">Ảnh</th>
                                        <th className="px-4 py-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                                    {loading ? (
                                        Array(4).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={5} className="p-4"><Skeleton className="h-14 w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredProps.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Filter size={32} className="text-slate-300 mb-3" />
                                                    <p className="font-medium">Không tìm thấy HH nào.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredProps.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={(e) => handleViewPropertyHub(item.id, e)}>
                                            <td className="px-4 py-3">
                                                {editingId === item.id ? (
                                                    <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-xs w-full" onClick={e => e.stopPropagation()} />
                                                ) : (
                                                    <div className="font-black text-slate-800">{item.name}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === item.id ? (
                                                    <Input value={editForm.unitNo} onChange={e => setEditForm({ ...editForm, unitNo: e.target.value })} className="h-8 text-xs w-full" onClick={e => e.stopPropagation()} placeholder="Căn số" />
                                                ) : (
                                                    <div className="font-bold text-slate-600 uppercase tracking-tighter">{item.unitNo}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === item.id ? (
                                                    <Input value={editForm.block} onChange={e => setEditForm({ ...editForm, block: e.target.value })} className="h-8 text-xs w-full" onClick={e => e.stopPropagation()} />
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                        {item.block}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === item.id ? (
                                                    <Input value={editForm.zone} onChange={e => setEditForm({ ...editForm, zone: e.target.value })} className="h-8 text-xs w-full" onClick={e => e.stopPropagation()} />
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                        {item.zone}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 mx-auto bg-slate-100 flex items-center justify-center">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={16} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1">
                                                    {editingId === item.id ? (
                                                        <>
                                                            <TooltipWrapper content="Lưu">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 bg-emerald-50" onClick={(e) => handleSave(item.id, e)}>
                                                                    <Check size={14} />
                                                                </Button>
                                                            </TooltipWrapper>
                                                            <TooltipWrapper content="Hủy">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={handleCancel}>
                                                                    <X size={14} />
                                                                </Button>
                                                            </TooltipWrapper>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TooltipWrapper content="Chỉnh sửa">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={(e) => handleEdit(item, e)}>
                                                                    <Edit2 size={14} />
                                                                </Button>
                                                            </TooltipWrapper>
                                                            <TooltipWrapper content="Xem trên web">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={(e) => handleViewPropertyHub(item.id, e)}>
                                                                    <ExternalLink size={14} />
                                                                </Button>
                                                            </TooltipWrapper>
                                                            <TooltipWrapper content="Xem Ảnh">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={(e) => { e.stopPropagation(); alert("Xem Ảnh " + item.name); }}>
                                                                    <ImageIcon size={14} />
                                                                </Button>
                                                            </TooltipWrapper>
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    accept="image/*"
                                                                    title="Tải ảnh lên (Tối đa 1MB)"
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            if (file.size > 1024 * 1024) {
                                                                                alert("File ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.");
                                                                                e.target.value = ''; // Reset
                                                                                return;
                                                                            }

                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => {
                                                                                const imageUrl = event.target?.result as string;
                                                                                setProperties(prev => prev.map(p => p.id === item.id ? { ...p, image: imageUrl } : p));
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                                <TooltipWrapper content="Tải ảnh">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg pointer-events-none">
                                                                        <Upload size={14} />
                                                                    </Button>
                                                                </TooltipWrapper>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <BulkUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={() => setIsUploadOpen(false)}
            />
        </div>
    );
};

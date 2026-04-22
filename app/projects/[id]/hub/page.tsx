'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Skeleton, TooltipWrapper, Select } from '../../../../components/ui';
import { Project, ProjectProperty } from '../../../../types';
import { getProjects, getProjectProperties } from '../../../../data/mockProjects';
import { Building2, Search, ArrowLeft, Filter, Upload, Image as ImageIcon, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { BulkUploadModal } from '../../../../components/projects/BulkUploadModal';

interface Props {
    id: string;
}

export default function ProjectHubPage({ id }: Props) {
    const [project, setProject] = useState<Project | null>(null);
    const [properties, setProperties] = useState<ProjectProperty[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [selectedZone, setSelectedZone] = useState('tat_ca');
    const [selectedBlock, setSelectedBlock] = useState('tat_ca');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', unitNo: '', block: '', zone: '' });
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getProjects().then(res => res.find(p => p.id === id) || null),
            getProjectProperties(id)
        ]).then(([projData, propData]) => {
            setProject(projData);
            setProperties(propData);
            setLoading(false);
        });
    }, [id]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'projects' }));
    };

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 h-full flex flex-col">
            {/* Header Breadcrumb */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="hover:bg-slate-200" onClick={handleBack}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-600" onClick={handleBack}>Dự Án</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{project?.id}</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Building2 size={24} className="text-indigo-600" /> {project?.name || 'Đang tải...'}
                    </h1>
                </div>
            </div>

            {/* Toolbar */}
            <Card className="border-slate-200 shadow-sm bg-white shrink-0">
                <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input
                                    className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white"
                                    placeholder="Tìm theo Tên HH hoặc Căn Số..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mx-2">
                                <Filter size={14} /> Lọc:
                            </div>
                            <Select
                                className="w-full sm:w-[160px] h-11"
                                placeholder="Phân Khu"
                                value={selectedZone}
                                onChange={setSelectedZone}
                                options={[{ label: 'Tất cả Phân Khu', value: 'tat_ca' }, ...zones]}
                            />
                            <Select
                                className="w-full sm:w-[160px] h-11"
                                placeholder="Phân Lô/Tòa"
                                value={selectedBlock}
                                onChange={setSelectedBlock}
                                options={[{ label: 'Tất cả Lô/Tòa', value: 'tat_ca' }, ...blocks]}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                            <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 h-11 px-4 w-full sm:w-auto">
                                <ImageIcon size={16} /> Upload Ảnh HH
                            </Button>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md h-11 px-6 w-full sm:w-auto text-white" onClick={() => setIsUploadOpen(true)}>
                                <Upload size={16} /> Upload Ảnh Hàng Loạt
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Property List Table */}
            <Card className="flex-1 border-slate-200 shadow-md bg-white overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-20">Ảnh</th>
                                <th className="px-6 py-4">Tên HH (Hàng Hóa)</th>
                                <th className="px-6 py-4">Căn Số</th>
                                <th className="px-6 py-4">Phân Lô / Tòa</th>
                                <th className="px-6 py-4">Phân Khu</th>
                                <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm bg-white">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="p-4"><Skeleton className="h-16 w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredProps.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Filter size={40} className="text-slate-300 mb-4" />
                                            <p className="font-medium">Không tìm thấy hàng hóa nào phù hợp dự án này.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProps.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={(e) => handleViewPropertyHub(item.id, e)}>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-shadow">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-sm w-[160px]" onClick={e => e.stopPropagation()} />
                                        ) : (
                                            <>
                                                <div className="font-black text-slate-900">{item.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">ID: {item.id}</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {editingId === item.id ? (
                                            <Input value={editForm.unitNo} onChange={e => setEditForm({ ...editForm, unitNo: e.target.value })} className="h-8 text-sm w-[100px]" onClick={e => e.stopPropagation()} />
                                        ) : item.unitNo}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <Input value={editForm.block} onChange={e => setEditForm({ ...editForm, block: e.target.value })} className="h-8 text-sm w-[100px]" onClick={e => e.stopPropagation()} />
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                {item.block}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <Input value={editForm.zone} onChange={e => setEditForm({ ...editForm, zone: e.target.value })} className="h-8 text-sm w-[100px]" onClick={e => e.stopPropagation()} />
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                {item.zone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            {editingId === item.id ? (
                                                <>
                                                    <TooltipWrapper content="Lưu thay đổi">
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
                                                    <TooltipWrapper content="Chỉnh sửa chi tiết">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={(e) => handleEdit(item, e)}>
                                                            <Edit2 size={16} />
                                                        </Button>
                                                    </TooltipWrapper>
                                                    <TooltipWrapper content="Xem Ảnh Lớn">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg">
                                                            <ImageIcon size={16} />
                                                        </Button>
                                                    </TooltipWrapper>
                                                    <TooltipWrapper content="Xem trên web">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                            <ExternalLink size={16} />
                                                        </Button>
                                                    </TooltipWrapper>
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

            <BulkUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={() => setIsUploadOpen(false)}
            />
        </div>
    );
}

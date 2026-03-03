'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Skeleton, TooltipWrapper } from '../../components/ui';
import { Project } from '../../types';
import { getProjects } from '../../data/mockProjects';
import { Building2, Search, Plus, ExternalLink, Edit2, ArrowRight, Check, X } from 'lucide-react';
import { formatNumber } from '../../utils';
import { ProjectHubDrawer } from '../../components/projects/ProjectHubDrawer';

export default function ProjectListPage() {
    const [data, setData] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', totalZones: 0, totalBlocks: 0, totalUnits: 0 });
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getProjects().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    const handleViewHub = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (editingId) return; // disable click when editing
        setSelectedProjectId(id);
    };

    const handleEdit = (item: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(item.id);
        setEditForm({ name: item.name, totalZones: item.totalZones, totalBlocks: item.totalBlocks, totalUnits: item.totalUnits });
    };

    const handleSave = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setData(prev => prev.map(p => p.id === id ? { ...p, ...editForm, updatedAt: new Date().toISOString() } : p));
        setEditingId(null);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const filteredData = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Building2 size={28} className="text-indigo-600" /> Tra Cứu Dự Án
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Danh sách các dự án bất động sản trên hệ thống</p>
                </div>
                <Button className="gap-2 shadow-lg shadow-indigo-100 font-bold bg-indigo-600 h-11 px-6 text-[13px]">
                    <Plus size={18} /> Thêm Dự Án Mới
                </Button>
            </div>

            <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            className="pl-10 h-10 border-slate-200 bg-white shadow-sm"
                            placeholder="Tìm dự án theo tên hoặc mã..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Tên Dự Án</th>
                                    <th className="px-6 py-4 text-center">Tổng Phân Khu</th>
                                    <th className="px-6 py-4 text-center">Tổng Lô/Tòa</th>
                                    <th className="px-6 py-4 text-center">Tổng Số Căn</th>
                                    <th className="px-6 py-4">Ngày Tạo</th>
                                    <th className="px-6 py-4">Cập Nhật</th>
                                    <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm bg-white">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={7} className="p-4"><Skeleton className="h-12 w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-16 text-center text-slate-500">
                                            Không tìm thấy dự án nào phù hợp.
                                        </td>
                                    </tr>
                                ) : filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => handleViewHub(item.id)}>
                                        <td className="px-6 py-4">
                                            {editingId === item.id ? (
                                                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-sm w-[180px]" onClick={e => e.stopPropagation()} />
                                            ) : (
                                                <>
                                                    <div className="font-black text-slate-900 leading-tight">{item.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mã: {item.id}</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-indigo-600">
                                            {editingId === item.id ? (
                                                <Input type="number" value={editForm.totalZones === 0 ? '' : editForm.totalZones} onChange={e => setEditForm({ ...editForm, totalZones: parseInt(e.target.value) || 0 })} className="h-8 text-sm w-16 mx-auto text-center" onClick={e => e.stopPropagation()} />
                                            ) : formatNumber(item.totalZones)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-indigo-600">
                                            {editingId === item.id ? (
                                                <Input type="number" value={editForm.totalBlocks === 0 ? '' : editForm.totalBlocks} onChange={e => setEditForm({ ...editForm, totalBlocks: parseInt(e.target.value) || 0 })} className="h-8 text-sm w-16 mx-auto text-center" onClick={e => e.stopPropagation()} />
                                            ) : formatNumber(item.totalBlocks)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-black text-slate-800">
                                            {editingId === item.id ? (
                                                <Input type="number" value={editForm.totalUnits === 0 ? '' : editForm.totalUnits} onChange={e => setEditForm({ ...editForm, totalUnits: parseInt(e.target.value) || 0 })} className="h-8 text-sm w-20 mx-auto text-center" onClick={e => e.stopPropagation()} />
                                            ) : formatNumber(item.totalUnits)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
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
                                                        <TooltipWrapper content="Chỉnh sửa">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent" onClick={(e) => handleEdit(item, e)}>
                                                                <Edit2 size={14} />
                                                            </Button>
                                                        </TooltipWrapper>
                                                        <TooltipWrapper content="Xem trang Web dự án">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                                                <ExternalLink size={14} />
                                                            </Button>
                                                        </TooltipWrapper>
                                                        <TooltipWrapper content="Xem danh sách bảng hàng">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" onClick={(e) => handleViewHub(item.id, e)}>
                                                                <ArrowRight size={14} />
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
                </CardContent>
            </Card>

            <ProjectHubDrawer
                projectId={selectedProjectId}
                onClose={() => setSelectedProjectId(null)}
            />
        </div>
    );
}

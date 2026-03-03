'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Textarea, Badge, Skeleton, toast } from '../../../components/ui';
import { RentalCategory } from '../../../types';
import { getRentalCategories, saveRentalCategory, deleteRentalCategory } from '../../../data/settingsFactory';
import { Plus, Edit, Trash2, CheckCircle2, Tag } from 'lucide-react';

export default function RentalCategoriesPage() {
    const [categories, setCategories] = useState<RentalCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCat, setEditingCat] = useState<RentalCategory | null>(null); // null = list mode, obj = edit mode, {} = create mode

    const loadData = async () => {
        setLoading(true);
        const data = await getRentalCategories();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async () => {
        if (!editingCat) return;
        if (!editingCat.code || !editingCat.name) return toast("Vui lòng nhập Mã và Tên", "error");
        
        await saveRentalCategory(editingCat);
        toast("Đã lưu danh mục", "success");
        setEditingCat(null);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Xóa danh mục này?")) {
            await deleteRentalCategory(id);
            toast("Đã xóa", "success");
            loadData();
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-64 w-full"/></div>;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Danh Mục & Loại Hình Thuê</h1>
                    <p className="text-slate-500 text-sm mt-1">Phân loại hợp đồng để áp dụng chính sách thuế và báo cáo riêng biệt.</p>
                </div>
                <Button className="shadow-lg shadow-indigo-200 gap-2" onClick={() => setEditingCat({ id: '', code: '', name: '', description: '', isDefault: false, taxRatePercent: 10 })}>
                    <Plus size={18}/> Thêm danh mục
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    {categories.map(cat => (
                        <Card key={cat.id} className="hover:shadow-md transition-all border-slate-200">
                            <CardContent className="p-5 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                                        <Tag size={20}/>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800">{cat.name}</h3>
                                            <Badge variant="outline" className="font-mono text-xs">{cat.code}</Badge>
                                            {cat.isDefault && <Badge variant="success">Mặc định</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-500">{cat.description}</p>
                                        <div className="mt-3 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">
                                            Thuế suất áp dụng: {cat.taxRatePercent || 10}%
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => setEditingCat(cat)}>
                                        <Edit size={16}/>
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit/Create Column (Sticky) */}
                <div className="lg:col-span-1">
                    {editingCat ? (
                        <Card className="sticky top-6 border-indigo-200 shadow-lg ring-1 ring-indigo-50">
                            <div className="px-5 py-4 border-b border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-indigo-900">{editingCat.id ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}</h3>
                                <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)}>Đóng</Button>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <Input label="Mã (Code)" placeholder="RES" value={editingCat.code} onChange={(e) => setEditingCat({...editingCat, code: e.target.value.toUpperCase()})} />
                                    </div>
                                    <div className="col-span-2">
                                        <Input label="Tên hiển thị" placeholder="Căn hộ..." value={editingCat.name} onChange={(e) => setEditingCat({...editingCat, name: e.target.value})} />
                                    </div>
                                </div>
                                <Textarea label="Mô tả" placeholder="Mục đích sử dụng..." value={editingCat.description} onChange={(e) => setEditingCat({...editingCat, description: e.target.value})} />
                                
                                <Input label="Thuế suất mặc định (%)" type="number" value={editingCat.taxRatePercent || 0} onChange={(e) => setEditingCat({...editingCat, taxRatePercent: parseFloat(e.target.value)})} />

                                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" checked={editingCat.isDefault} onChange={(e) => setEditingCat({...editingCat, isDefault: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                                    <span className="text-sm font-medium text-slate-700">Đặt làm mặc định cho HĐ mới</span>
                                </label>

                                <div className="pt-2">
                                    <Button className="w-full" onClick={handleSave}>Lưu thay đổi</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                            <Tag size={48} className="mx-auto mb-2 opacity-20"/>
                            <p className="text-sm">Chọn một danh mục để chỉnh sửa hoặc tạo mới</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

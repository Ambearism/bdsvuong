
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Select, Input } from '../../components/ui';
import { PropertyListTable } from '../../components/hang-hoa/PropertyListTable';
import { CreatePropertyModal } from '../../components/properties/CreatePropertyModal';
import { MOCK_PROPERTIES, Property } from '../../data/mockProperties';
import { Search, Filter, RotateCcw, Plus, Calendar } from 'lucide-react';
import { cn } from '../../utils';

export default function PropertyListPage() {
    const [search, setSearch] = useState('');
    const [purpose, setPurpose] = useState('tat_ca');
    const [type, setType] = useState('tat_ca');
    const [status, setStatus] = useState('tat_ca');
    const [sort, setSort] = useState('moi_nhat');

    const [data, setData] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...MOCK_PROPERTIES];

            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
            }
            if (purpose !== 'tat_ca') filtered = filtered.filter(p => p.purpose === purpose);
            if (type !== 'tat_ca') filtered = filtered.filter(p => p.type === type);
            if (status !== 'tat_ca') filtered = filtered.filter(p => p.legalStatus === status);

            if (sort === 'moi_nhat') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            if (sort === 'gia_tang') filtered.sort((a, b) => (a.sellTotalTy || 0) - (b.sellTotalTy || 0));

            setData(filtered);
            setLoading(false);
        }, 600);
    }, [search, purpose, type, status, sort]);

    const handleReset = () => {
        setSearch('');
        setPurpose('tat_ca');
        setType('tat_ca');
        setStatus('tat_ca');
    };

    const handleCreateSuccess = (newProperty: Property) => {
        setData(prev => [newProperty, ...prev]);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <CreatePropertyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản Lý Kho Hàng <span className="text-indigo-600">(LIVE)</span></h1>
                    <p className="text-slate-500 text-sm mt-1">Danh sách bất động sản đang mở bán và cho thuê toàn hệ thống</p>
                </div>
                <div className="flex gap-3">
                    <Button className="gap-2 shadow-lg shadow-indigo-200 h-11 px-6" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} /> Thêm Hàng Mới
                    </Button>
                </div>
            </div>

            {/* Filters Sticky or Integrated */}
            <Card className="mb-6 border-slate-200 shadow-sm bg-white">
                <CardContent className="space-y-4">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between">
                        <div className="relative w-full xl:w-[450px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Tìm nhanh theo Mã, Tên BĐS, Dự án hoặc Chủ nhà..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full xl:w-auto">
                            <div className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-slate-50 gap-3 h-11 cursor-pointer hover:border-indigo-300 w-full xl:w-auto transition-colors">
                                <Calendar size={18} className="text-slate-400" />
                                <span className="font-medium">Thời gian: 01/11/2023 - 29/11/2023</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            <Filter size={12} /> Lọc theo:
                        </div>
                        <Select
                            className="w-[125px] h-9 text-[11px]"
                            placeholder="Mục đích"
                            value={purpose}
                            onChange={setPurpose}
                            options={[
                                { label: 'Tất cả', value: 'tat_ca' },
                                { label: 'Bán', value: 'ban' },
                                { label: 'Cho Thuê', value: 'cho_thue' }
                            ]}
                        />
                        <Select
                            className="w-[145px] h-9 text-[11px]"
                            placeholder="Loại hàng"
                            value={type}
                            onChange={setType}
                            options={[
                                { label: 'Tất cả', value: 'tat_ca' },
                                { label: 'Chung Cư', value: 'chung_cu' },
                                { label: 'Liên Kế', value: 'lien_ke' },
                                { label: 'Biệt Thự', value: 'biet_thu' },
                                { label: 'Nhà Riêng', value: 'nha_rieng' },
                                { label: 'Đất Nền', value: 'dat_nen' }
                            ]}
                        />
                        <Select
                            className="w-[155px] h-9 text-[11px]"
                            placeholder="Pháp lý"
                            value={status}
                            onChange={setStatus}
                            options={[
                                { label: 'Tất cả trạng thái', value: 'tat_ca' },
                                { label: 'Đã có Sổ Đỏ', value: 'co_so_do' },
                                { label: 'Chưa có sổ', value: 'chua_so_do' },
                                { label: 'Hợp đồng mua bán', value: 'dong_tien_do' }
                            ]}
                        />

                        <Select
                            className="w-[165px] h-9 text-[11px]"
                            placeholder="Sắp xếp"
                            value={sort}
                            onChange={setSort}
                            options={[
                                { label: 'Ngày tạo: Mới nhất', value: 'moi_nhat' },
                                { label: 'Giá: Thấp đến Cao', value: 'gia_tang' },
                                { label: 'Giá: Cao đến Thấp', value: 'gia_giam' }
                            ]}
                        />

                        <div className="flex-1 min-w-[20px]"></div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500 hover:text-indigo-600 font-bold text-xs h-9 px-3 border border-transparent hover:border-slate-200 hover:bg-white rounded-xl shrink-0">
                            <RotateCcw size={14} className="mr-2" /> Reset bộ lọc
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table - Stretch to fill bottom */}
            <Card className="flex-1 border-slate-200 shadow-md overflow-hidden bg-white flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-auto">
                    <PropertyListTable data={data} loading={loading} />
                </div>
                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-600 shrink-0">
                    <div>Đang hiển thị <b>1-{data.length}</b> trên tổng số <b>1.250</b> hàng hóa</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="h-9 px-4">Trang trước</Button>
                        <div className="flex gap-1">
                            {[1, 2, 3, '...', 42].map((p, i) => (
                                <button key={i} className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors", p === 1 ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-200 text-slate-600")}>
                                    {p}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" className="h-9 px-4">Trang sau</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

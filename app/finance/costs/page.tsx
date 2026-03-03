
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Select, Badge, Skeleton, toast } from '../../../components/ui';
import { CostEntry, CostCategoryItem } from '../../../types';
import { getCostEntries, deleteCostEntry } from '../../../data/costFactory';
import { getCostItems } from '../../../data/settingsFactory';
import { CostEntryModal } from '../../../components/finance/modals/CostEntryModal';
import { formatCurrencyTy, formatDateTimeVi } from '../../../utils';
import { Plus, Search, Filter, Calendar, FileText, Trash2, Download } from 'lucide-react';

export default function CostListPage() {
    const [data, setData] = useState<CostEntry[]>([]);
    const [itemsMap, setItemsMap] = useState<Record<string, CostCategoryItem>>({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [entries, items] = await Promise.all([getCostEntries(), getCostItems()]);
        
        // Create lookup map for items
        const map: Record<string, CostCategoryItem> = {};
        items.forEach(i => map[i.id] = i);
        setItemsMap(map);
        
        setData(entries);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn chắc chắn muốn xóa chi phí này?")) {
            await deleteCostEntry(id);
            toast("Đã xóa chi phí");
            fetchData();
        }
    };

    const filteredData = data.filter(d => 
        d.refNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemsMap[d.itemId]?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredData.reduce((acc, curr) => acc + curr.amountTy, 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <CostEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sổ Chi Phí Vận Hành</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý toàn bộ chi phí sửa chữa, bảo trì và vận hành tài sản.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white"><Download size={16} className="mr-2"/> Xuất Excel</Button>
                    <Button className="shadow-lg shadow-rose-100 bg-rose-600 hover:bg-rose-700" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2"/> Ghi nhận Chi phí
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng chi phí (Kỳ này)</p>
                    <div className="text-2xl font-black text-rose-600">{formatCurrencyTy(totalAmount)}</div>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số lượng phiếu</p>
                    <div className="text-2xl font-black text-slate-800">{filteredData.length}</div>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ngân sách còn lại</p>
                    <div className="text-2xl font-black text-emerald-600">--</div>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                            className="pl-9 h-10" 
                            placeholder="Tìm kiếm mã phiếu, nội dung..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="bg-white h-10"><Calendar size={16} className="mr-2"/> Thời gian</Button>
                        <Button variant="outline" className="bg-white h-10"><Filter size={16} className="mr-2"/> Lọc nâng cao</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Ngày / Số Phiếu</th>
                                <th className="px-6 py-4">Loại Chi Phí</th>
                                <th className="px-6 py-4">Tài Sản</th>
                                <th className="px-6 py-4 text-right">Số Tiền</th>
                                <th className="px-6 py-4">Diễn giải</th>
                                <th className="px-6 py-4 text-center">Chứng từ</th>
                                <th className="px-6 py-4 text-center">...</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8"><Skeleton className="h-10 w-full"/></td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={7} className="p-16 text-center text-slate-400 italic">Chưa có dữ liệu chi phí.</td></tr>
                            ) : filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{formatDateTimeVi(item.date).split(' ')[0]}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.refNo}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-700">{itemsMap[item.itemId]?.name}</div>
                                        <div className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">{itemsMap[item.itemId]?.code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        Asset #{item.assetId}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-rose-600">
                                        {formatCurrencyTy(item.amountTy)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 italic max-w-[200px] truncate">
                                        {item.note}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.attachments.length > 0 ? (
                                            <Badge variant="indigo" className="cursor-pointer"><FileText size={10} className="mr-1"/> {item.attachments.length}</Badge>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={() => handleDelete(item.id)}>
                                            <Trash2 size={14}/>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

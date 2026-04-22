
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Select, Switch, Badge, toast, Textarea } from '../ui';
import { CostCategoryGroup, CostCategoryItem } from '../../types';
import { getCostGroups, getCostItems, saveCostGroup, saveCostItem, deleteCostItem } from '../../data/settingsFactory';
import { Plus, Edit, Trash2, FolderOpen, Tag, Archive, ChevronRight, ChevronDown, Check, X, GripVertical } from 'lucide-react';
import { Modal } from '../common/Modal';
import { cn } from '../../utils';

export const CostCategorySettings = () => {
    const [groups, setGroups] = useState<CostCategoryGroup[]>([]);
    const [items, setItems] = useState<CostCategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState<'REVENUE' | 'EXPENSE'>('REVENUE');

    // UI State
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CostCategoryGroup | null>(null);
    const [editingItem, setEditingItem] = useState<CostCategoryItem | null>(null);

    // Initial Data Load
    const fetchData = async () => {
        setLoading(true);
        const [g, i] = await Promise.all([getCostGroups(), getCostItems()]);
        setGroups(g.sort((a, b) => a.displayOrder - b.displayOrder));
        setItems(i.sort((a, b) => a.displayOrder - b.displayOrder));
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- HANDLERS ---

    const handleAddGroup = () => {
        setEditingGroup({
            id: '', code: '', name: '', description: '', type: activeTab, displayOrder: groups.length + 1, isActive: true, isDefaultSeeded: false
        });
        setGroupModalOpen(true);
    };

    const handleEditGroup = (g: CostCategoryGroup, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingGroup({ ...g });
        setGroupModalOpen(true);
    };

    const handleAddItem = (groupId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const groupItems = items.filter(i => i.groupId === groupId);
        setEditingItem({
            id: '', groupId, code: '', name: '', description: '', examples: '', type: activeTab,
            tenantRelatedFlag: groupId === 'GRP_TENANT', // Intelligent default
            isTaxDeductible: activeTab === 'EXPENSE', requiresAttachment: false, isActive: true,
            displayOrder: groupItems.length + 1, isDefaultSeeded: false
        });
        setItemModalOpen(true);
    };

    const handleEditItem = (i: CostCategoryItem) => {
        setEditingItem({ ...i });
        setItemModalOpen(true);
    };

    const handleArchiveItem = async (i: CostCategoryItem) => {
        if (i.isDefaultSeeded) {
            // Just toggle active
            await saveCostItem({ ...i, isActive: !i.isActive });
            toast(i.isActive ? "Đã ẩn mục hệ thống" : "Đã kích hoạt mục hệ thống");
        } else {
            if (window.confirm("Bạn chắc chắn muốn xóa mục này?")) {
                await deleteCostItem(i.id);
                toast("Đã xóa mục dòng tiền");
            }
        }
        fetchData();
    };

    const saveGroup = async () => {
        if (!editingGroup || !editingGroup.name || !editingGroup.code) return toast("Thiếu thông tin bắt buộc", "error");
        await saveCostGroup(editingGroup);
        setGroupModalOpen(false);
        fetchData();
        toast("Đã lưu nhóm dòng tiền");
    };

    const saveItem = async () => {
        if (!editingItem || !editingItem.name || !editingItem.code) return toast("Thiếu thông tin bắt buộc", "error");
        await saveCostItem(editingItem);
        setItemModalOpen(false);
        fetchData();
        toast("Đã lưu mục dòng tiền");
    };

    const filteredGroups = groups.filter(g => g.type === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Cấu hình Danh mục Dòng tiền</h2>
                    <p className="text-sm text-slate-500">Phân loại doanh thu và chi phí để chuẩn hóa dòng tiền & Thuế</p>
                </div>
                <Button className="shadow-md shadow-indigo-100 gap-2" onClick={handleAddGroup}>
                    <Plus size={18} /> Thêm Nhóm
                </Button>
            </div>

            <div className="flex space-x-2 border-b border-slate-200">
                <button
                    className={cn("px-4 py-2 font-bold text-sm border-b-2 transition-colors", activeTab === 'REVENUE' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
                    onClick={() => setActiveTab('REVENUE')}
                >
                    DOANH THU
                </button>
                <button
                    className={cn("px-4 py-2 font-bold text-sm border-b-2 transition-colors", activeTab === 'EXPENSE' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
                    onClick={() => setActiveTab('EXPENSE')}
                >
                    CHI PHÍ
                </button>
            </div>

            <div className="space-y-3">
                {filteredGroups.map(group => {
                    const groupItems = items.filter(i => i.groupId === group.id);
                    const isExpanded = expandedGroup === group.id;

                    return (
                        <div key={group.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all">
                            {/* Group Header */}
                            <div
                                className={cn("p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50", isExpanded && "bg-slate-50 border-b border-slate-100")}
                                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">{group.name}</h3>
                                            {!group.isActive && <Badge variant="neutral">Inactive</Badge>}
                                        </div>
                                        <p className="text-xs text-slate-500">{group.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-white">{groupItems.length} mục</Badge>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={(e) => handleEditGroup(group, e)}>
                                        <Edit size={14} />
                                    </Button>
                                </div>
                            </div>

                            {/* Items List (Expanded) */}
                            {isExpanded && (
                                <div className="p-4 bg-slate-50/50">
                                    <div className="space-y-2">
                                        {groupItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-indigo-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={16} className="text-slate-300 cursor-move" />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("text-sm font-semibold", !item.isActive && "text-slate-400 line-through")}>{item.name}</span>
                                                            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">{item.code}</Badge>
                                                            {item.tenantRelatedFlag && <Badge variant="warning" className="text-[9px]">Liên quan khách</Badge>}
                                                            {item.requiresAttachment && <Badge variant="indigo" className="text-[9px]">Cần chứng từ</Badge>}
                                                        </div>
                                                        {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 mr-4">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tính thuế</span>
                                                        <Switch checked={!!item.isTaxDeductible} onChange={async (v) => {
                                                            await saveCostItem({ ...item, isTaxDeductible: v });
                                                            fetchData();
                                                            toast(`Đã ${v ? 'bật' : 'tắt'} tính thuế cho ${item.name}`);
                                                        }} />
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-indigo-600" onClick={() => handleEditItem(item)}>
                                                            <Edit size={12} />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-rose-600" onClick={() => handleArchiveItem(item)}>
                                                            {item.isDefaultSeeded ? <Archive size={12} /> : <Trash2 size={12} />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 mt-2" onClick={(e) => handleAddItem(group.id, e)}>
                                            <Plus size={14} className="mr-1.5" /> Thêm mục con
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- MODALS --- */}

            {/* Group Modal */}
            <Modal isOpen={groupModalOpen} onClose={() => setGroupModalOpen(false)} title={editingGroup?.id ? "Chỉnh sửa Nhóm" : "Thêm Nhóm Dòng Tiền"} size="md">
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Mã Nhóm" value={editingGroup?.code} onChange={e => setEditingGroup({ ...editingGroup!, code: e.target.value.toUpperCase() })} placeholder="TAX_LEGAL" />
                        <Input label="Thứ tự" type="number" className="col-span-2" value={editingGroup?.displayOrder} onChange={e => setEditingGroup({ ...editingGroup!, displayOrder: parseInt(e.target.value) })} />
                    </div>
                    <Input label="Tên Nhóm" value={editingGroup?.name} onChange={e => setEditingGroup({ ...editingGroup!, name: e.target.value })} placeholder="VD: Chi phí vận hành" />
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Loại</span>
                        <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md">{editingGroup?.type === 'REVENUE' ? 'Doanh Thu' : 'Chi Phí'}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
                        <Switch checked={!!editingGroup?.isActive} onChange={v => setEditingGroup({ ...editingGroup!, isActive: v })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={() => setGroupModalOpen(false)}>Hủy</Button>
                        <Button className="flex-1" onClick={saveGroup}>Lưu</Button>
                    </div>
                </div>
            </Modal>

            {/* Item Modal */}
            <Modal isOpen={itemModalOpen} onClose={() => setItemModalOpen(false)} title={editingItem?.id ? "Chỉnh sửa Danh Mục Dòng Tiền" : "Thêm Danh Mục Dòng Tiền"} size="lg">
                <div className="p-6 space-y-5">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2 mb-2">
                        <FolderOpen size={16} className="text-indigo-600" />
                        <span className="text-sm text-slate-600">Thuộc nhóm: <b>{groups.find(g => g.id === editingItem?.groupId)?.name}</b></span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Mã Mục (Code)" value={editingItem?.code} onChange={e => setEditingItem({ ...editingItem!, code: e.target.value.toUpperCase() })} placeholder="VAT" />
                        <Input label="Tên Mục" className="col-span-2" value={editingItem?.name} onChange={e => setEditingItem({ ...editingItem!, name: e.target.value })} placeholder="VD: Thuế GTGT" />
                    </div>

                    <Textarea label="Mô tả / Hướng dẫn" value={editingItem?.description} onChange={e => setEditingItem({ ...editingItem!, description: e.target.value })} />
                    <Input label="Ví dụ áp dụng" value={editingItem?.examples} onChange={e => setEditingItem({ ...editingItem!, examples: e.target.value })} placeholder="VD: Thuế 5% trên doanh thu..." />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div>
                                <div className="text-sm font-bold text-slate-700">Liên quan khách thuê</div>
                                <div className="text-[10px] text-slate-500">Yêu cầu chọn khách khi nhập phí</div>
                            </div>
                            <Switch checked={!!editingItem?.tenantRelatedFlag} onChange={v => setEditingItem({ ...editingItem!, tenantRelatedFlag: v })} />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div>
                                <div className="text-sm font-bold text-slate-700">Bắt buộc đính kèm</div>
                                <div className="text-[10px] text-slate-500">Phải upload ảnh/file khi nhập</div>
                            </div>
                            <Switch checked={!!editingItem?.requiresAttachment} onChange={v => setEditingItem({ ...editingItem!, requiresAttachment: v })} />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div>
                                <div className="text-sm font-bold text-slate-700">Tính thuế</div>
                                <div className="text-[10px] text-slate-500">
                                    {editingItem?.type === 'EXPENSE' ? 'Đánh dấu chi phí hợp lý được khấu trừ' : 'Ghi nhận khoản thu tính thuế'}
                                </div>
                            </div>
                            <Switch checked={!!editingItem?.isTaxDeductible} onChange={v => setEditingItem({ ...editingItem!, isTaxDeductible: v })} />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div className="text-sm font-bold text-slate-700">Đang hoạt động</div>
                            <Switch checked={!!editingItem?.isActive} onChange={v => setEditingItem({ ...editingItem!, isActive: v })} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button variant="ghost" className="flex-1" onClick={() => setItemModalOpen(false)}>Hủy</Button>
                        <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={saveItem}>Lưu cấu hình</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

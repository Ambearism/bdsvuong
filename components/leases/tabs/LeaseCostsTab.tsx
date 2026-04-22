
import React, { useState, useEffect } from 'react';
import { Lease, CostEntry, CostCategoryItem } from '../../../types';
import { Card, Button, Skeleton, Badge, TooltipWrapper, toast } from '../../ui';
import { getCostEntries, deleteCostEntry } from '../../../data/costFactory';
import { getCostItems } from '../../../data/settingsFactory';
import { CostEntryModal } from '../../finance/modals/CostEntryModal';
import { formatCurrencyTy, formatDateTimeVi } from '../../../utils';
import { Plus, Search, FileText, Trash2, Wallet, Filter, Download } from 'lucide-react';

interface Props {
  lease: Lease;
}

export const LeaseCostsTab: React.FC<Props> = ({ lease }) => {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, CostCategoryItem>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Fetch all and filter by leaseId (Mock API limitation)
    const [allCosts, allItems] = await Promise.all([
        getCostEntries(),
        getCostItems()
    ]);
    
    // Filter costs for this lease
    const leaseCosts = allCosts.filter(c => c.leaseId === lease.id);
    setCosts(leaseCosts);

    // Map items
    const map: Record<string, CostCategoryItem> = {};
    allItems.forEach(i => map[i.id] = i);
    setItemsMap(map);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [lease.id]);

  const handleDelete = async (id: string) => {
      if (window.confirm("Bạn chắc chắn muốn xóa chi phí này?")) {
          await deleteCostEntry(id);
          toast("Đã xóa chi phí");
          fetchData();
      }
  };

  const handleExport = () => {
      toast("Đang tải file Excel...", "success");
  };

  const totalCost = costs.reduce((acc, curr) => acc + curr.amountTy, 0);

  if (loading) return <Skeleton className="h-[400px] w-full rounded-2xl" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
        <CostEntryModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchData}
            initialLeaseId={lease.id}
            initialAssetId={lease.propertyId}
        />

        <div className="flex justify-between items-center px-1">
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Wallet size={18} className="text-rose-500"/> Sổ chi phí vận hành
                </h3>
                <p className="text-xs text-slate-500 mt-1">Ghi nhận các khoản chi sửa chữa, môi giới, dịch vụ liên quan đến Hợp đồng này.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="h-9 gap-2 bg-white" onClick={handleExport}>
                    <Download size={14}/> Export Excel
                </Button>
                <Button className="h-9 gap-2 shadow-md bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setIsModalOpen(true)}>
                    <Plus size={14}/> Ghi nhận chi phí
                </Button>
            </div>
        </div>

        {/* Summary Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><Wallet size={20}/></div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng chi phí</div>
                    <div className="text-lg font-black text-slate-800">{formatCurrencyTy(totalCost)}</div>
                </div>
            </Card>
            <Card className="border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><FileText size={20}/></div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Số phiếu chi</div>
                    <div className="text-lg font-black text-slate-800">{costs.length}</div>
                </div>
            </Card>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Ngày / Mã phiếu</th>
                            <th className="px-6 py-4">Hạng mục chi phí</th>
                            <th className="px-6 py-4 text-right">Số tiền</th>
                            <th className="px-6 py-4">Diễn giải</th>
                            <th className="px-6 py-4">Chứng từ</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {costs.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Chưa có chi phí nào được ghi nhận cho hợp đồng này.</td></tr>
                        ) : costs.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{formatDateTimeVi(item.date).split(' ')[0]}</div>
                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.refNo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-700">{itemsMap[item.itemId]?.name}</div>
                                    <Badge variant="outline" className="mt-1 text-[10px] font-normal text-slate-500">{itemsMap[item.itemId]?.code}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-black text-rose-600">{formatCurrencyTy(item.amountTy)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-500 italic max-w-[200px] truncate" title={item.note}>{item.note}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.attachments.length > 0 ? (
                                        <Badge variant="indigo" className="cursor-pointer">{item.attachments.length} file</Badge>
                                    ) : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <TooltipWrapper content="Xóa chi phí">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={() => handleDelete(item.id)}>
                                            <Trash2 size={14}/>
                                        </Button>
                                    </TooltipWrapper>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
};

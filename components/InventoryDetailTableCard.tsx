
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, Button, TooltipWrapper } from './ui';
import { DetailedFilterState, ItemType, MetricMode, PropertyType, RowData, OwnerBucket, CellMetric } from '../types';
import { RotateCcw, ArrowUpDown, X, ExternalLink, Info } from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '../utils';

// --- MOCK DATA GENERATOR ---
const BUCKETS: { key: OwnerBucket; label: string }[] = [
  { key: "chinh_chu", label: "Chính Chủ" },
  { key: "moi_gioi", label: "Môi Giới" },
  { key: "cho_ban", label: "Chờ Bán" },
  { key: "chua_ban", label: "Chưa Bán" },
  { key: "da_coc", label: "Đã Cọc" },
  { key: "da_ban", label: "Đã Bán" },
  { key: "huy_hang", label: "Hủy Hàng" },
];

const PROPERTY_LABELS = [
  "Chung Cư", "Liên Kế", "Biệt Thự", "Nhà Riêng", "Đất Nền",
  "Biệt thự nhà vườn - Trang trại", "Ki-ốt & Sàn thương mại", "Khách sạn nghỉ dưỡng", "BĐS Khác"
];

const generateMockRow = (label: string, id: string): RowData => {
  const byBucket = {} as Record<OwnerBucket, CellMetric>;
  BUCKETS.forEach(b => {
    const baseCount = Math.floor(Math.random() * 200);
    byBucket[b.key] = {
      count: baseCount,
      valueBillion: baseCount * (Math.random() * 5 + 2),
      feeBillion: baseCount * (Math.random() * 5 + 2) * 0.02
    };
  });

  let key = 'bds_khac';
  if (label === "Chung Cư") key = 'chung_cu';
  else if (label === "Liên Kế") key = 'lien_ke';
  else if (label === "Biệt Thự") key = 'biet_thu';
  else if (label === "Nhà Riêng") key = 'nha_rieng';
  else if (label === "Đất Nền") key = 'dat_nen';
  else if (label.includes("Trang trại")) key = 'trang_trai_nha_vuon';
  else if (label.includes("Ki-ốt")) key = 'shophouse_kiosk';
  else if (label.includes("nghỉ dưỡng")) key = 'nghi_duong';

  return { id, propertyType: label, propertyKey: key, byBucket };
};

const MOCK_DATA: RowData[] = PROPERTY_LABELS.map((label, idx) => generateMockRow(label, `row-${idx}`));

const computeRowTotal = (row: RowData): CellMetric => {
  return (Object.values(row.byBucket) as CellMetric[]).reduce((acc, curr) => ({
    count: acc.count + curr.count,
    valueBillion: acc.valueBillion + curr.valueBillion,
    feeBillion: acc.feeBillion + curr.feeBillion
  }), { count: 0, valueBillion: 0, feeBillion: 0 });
};

const computeGrandTotal = (rows: RowData[]): Record<OwnerBucket | 'tong', CellMetric> => {
  const result = {} as Record<OwnerBucket | 'tong', CellMetric>;
  BUCKETS.forEach(b => result[b.key] = { count: 0, valueBillion: 0, feeBillion: 0 });
  result['tong'] = { count: 0, valueBillion: 0, feeBillion: 0 };

  rows.forEach(row => {
    const rowTotal = computeRowTotal(row);
    result['tong'].count += rowTotal.count;
    result['tong'].valueBillion += rowTotal.valueBillion;
    result['tong'].feeBillion += rowTotal.feeBillion;
    BUCKETS.forEach(b => {
      const cell = row.byBucket[b.key];
      result[b.key].count += cell.count;
      result[b.key].valueBillion += cell.valueBillion;
      result[b.key].feeBillion += cell.feeBillion;
    });
  });
  return result;
};

interface InventoryDetailTableCardProps {
  filters: DetailedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DetailedFilterState>>;
}

export const InventoryDetailTableCard: React.FC<InventoryDetailTableCardProps> = ({ filters, setFilters }) => {
  const [sortConfig, setSortConfig] = useState<{ key: 'count' | 'value' | 'fee'; direction: 'asc' | 'desc' }>({ key: 'value', direction: 'desc' });
  const [popoverData, setPopoverData] = useState<{ x: number, y: number, data: CellMetric, title: string } | null>(null);

  const filteredRows = useMemo(() => {
    let rows = [...MOCK_DATA];
    if (filters.propertyType !== 'tat_ca') {
      rows = rows.filter(r => r.propertyKey === filters.propertyType);
    }

    if (filters.itemType === 'ban') {
      rows = rows.map(r => ({
        ...r,
        byBucket: Object.fromEntries(
          (Object.entries(r.byBucket) as [string, CellMetric][]).map(([k, v]) => [k, { ...v, count: Math.ceil(v.count * 0.7) }])
        ) as Record<OwnerBucket, CellMetric>
      }));
    } else if (filters.itemType === 'cho_thue') {
      rows = rows.map(r => ({
        ...r,
        byBucket: Object.fromEntries(
          (Object.entries(r.byBucket) as [string, CellMetric][]).map(([k, v]) => [k, { ...v, count: Math.ceil(v.count * 0.3), valueBillion: v.valueBillion * 0.005 }])
        ) as Record<OwnerBucket, CellMetric>
      }));
    }

    rows.sort((a, b) => {
      const totalA = computeRowTotal(a);
      const totalB = computeRowTotal(b);
      let valA = totalA.valueBillion;
      let valB = totalB.valueBillion;
      if (sortConfig.key === 'count') { valA = totalA.count; valB = totalB.count; }
      if (sortConfig.key === 'fee') { valA = totalA.feeBillion; valB = totalB.feeBillion; }
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });

    return rows;
  }, [filters, sortConfig]);

  const grandTotal = useMemo(() => computeGrandTotal(filteredRows), [filteredRows]);

  const renderCellContent = (metric: CellMetric, isTotal = false, contextLabel: string) => {
    const isCountMode = filters.metricMode === 'so_luong';
    const isValueMode = filters.metricMode === 'gia_tri';
    const isFeeMode = filters.metricMode === 'phi';

    const opacityLine1 = isCountMode ? 'opacity-100 font-bold' : 'opacity-70';
    const opacityLine2 = isValueMode ? 'opacity-100 font-bold' : 'opacity-80';
    const opacityLine3 = isFeeMode ? 'opacity-100 font-bold' : 'opacity-60';

    // Xác định đơn vị dựa trên itemType
    const purpose: any = filters.itemType === 'tat_ca' ? 'all' : filters.itemType;

    return (
      <div className="flex flex-col items-end gap-0.5 group/cell">
        <TooltipWrapper content={`${contextLabel} - Số lượng: ${formatNumber(metric.count)} căn`}>
          <span
            onClick={(e) => setPopoverData({ x: e.clientX, y: e.clientY, data: metric, title: contextLabel })}
            className={cn(
              "text-sm cursor-pointer hover:underline decoration-indigo-400 decoration-2 underline-offset-2 transition-all",
              isTotal ? "text-indigo-800" : "text-indigo-600",
              opacityLine1
            )}
          >
            {formatNumber(metric.count)}
          </span>
        </TooltipWrapper>

        <div className={cn("text-xs text-slate-900 whitespace-nowrap", opacityLine2)}>
          {formatCurrency(metric.valueBillion, purpose)}
        </div>

        <div className={cn("text-[10px] text-slate-500 whitespace-nowrap", opacityLine3)}>
          {formatCurrency(metric.feeBillion, purpose)}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md border-slate-200 overflow-hidden relative">
      <CardHeader className="bg-white border-b border-slate-100 py-4 px-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-black text-[#1e2b3c]">Chi Tiết Hàng Hóa & Giá Trị</CardTitle>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Số lượng</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />Giá trị (tỷ/triệu)</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />Phí MG</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            placeholder="Loại Hàng"
            value={filters.itemType}
            onChange={(v) => setFilters(prev => ({ ...prev, itemType: v as any }))}
            options={[
              { label: "Tất cả", value: "tat_ca" },
              { label: "BĐS Bán (tỷ)", value: "ban" },
              { label: "BĐS Thuê (triệu)", value: "cho_thue" },
            ]}
            className="w-[150px]"
          />
          <Select
            placeholder="Chế độ xem"
            value={filters.metricMode}
            onChange={(v) => setFilters(prev => ({ ...prev, metricMode: v as any }))}
            options={[
              { label: "SL (Số lượng)", value: "so_luong" },
              { label: "Giá Trị", value: "gia_tri" },
              { label: "Phí MG", value: "phi" },
            ]}
            className="w-[140px]"
          />
          <Button variant="outline" size="icon" onClick={() => setFilters(prev => ({ ...prev, itemType: 'tat_ca', metricMode: 'so_luong', propertyType: 'tat_ca' }))} title="Reset bộ lọc">
            <RotateCcw size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar w-full pb-2">
          <table className="w-full text-right border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="sticky left-0 bg-slate-50 z-30 px-4 py-3 text-left border-r border-slate-200 min-w-[180px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Loại BĐS</th>
                {BUCKETS.map(b => <th key={b.key} className="px-3 py-3 border-r border-slate-100 min-w-[110px]">{b.label}</th>)}
                <th onClick={() => setSortConfig(p => ({ key: p.key, direction: p.direction === 'asc' ? 'desc' : 'asc' }))} className="sticky right-0 bg-indigo-50/80 z-30 px-4 py-3 text-indigo-900 border-l border-indigo-100 min-w-[120px] cursor-pointer hover:bg-indigo-100 transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-end gap-1">TỔNG <ArrowUpDown size={12} /></div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-20 px-4 py-3 text-left font-semibold text-slate-700 border-r border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] whitespace-nowrap">{row.propertyType}</td>
                  {BUCKETS.map(b => <td key={b.key} className="px-3 py-2 border-r border-slate-100 align-top">{renderCellContent(row.byBucket[b.key], false, b.label)}</td>)}
                  <td className="sticky right-0 bg-indigo-50/30 group-hover:bg-indigo-50/60 z-20 px-4 py-2 border-l border-indigo-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top">{renderCellContent(computeRowTotal(row), true, "TỔNG")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-indigo-50/50 sticky bottom-0 z-20 border-t-2 border-indigo-100">
              <tr>
                <td className="sticky left-0 bg-indigo-50 z-30 px-4 py-3 text-left font-bold text-indigo-900 border-r border-indigo-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">TỔNG CỘNG</td>
                {BUCKETS.map(b => <td key={b.key} className="px-3 py-3 border-r border-indigo-200/50 align-top">{renderCellContent(grandTotal[b.key], true, b.label)}</td>)}
                <td className="sticky right-0 bg-indigo-100 z-30 px-4 py-3 border-l border-indigo-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top">{renderCellContent(grandTotal['tong'], true, "TỔNG TOÀN BỘ")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {popoverData && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPopoverData(null)} />
            <div className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-64 animate-in zoom-in-95 duration-200" style={{ top: popoverData.y + 10, left: popoverData.x - 100 }}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-800">{popoverData.title}</h4>
                <button onClick={() => setPopoverData(null)} className="text-slate-400"><X size={14} /></button>
              </div>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Số lượng:</span><span className="font-bold text-indigo-600">{formatNumber(popoverData.data.count)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Giá trị:</span><span className="font-semibold text-slate-800">{formatCurrency(popoverData.data.valueBillion, filters.itemType as any)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Phí MG:</span><span className="font-medium text-slate-600">{formatCurrency(popoverData.data.feeBillion, filters.itemType as any)}</span></div>
              </div>
              <Button variant="primary" size="sm" className="w-full text-xs h-8 mt-3 gap-1"><ExternalLink size={12} /> Xem danh sách</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

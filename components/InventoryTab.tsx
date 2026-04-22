
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Select, Skeleton } from './ui';
import { InventoryDetailedItem, ItemType, MetricMode, PropertyType, DetailedFilterState } from '../types';
import { formatCurrencyTy, formatNumber, cn } from '../utils';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { InventoryDetailTableCard } from './InventoryDetailTableCard'; // Import new component

interface InventoryTabProps {
  data: InventoryDetailedItem[];
  filters: DetailedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DetailedFilterState>>;
  isLoading: boolean;
}

const PROPERTY_TYPE_OPTIONS = [
  { label: 'Tất cả loại hình', value: 'tat_ca' },
  { label: 'Chung Cư', value: 'chung_cu' },
  { label: 'Liên Kế', value: 'lien_ke' },
  { label: 'Biệt Thự', value: 'biet_thu' },
  { label: 'Nhà Riêng', value: 'nha_rieng' },
  { label: 'Đất Nền', value: 'dat_nen' },
  { label: 'Shophouse', value: 'shophouse_kiosk' },
  { label: 'Nghỉ dưỡng', value: 'nghi_duong' },
  { label: 'Trang trại', value: 'trang_trai_nha_vuon' },
  { label: 'BĐS Khác', value: 'bds_khac' },
];

export const InventoryTab: React.FC<InventoryTabProps> = ({ data, filters, setFilters, isLoading }) => {

  // -- Helper: Calculate display value based on Metric Mode --
  const getValue = (item: InventoryDetailedItem, type: 'sell' | 'rent', mode: MetricMode) => {
    if (mode === 'so_luong') return item[type].count;
    if (mode === 'gia_tri') return item[type].value;
    return item[type].fee;
  };

  const getFormat = (val: number, mode: MetricMode) => {
    if (mode === 'so_luong') return formatNumber(val);
    return formatCurrencyTy(val);
  };

  // -- Render Charts --
  const renderChart = () => {
    if (isLoading) return <Skeleton className="h-[400px] w-full" />;

    // Prepare data for chart
    const chartData = data.map(item => ({
      name: item.type,
      ban: getValue(item, 'sell', filters.metricMode),
      thue: getValue(item, 'rent', filters.metricMode)
    }));

    // Opacity logic
    const opacityBan = filters.itemType === 'cho_thue' ? 0.2 : 1;
    const opacityThue = filters.itemType === 'ban' ? 0.2 : 1;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => val > 1000 ? `${(val / 1000).toFixed(1)}k` : val}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [getFormat(value, filters.metricMode), '']}
          />
          <Legend iconType="circle" />
          <Bar name="Bán" dataKey="ban" fill="#f59e0b" radius={[4, 4, 0, 0]} fillOpacity={opacityBan}>
            {data.length <= 6 && <LabelList dataKey="ban" position="top" fontSize={10} formatter={(v: number) => getFormat(v, filters.metricMode)} />}
          </Bar>
          <Bar name="Cho Thuê" dataKey="thue" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={opacityThue}>
            {data.length <= 6 && <LabelList dataKey="thue" position="top" fontSize={10} formatter={(v: number) => getFormat(v, filters.metricMode)} />}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* --- Filter Bar Local (Quick Chart Filters) --- */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center gap-2 text-sm text-[#1e2b3c] font-black">
            <LayoutGrid size={18} className="text-indigo-600" />
            Bộ lọc nhanh biểu đồ:
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid Layout: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Loại Hàng"
              value={filters.itemType}
              onChange={(val) => setFilters(prev => ({ ...prev, itemType: val as ItemType }))}
              options={[
                { label: 'Tất cả', value: 'tat_ca' },
                { label: 'BĐS Bán', value: 'ban' },
                { label: 'BĐS Cho Thuê', value: 'cho_thue' }
              ]}
              className="w-full h-10"
            />

            <Select
              label="SL/Giá Trị/Phí"
              value={filters.metricMode}
              onChange={(val) => setFilters(prev => ({ ...prev, metricMode: val as MetricMode }))}
              options={[
                { label: 'Số Lượng', value: 'so_luong' },
                { label: 'Giá Trị (tỷ)', value: 'gia_tri' },
                { label: 'Phí Môi Giới (tỷ)', value: 'phi' }
              ]}
              className="w-full h-10"
            />

            <Select
              label="Loại BĐS"
              value={filters.propertyType}
              onChange={(val) => setFilters(prev => ({ ...prev, propertyType: val as PropertyType }))}
              options={PROPERTY_TYPE_OPTIONS}
              showClear
              className="w-full h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* --- Chart Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Bán */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              Phân Bố Hàng Bán ({filters.metricMode === 'so_luong' ? 'SL' : filters.metricMode === 'gia_tri' ? 'Giá Trị' : 'Phí'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : renderChart()}
          </CardContent>
        </Card>

        {/* Chart Cho Thuê */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              Phân Bố Hàng Thuê ({filters.metricMode === 'so_luong' ? 'SL' : filters.metricMode === 'gia_tri' ? 'Giá Trị' : 'Phí'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : renderChart()}
          </CardContent>
        </Card>
      </div>

      {/* --- NEW DETAILED TABLE CARD --- */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      ) : (
        <InventoryDetailTableCard filters={filters} setFilters={setFilters} />
      )}
    </div>
  );
};

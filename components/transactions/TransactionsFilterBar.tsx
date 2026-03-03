
import React from 'react';
import { Card, CardContent, Select, Input, Button } from '../ui';
import { TransactionFilterState } from '../../types';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface Props {
  filters: TransactionFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilterState>>;
  onReset: () => void;
}

export const TransactionFilterBar: React.FC<Props> = ({ filters, setFilters, onReset }) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 items-center">
            <div className="relative w-full xl:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                    className="pl-9 h-10" 
                    placeholder="Mã GD, Tên KH, Mã BĐS..." 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <Select 
                    className="w-[160px] h-10" 
                    placeholder="Trạng thái GD"
                    value={filters.status}
                    onChange={(v) => setFilters(prev => ({ ...prev, status: v as any }))}
                    options={[
                        { label: 'Tất cả trạng thái', value: 'tat_ca' },
                        { label: 'Đặt Cọc', value: 'dat_coc' },
                        { label: 'Đang Xử Lý HS', value: 'dang_xu_ly_hs' },
                        { label: 'Ký Hợp Đồng', value: 'ky_hop_dong' },
                        { label: 'Thanh Toán Đ1', value: 'thanh_toan_dot1' },
                        { label: 'Hoàn Tất', value: 'hoan_tat' },
                        { label: 'Hủy', value: 'huy' },
                    ]}
                />
                <Select 
                    className="w-[140px] h-10" 
                    placeholder="Nguồn"
                    value={filters.source}
                    onChange={(v) => setFilters(prev => ({ ...prev, source: v as any }))}
                    options={[
                        { label: 'Tất cả nguồn', value: 'tat_ca' },
                        { label: 'Auto (Từ Deal)', value: 'auto_from_deal' },
                        { label: 'Manual (Admin)', value: 'manual_admin' },
                    ]}
                />
                 <Select 
                    className="w-[120px] h-10" 
                    placeholder="Mục đích"
                    value={filters.purpose}
                    onChange={(v) => setFilters(prev => ({ ...prev, purpose: v as any }))}
                    options={[
                        { label: 'Tất cả', value: 'tat_ca' },
                        { label: 'Bán', value: 'ban' },
                        { label: 'Cho Thuê', value: 'cho_thue' },
                    ]}
                />
                <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-rose-600">
                    <RotateCcw size={14} className="mr-2"/> Reset
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

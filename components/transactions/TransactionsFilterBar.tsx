
import React from 'react';
import { Select, Input, Button } from '../ui';
import { TransactionFilterState } from '../../types';
import { Search, RotateCcw, Calendar } from 'lucide-react';

interface Props {
    filters: TransactionFilterState;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilterState>>;
    onReset: () => void;
}

export const TransactionsFilterBar: React.FC<Props> = ({ filters, setFilters, onReset }) => {
    return (
        <div className="p-6 space-y-6 bg-white border-b border-slate-100">
            {/* Row 1: Search & Date Actions */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full xl:w-[400px] group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <Input
                        placeholder="Tìm kiếm giao dịch, tên khách hàng..."
                        className="pl-11 h-11 bg-slate-50 border-slate-200 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl border-transparent shadow-sm"
                        value={filters.search}
                        onChange={(e: any) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>

                {/* Date & Reset Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                        <Button variant="ghost" size="sm" className="h-9 px-4 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                            7 Ngày
                        </Button>
                        <div className="w-px h-3 bg-slate-200 mx-1" />
                        <Button variant="ghost" size="sm" className="h-9 px-4 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                            Tháng Này
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 h-11 px-4 border border-slate-200 rounded-xl bg-white shadow-sm text-[11px] font-bold text-slate-600">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>23.11.2023 - 30.11.2025</span>
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onReset} 
                        className="h-11 px-4 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl gap-2 transition-all font-bold text-[11px]"
                    >
                        <RotateCcw size={14} /> Reset Bộ Lọc
                    </Button>
                </div>
            </div>

            {/* Row 2: Labeled Selects */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
                <Select
                    label="Loại Giao Dịch"
                    placeholder="Tất cả loại"
                    className="h-11 text-xs font-semibold"
                    value={filters.purpose}
                    onChange={(v: any) => setFilters(prev => ({ ...prev, purpose: v }))}
                    options={[
                        { label: 'Tất cả loại hình', value: 'tat_ca' },
                        { label: 'Mua', value: 'Mua' },
                        { label: 'Thuê', value: 'Thuê' },
                        { label: 'Ký Gửi Bán', value: 'Ký Gửi Bán' },
                    ]}
                />
                
                <Select
                    label="Trạng Thái HĐ"
                    placeholder="Tất cả trạng thái"
                    className="h-11 text-xs font-semibold"
                    value={filters.status}
                    onChange={(v: any) => setFilters(prev => ({ ...prev, status: v }))}
                    options={[
                        { label: 'Tất cả trạng thái', value: 'tat_ca' },
                        { label: 'Đặt Cọc', value: 'dat_coc' },
                        { label: 'Giao Dịch Hoàn Tất', value: 'hoan_tat' },
                        { label: 'Thất Bại', value: 'that_bai' },
                    ]}
                />

                <Select
                    label="Nhân Viên Phụ Trách"
                    placeholder="Tất cả nhân viên"
                    className="h-11 text-xs font-semibold"
                    value={filters.assignee}
                    onChange={(v: any) => setFilters(prev => ({ ...prev, assignee: v }))}
                    options={[
                        { label: 'Tất cả nhân viên', value: 'tat_ca' },
                        { label: 'Lê Thị B', value: 'le_thi_b' },
                    ]}
                />

                <Select
                    label="Loại Hình BĐS"
                    placeholder="Tất cả dự án"
                    className="h-11 text-xs font-semibold"
                    value={filters.propertyType}
                    onChange={(v: any) => setFilters(prev => ({ ...prev, propertyType: v }))}
                    options={[
                        { label: 'Tất cả BĐS', value: 'tat_ca' },
                        { label: 'Chung Cư', value: 'chung_cu' },
                        { label: 'Liên Kế', value: 'lien_ke' },
                        { label: 'Biệt Thự', value: 'biet_thu' },
                        { label: 'Nhà Riêng', value: 'nha_rieng' },
                        { label: 'Đất Nền', value: 'dat_nen' },
                    ]}
                />

                <Select
                    label="Dự Án / Khu Vực"
                    placeholder="Tất cả khu vực"
                    className="h-11 text-xs font-semibold"
                    value={filters.project}
                    onChange={(v: any) => setFilters(prev => ({ ...prev, project: v }))}
                    options={[
                        { label: 'Tất cả khu vực', value: 'tat_ca' },
                        { label: 'Hà Đông', value: 'ha_dong' },
                        { label: 'Dương Nội', value: 'duong_noi' },
                        { label: 'Yên Nghĩa', value: 'yen_nghia' },
                    ]}
                />
            </div>
        </div>
    );
};

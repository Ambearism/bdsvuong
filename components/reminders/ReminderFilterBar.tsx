
import React from 'react';
import { Card, CardContent, Input, Select, Button } from '../ui';
import { ReminderFilterState } from '../../types';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface Props {
  filters: ReminderFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ReminderFilterState>>;
  onReset: () => void;
}

export const ReminderFilterBar: React.FC<Props> = ({ filters, setFilters, onReset }) => {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 space-y-4">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative w-full xl:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                        className="pl-9 h-10" 
                        placeholder="Tìm tiêu đề, chủ nhà, hợp đồng..." 
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <Select 
                        className="w-[140px] h-10" 
                        placeholder="Loại nhắc việc"
                        value={filters.type}
                        onChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
                        options={[
                            { label: 'Tất cả loại', value: 'tat_ca' },
                            { label: 'Thu Tiền', value: 'payment' },
                            { label: 'Thuế', value: 'tax' },
                            { label: 'Phí Dịch Vụ', value: 'fee' },
                            { label: 'Hợp Đồng', value: 'contract' }
                        ]}
                    />
                    <Select 
                        className="w-[140px] h-10" 
                        placeholder="Trạng thái"
                        value={filters.status}
                        onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                        options={[
                            { label: 'Tất cả', value: 'tat_ca' },
                            { label: 'Mới', value: 'new' },
                            { label: 'Đang xử lý', value: 'processing' },
                            { label: 'Hoàn tất', value: 'done' }
                        ]}
                    />
                    <Select 
                        className="w-[120px] h-10" 
                        placeholder="Mức độ"
                        value={filters.level}
                        onChange={(v) => setFilters(prev => ({ ...prev, level: v }))}
                        options={[
                            { label: 'Tất cả', value: 'tat_ca' },
                            { label: 'Cao / Rất cao', value: 'high_critical' },
                            { label: 'Trung bình', value: 'medium' },
                            { label: 'Thấp', value: 'low' }
                        ]}
                    />
                    <Select 
                        className="w-[140px] h-10" 
                        placeholder="Thời gian"
                        value={filters.timeRange}
                        onChange={(v) => setFilters(prev => ({ ...prev, timeRange: v }))}
                        options={[
                            { label: 'Tất cả', value: 'tat_ca' },
                            { label: 'Đã quá hạn', value: 'overdue' },
                            { label: 'Hôm nay', value: 'today' },
                            { label: '7 ngày tới', value: '7_days' }
                        ]}
                    />
                    
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-rose-600 h-10">
                        <RotateCcw size={14} className="mr-2"/> Reset
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

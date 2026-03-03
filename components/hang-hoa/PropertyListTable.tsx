
import React from 'react';
import Link from 'next/link';
import { Badge, Button, TooltipWrapper, Skeleton } from '../ui';
import { Property } from '../../data/mockProperties';
import { formatCurrencyTy, formatDateTimeVi, formatNumber } from '../../lib/format';
import { Edit, Trash2, LayoutGrid, Search } from 'lucide-react';

interface Props {
  data: Property[];
  loading: boolean;
}

export const PropertyListTable: React.FC<Props> = ({ data, loading }) => {
  
  const getPurposeBadge = (p: string) => {
    if (p === 'ban') return <Badge variant="warning">Bán</Badge>;
    return <Badge variant="success">Cho Thuê</Badge>;
  };

  const getLegalBadge = (s: string) => {
    if (s === 'co_so_do') return <Badge variant="indigo">Sổ Đỏ</Badge>;
    if (s === 'dong_tien_do') return <Badge variant="neutral">Tiến Độ</Badge>;
    return <Badge variant="danger">Chưa Sổ</Badge>;
  };

  const handleHubClick = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      // Dispatch custom event for App.tsx to handle
      window.dispatchEvent(new CustomEvent('routeChange', { 
          detail: { route: 'property_hub', id: id } 
      }));
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
            <Search size={32} className="text-slate-300" />
        </div>
        <p className="font-semibold">Không có hàng hóa phù hợp bộ lọc</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <table className="w-full text-left border-collapse min-w-[1600px]">
        <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3 min-w-[200px]">Hàng Hóa</th>
            <th className="px-4 py-3">Mục Đích</th>
            <th className="px-4 py-3">Loại Hàng</th>
            <th className="px-4 py-3">Dự Án</th>
            <th className="px-4 py-3">Phường/Xã</th>
            <th className="px-4 py-3 text-right">Diện Tích</th>
            <th className="px-4 py-3 text-center">Pháp Lý</th>
            <th className="px-4 py-3 text-right">Giá Thu / Tổng</th>
            <th className="px-4 py-3 text-right">Giá Bán / Tổng</th>
            <th className="px-4 py-3 text-right">Phí MG</th>
            <th className="px-4 py-3 text-right">Ngày Tạo</th>
            <th className="px-4 py-3 text-right">Cập Nhật</th>
            <th className="sticky right-0 bg-slate-50 px-4 py-3 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 w-[160px]">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-3 font-medium text-slate-500">{item.code}</td>
              <td className="px-4 py-3">
                <a href={`/hang-hoa/${item.id}/hub?from=list`} onClick={(e) => handleHubClick(e, item.id)} className="font-semibold text-indigo-700 hover:underline line-clamp-2 cursor-pointer">
                  {item.name}
                </a>
              </td>
              <td className="px-4 py-3">{getPurposeBadge(item.purpose)}</td>
              <td className="px-4 py-3">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium capitalize">
                  {item.type.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{item.project}</td>
              <td className="px-4 py-3 text-slate-600">{item.ward}</td>
              <td className="px-4 py-3 text-right font-mono">{item.areaM2} m²</td>
              <td className="px-4 py-3 text-center">{getLegalBadge(item.legalStatus)}</td>
              
              {/* Gia Thu (Mock logic: usually slightly lower than sell price) */}
              <td className="px-4 py-3 text-right">
                <div className="text-xs text-slate-400">---</div>
                <div className="text-xs text-slate-400">---</div>
              </td>

              {/* Gia Ban/Thue */}
              <td className="px-4 py-3 text-right">
                {item.purpose === 'ban' ? (
                    <>
                        <div className="font-mono text-slate-600 text-xs">{formatNumber(item.sellPricePerM2 || 0)} Tr/m²</div>
                        <div className="font-bold text-emerald-600">{formatCurrencyTy(item.sellTotalTy || 0)} tỷ</div>
                    </>
                ) : (
                    <>
                        <div className="font-mono text-slate-600 text-xs">{formatNumber(item.rentPricePerM2 || 0)} Tr/m²</div>
                        <div className="font-bold text-emerald-600">{formatCurrencyTy(item.rentTotalTy || 0)} tỷ</div>
                    </>
                )}
              </td>

              <td className="px-4 py-3 text-right font-medium text-slate-600">{item.brokerFee}</td>
              <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                {formatDateTimeVi(item.createdAt).split(' ')[0]} <br/>
                <span className="text-[10px] text-slate-400">{formatDateTimeVi(item.createdAt).split(' ')[1]}</span>
              </td>
              <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                {formatDateTimeVi(item.updatedAt).split(' ')[0]}
              </td>

              {/* Actions */}
              <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-2 py-3 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20">
                <div className="flex items-center justify-center gap-2">
                    <TooltipWrapper content="Chỉnh Sửa">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-slate-600 border-slate-200">
                            <Edit size={14} />
                        </Button>
                    </TooltipWrapper>
                    
                    <TooltipWrapper content="Vào Hub">
                        <Button onClick={(e) => handleHubClick(e, item.id)} size="icon" className="h-8 w-8 bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 shadow-sm">
                            <LayoutGrid size={16} />
                        </Button>
                    </TooltipWrapper>

                    <TooltipWrapper content="Xóa">
                        <Button size="icon" variant="destructive" className="h-8 w-8 bg-white text-rose-500 border border-slate-200 hover:bg-rose-50 shadow-none">
                            <Trash2 size={14} />
                        </Button>
                    </TooltipWrapper>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

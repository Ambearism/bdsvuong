
import React from 'react';
import Link from 'next/link';
import { Badge, Button, TooltipWrapper, Skeleton } from '../ui';
import { Customer } from '../../data/mockCustomers';
import { formatDateTimeVi } from '../../lib/format';
import { Edit, Trash2, LayoutGrid, Search, Phone, Mail } from 'lucide-react';

interface Props {
  data: Customer[];
  loading: boolean;
}

export const CustomerListTable: React.FC<Props> = ({ data, loading }) => {
  
  const getSegmentBadge = (s: string) => {
    const map: Record<string, any> = {
        chu_nha: { label: 'Chủ Nhà', variant: 'indigo' },
        nha_dau_tu: { label: 'Nhà Đầu Tư', variant: 'warning' },
        mua_o: { label: 'Mua Ở', variant: 'success' },
        thue: { label: 'Thuê', variant: 'neutral' },
        ctv: { label: 'CTV / Môi Giới', variant: 'danger' },
        khac: { label: 'Khác', variant: 'outline' },
    };
    const conf = map[s] || map.khac;
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  const getStatusBadge = (s: string) => {
      const map: Record<string, string> = {
          dang_cham: 'bg-blue-100 text-blue-700',
          tiem_nang: 'bg-emerald-100 text-emerald-700',
          dang_deal: 'bg-amber-100 text-amber-700',
          da_mua: 'bg-indigo-100 text-indigo-700',
          da_thue: 'bg-purple-100 text-purple-700',
          ngung: 'bg-slate-100 text-slate-500',
      };
      return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[s] || 'bg-gray-100'}`}>{s.replace('_', ' ')}</span>;
  };

  const handleHubClick = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('routeChange', { 
          detail: { route: 'customer_hub', id: id } 
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
        <p className="font-semibold">Không có khách hàng phù hợp bộ lọc</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <table className="w-full text-left border-collapse min-w-[1400px]">
        <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Mã KH</th>
            <th className="px-4 py-3 min-w-[200px]">Họ Tên</th>
            <th className="px-4 py-3">Liên Hệ</th>
            <th className="px-4 py-3">Nhóm KH</th>
            <th className="px-4 py-3">Trạng Thái</th>
            <th className="px-4 py-3">Nguồn</th>
            <th className="px-4 py-3">Phụ Trách</th>
            <th className="px-4 py-3 text-center">Khách/Giao dịch</th>
            <th className="px-4 py-3 text-right">Ngày Cập Nhật</th>
            <th className="sticky right-0 bg-slate-50 px-4 py-3 text-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 w-[140px]">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-3 font-mono text-slate-500 text-xs">{item.code}</td>
              <td className="px-4 py-3">
                <a href="#" onClick={(e) => handleHubClick(e, item.id)} className="font-semibold text-indigo-700 hover:underline">
                  {item.name}
                </a>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-700"><Phone size={12} className="text-slate-400"/> {item.phone}</div>
                    {item.email && <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} className="text-slate-400"/> {item.email}</div>}
                </div>
              </td>
              <td className="px-4 py-3">{getSegmentBadge(item.segment)}</td>
              <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
              <td className="px-4 py-3 capitalize text-slate-600">{item.source.replace('_', ' ')}</td>
              <td className="px-4 py-3">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                        {item.assigneeName.charAt(0)}
                    </div>
                    <span className="text-xs">{item.assigneeName}</span>
                </div>
              </td>
              
              <td className="px-4 py-3 text-center">
                 <div className="flex items-center justify-center gap-2 text-xs">
                    <TooltipWrapper content="Số Khách">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">2</span>
                    </TooltipWrapper>
                    <span className="text-slate-300">/</span>
                    <TooltipWrapper content="Số Giao dịch">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold">1</span>
                    </TooltipWrapper>
                 </div>
              </td>

              <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                {formatDateTimeVi(item.updatedAt).split(' ')[0]}
              </td>

              {/* Actions */}
              <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-2 py-3 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] text-center z-20">
                <div className="flex items-center justify-center gap-2">
                    <TooltipWrapper content="Vào Hub">
                        <Button onClick={(e) => handleHubClick(e, item.id)} size="icon" className="h-8 w-8 bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 shadow-sm">
                            <LayoutGrid size={16} />
                        </Button>
                    </TooltipWrapper>

                    <TooltipWrapper content="Chỉnh Sửa">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-slate-600 border-slate-200">
                            <Edit size={14} />
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

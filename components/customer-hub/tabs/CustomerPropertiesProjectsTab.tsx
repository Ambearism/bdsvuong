

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button, Badge, Skeleton } from '../../ui';
import { Customer } from '../../../data/mockCustomers';
import { CustomerPropertyLink, ROLE_LABELS } from '../../../data/mockCustomerPropertyLinks';
import { getCustomerProperties } from '../../../data/mockCustomerHub';
import { Building2, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Property } from '../../../data/mockProperties';
import { formatCurrencyTy } from '../../../lib/format';

interface Props {
  customer: Customer;
}

export const CustomerPropertiesProjectsTab: React.FC<Props> = ({ customer }) => {
  const [links, setLinks] = useState<{ link: CustomerPropertyLink, property: Property }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerProperties(customer.id).then(data => {
        setLinks(data);
        setLoading(false);
    });
  }, [customer.id]);

  const handleNavToProperty = (id: string) => {
      window.dispatchEvent(new CustomEvent('routeChange', { 
          detail: { route: 'property_hub', id: id } 
      }));
  };

  // Group by Project
  const grouped = links.reduce<Record<string, { link: CustomerPropertyLink, property: Property }[]>>((acc, curr) => {
      const project = curr.property.project || 'Khác';
      if (!acc[project]) acc[project] = [];
      acc[project].push(curr);
      return acc;
  }, {});

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Building2 size={20} className="text-indigo-600"/> BĐS Liên Kết</h3>
            <Button size="sm" className="gap-2 shadow-md"><Plus size={14}/> Liên kết BĐS</Button>
        </div>

        {/* Cast Object.entries to ensure items is correctly typed as an array */}
        {(Object.entries(grouped) as [string, { link: CustomerPropertyLink, property: Property }[]][]).map(([project, items]) => (
            <Card key={project} className="shadow-sm border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{project}</h4>
                    <Badge variant="neutral">{items.length} BĐS</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-500 text-xs font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 w-[300px]">Bất Động Sản</th>
                                <th className="px-6 py-3">Vai Trò</th>
                                <th className="px-6 py-3 text-right">Giá Trị</th>
                                <th className="px-6 py-3 text-right">Sở Hữu</th>
                                <th className="px-6 py-3">Ghi Chú</th>
                                <th className="px-6 py-3 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map(({ link, property }) => (
                                <tr key={link.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-indigo-700 cursor-pointer hover:underline" onClick={() => handleNavToProperty(property.id)}>
                                            {property.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{property.code}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={link.role.includes('chu_so_huu') ? 'indigo' : link.role.includes('mua') ? 'success' : 'outline'}>
                                            {ROLE_LABELS[link.role]}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {formatCurrencyTy(property.sellTotalTy || 0)} tỷ
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {link.ownershipPercent ? `${link.ownershipPercent}%` : '--'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 italic text-xs max-w-[200px] truncate">
                                        {link.note || '--'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600" onClick={() => handleNavToProperty(property.id)}><ExternalLink size={14}/></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500"><Trash2 size={14}/></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        ))}

        {links.length === 0 && <div className="text-center py-10 text-slate-400 italic">Chưa có BĐS nào được liên kết</div>}
    </div>
  );
};

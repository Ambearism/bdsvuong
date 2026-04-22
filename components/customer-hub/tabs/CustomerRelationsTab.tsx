
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button, Badge, Skeleton } from '../../ui';
import { Customer } from '../../../data/mockCustomers';
import { CustomerRelation, RELATION_LABELS } from '../../../data/mockCustomerRelations';
import { getCustomerRelations } from '../../../data/mockCustomerHub';
import { Network, Plus, Trash2, Edit } from 'lucide-react';

interface Props {
  customer: Customer;
}

export const CustomerRelationsTab: React.FC<Props> = ({ customer }) => {
  const [relations, setRelations] = useState<{ relation: CustomerRelation, partner: Customer }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  useEffect(() => {
    getCustomerRelations(customer.id).then(data => {
        setRelations(data);
        setLoading(false);
    });
  }, [customer.id]);

  const handleNavToCustomer = (id: string) => {
      window.dispatchEvent(new CustomEvent('routeChange', { 
          detail: { route: 'customer_hub', id: id } 
      }));
  };

  // --- SVG MAP RENDERER ---
  const renderMap = () => {
      if (relations.length === 0) return <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 italic"><Network size={48} className="mb-2 opacity-20"/>Chưa có mối quan hệ nào</div>;

      const centerX = 400;
      const centerY = 250;
      const centerR = 40;
      const orbitR = 180;
      
      return (
          <div className="w-full h-[500px] bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                  <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                      </marker>
                  </defs>
                  
                  {/* Edges */}
                  {relations.map((item, idx) => {
                      const angle = (idx * (360 / relations.length)) * (Math.PI / 180);
                      const x = centerX + orbitR * Math.cos(angle);
                      const y = centerY + orbitR * Math.sin(angle);
                      
                      return (
                          <g key={`edge-${idx}`}>
                              <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="2" />
                              <text x={(centerX + x)/2} y={(centerY + y)/2} fill="#64748b" fontSize="10" textAnchor="middle" className="bg-white px-1">
                                  {RELATION_LABELS[item.relation.relationType] || item.relation.relationType}
                              </text>
                          </g>
                      );
                  })}

                  {/* Nodes */}
                  {relations.map((item, idx) => {
                      const angle = (idx * (360 / relations.length)) * (Math.PI / 180);
                      const x = centerX + orbitR * Math.cos(angle);
                      const y = centerY + orbitR * Math.sin(angle);
                      
                      return (
                          <g key={`node-${idx}`} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleNavToCustomer(item.partner.id)}>
                              <circle cx={x} cy={y} r="25" fill="white" stroke="#6366f1" strokeWidth="2" />
                              <text x={x} y={y} dy=".3em" textAnchor="middle" fill="#4f46e5" fontWeight="bold" fontSize="14">
                                  {item.partner.name.charAt(0)}
                              </text>
                              <text x={x} y={y + 40} textAnchor="middle" fill="#1e293b" fontWeight="bold" fontSize="12">
                                  {item.partner.name}
                              </text>
                              <text x={x} y={y + 54} textAnchor="middle" fill="#64748b" fontSize="10">
                                  {item.partner.phone}
                              </text>
                          </g>
                      );
                  })}

                  {/* Center Node */}
                  <g>
                      <circle cx={centerX} cy={centerY} r={centerR} fill="#4f46e5" filter="drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))" />
                      <text x={centerX} y={centerY} dy=".3em" textAnchor="middle" fill="white" fontWeight="bold" fontSize="20">
                          {customer.name.charAt(0)}
                      </text>
                  </g>
              </svg>
          </div>
      );
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Sơ đồ quan hệ</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
            </div>
            <Button size="sm" className="gap-2 shadow-md"><Plus size={14}/> Thêm quan hệ</Button>
        </div>

        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
                {loading ? <Skeleton className="h-64 w-full" /> : (
                    viewMode === 'map' ? renderMap() : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">KH Liên Quan</th>
                                        <th className="px-4 py-3">Mối Quan Hệ</th>
                                        <th className="px-4 py-3">Ghi Chú</th>
                                        <th className="px-4 py-3 text-right">Ngày Tạo</th>
                                        <th className="px-4 py-3 text-center">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {relations.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div 
                                                    className="font-bold text-indigo-600 cursor-pointer hover:underline"
                                                    onClick={() => handleNavToCustomer(item.partner.id)}
                                                >
                                                    {item.partner.name}
                                                </div>
                                                <div className="text-xs text-slate-500">{item.partner.phone}</div>
                                            </td>
                                            <td className="px-4 py-3"><Badge variant="outline">{RELATION_LABELS[item.relation.relationType]}</Badge></td>
                                            <td className="px-4 py-3 text-slate-600 italic">{item.relation.note || '--'}</td>
                                            <td className="px-4 py-3 text-right text-slate-500 text-xs">{new Date(item.relation.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7"><Edit size={12}/></Button>
                                                    <Button size="icon" variant="destructive" className="h-7 w-7 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50"><Trash2 size={12}/></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    </div>
  );
};

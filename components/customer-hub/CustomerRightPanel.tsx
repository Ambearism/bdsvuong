
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from '../ui';
import { Customer } from '../../data/mockCustomers';
import { getCustomerRelations } from '../../data/mockCustomerHub';
import { Phone, Mail, MapPin, Tag, Users, Building, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface Props {
  customer: Customer;
  onTabChange: (tab: string) => void;
}

export const CustomerRightPanel: React.FC<Props> = ({ customer, onTabChange }) => {
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerRelations(customer.id).then(data => {
        setRelations(data.slice(0, 3)); // Top 3 relations
        setLoading(false);
    });
  }, [customer.id]);

  const handleNavToCustomer = (id: string) => {
      window.dispatchEvent(new CustomEvent('routeChange', { 
          detail: { route: 'customer_hub', id: id } 
      }));
  };

  return (
    <div className="space-y-6 w-full lg:w-[320px] shrink-0">
        
        {/* 1. Profile Card */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-slate-500 shadow-md">
                        <span className="text-2xl font-bold">{customer.name.charAt(0)}</span>
                    </div>
                </div>
            </div>
            <CardContent className="pt-10 px-6 pb-6 space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-mono">{customer.code}</Badge>
                        <Badge variant="indigo" className="capitalize">{customer.segment.replace('_', ' ')}</Badge>
                    </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400" /> 
                        <span className="font-medium">{customer.phone}</span>
                    </div>
                    {customer.email && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span>{customer.email}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <User size={16} className="text-slate-400" />
                        <span>Phụ trách: <span className="font-medium text-slate-800">{customer.assigneeName}</span></span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Đã mua 1 BĐS</Badge>
                    <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px]">2 Leads đang chăm</Badge>
                </div>
            </CardContent>
        </Card>

        {/* 2. Quick Links */}
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 px-5 border-b border-slate-100">
                <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wide">Liên kết nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
                <button onClick={() => onTabChange('properties')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group text-left">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Building size={16} className="text-indigo-500"/> BĐS Liên Quan</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="neutral">3</Badge>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                    </div>
                </button>
                <button onClick={() => onTabChange('leads_deals')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group text-left">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Tag size={16} className="text-amber-500"/> Leads / Deals</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="neutral">2</Badge>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                    </div>
                </button>
            </CardContent>
        </Card>

        {/* 3. Relationships */}
        <Card className="shadow-sm border-slate-200">
             <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wide">Quan hệ KH</CardTitle>
                <button onClick={() => onTabChange('relations')} className="text-[10px] text-indigo-600 font-semibold hover:underline">Xem sơ đồ</button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                    <>
                        {relations.length > 0 ? relations.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                                    {item.partner.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-slate-500">{item.relation.relationType.replace('_', ' ')}</div>
                                    <div 
                                        onClick={() => handleNavToCustomer(item.partner.id)}
                                        className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600 hover:underline"
                                    >
                                        {item.partner.name}
                                    </div>
                                </div>
                            </div>
                        )) : <div className="text-xs text-slate-400 italic text-center py-2">Chưa có mối quan hệ nào</div>}
                        
                        <Button variant="outline" className="w-full text-xs h-8 mt-2" onClick={() => onTabChange('relations')}>+ Thêm quan hệ</Button>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

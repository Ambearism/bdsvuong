
import React from 'react';
import { Lease } from '../../types';
import { Card, CardContent, Badge } from '../ui';
import { formatCurrency, cn } from '../../utils';
import { User, Building, Calendar, CreditCard, Clock, FileText, MapPin } from 'lucide-react';

export const LeaseDetailsSidebar = ({ lease }: { lease: Lease }) => {
    const InfoRow = ({ icon: Icon, label, value, valueClass = "" }: any) => (
        <div className="flex gap-3 py-3 border-b border-slate-50 last:border-0">
            <div className="mt-0.5 text-slate-400"><Icon size={14} /></div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                <div className={cn("text-sm font-semibold text-slate-700 truncate", valueClass)}>{value}</div>
            </div>
        </div>
    );

    return (
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-5 py-4 text-white">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Hợp đồng thuê</h3>
                    <div className="text-xl font-black mt-0.5">{lease.code}</div>
                </div>
                <CardContent className="p-5 space-y-1">
                    <InfoRow icon={User} label="Chủ nhà (Owner)" value={lease.ownerName} />
                    <InfoRow icon={User} label="Khách thuê (Tenant)" value={lease.tenantName} valueClass="text-indigo-600" />
                    <div className="py-3 border-b border-slate-50">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bất động sản</div>
                        <div className="flex items-start gap-2">
                            <div className="mt-1 text-slate-400"><Building size={14} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 leading-tight">{lease.propertyName}</div>
                                <div className="text-xs text-indigo-500 font-medium mt-1">{lease.unitCode}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5 space-y-1">
                    <InfoRow
                        icon={CreditCard}
                        label="Tiền thuê / Kỳ"
                        value={formatCurrency(lease.rentAmountTy, 'cho_thue')}
                        valueClass="text-emerald-600 text-lg font-black"
                    />
                    <InfoRow icon={Clock} label="Chu kỳ" value={lease.cycle.replace('_', ' ').toUpperCase()} />
                    <InfoRow icon={Calendar} label="Thời hạn" value={`${new Date(lease.startDate).toLocaleDateString('vi-VN')} - ${new Date(lease.endDate).toLocaleDateString('vi-VN')}`} />
                    <InfoRow icon={FileText} label="Tiền cọc" value={formatCurrency(lease.depositAmountTy, 'cho_thue')} />
                </CardContent>
            </Card>
        </div>
    );
};

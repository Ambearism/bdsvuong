
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from '../ui';
import { Property } from '../../data/mockProperties';
import { PropertyTask, getTasks } from '../../data/mockPropertyHub';
import { formatCurrencyTy, formatNumber } from '../../lib/format';
import { MapPin, Ruler, FileText, Plus, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  property: Property;
}

export const PropertyRightPanel: React.FC<Props> = ({ property }) => {
  const [tasks, setTasks] = useState<PropertyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    getTasks(property.id).then(data => {
        setTasks(data);
        setLoadingTasks(false);
    });
  }, [property.id]);

  return (
    <div className="space-y-6 w-full lg:w-[320px] shrink-0">
        
        {/* 1. Quick Info Card */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <CardContent className="p-5 space-y-5">
                <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50">{property.code}</Badge>
                        <Badge variant={property.purpose === 'ban' ? 'warning' : 'success'}>
                            {property.purpose === 'ban' ? 'Đang Bán' : 'Cho Thuê'}
                        </Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{property.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {property.project}, {property.ward}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Giá {property.purpose === 'ban' ? 'Bán' : 'Thuê'}</span>
                        <span className="text-lg font-extrabold text-emerald-600 block leading-none">
                            {formatCurrencyTy(property.purpose === 'ban' ? property.sellTotalTy || 0 : property.rentTotalTy || 0)} <span className="text-xs">tỷ</span>
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Đơn giá</span>
                        <span className="text-sm font-semibold text-slate-700 block leading-tight mt-1">
                            {formatNumber(property.purpose === 'ban' ? property.sellPricePerM2 || 0 : property.rentPricePerM2 || 0)} <span className="text-[10px] text-slate-500 font-normal">Tr/m²</span>
                        </span>
                    </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><Ruler size={14}/> Diện tích</span>
                        <span className="font-medium text-slate-800">{property.areaM2} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><FileText size={14}/> Pháp lý</span>
                        <span className="font-medium text-slate-800 capitalize">{property.legalStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2 text-indigo-600 font-medium">Hoa hồng</span>
                        <span className="font-bold text-slate-800">{property.brokerFee}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* 2. Tasks Card */}
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wide">Nhắc việc</CardTitle>
                <Button size="icon" variant="ghost" className="h-6 w-6"><Plus size={14}/></Button>
            </CardHeader>
            <CardContent className="p-0">
                {loadingTasks ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tasks.map(task => (
                            <div key={task.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className={`mt-0.5 ${task.completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-500'}`}>
                                    {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                                        {task.title}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                        <span>{task.assignee}</span>
                                        <span className={new Date(task.dueDate) < new Date() && !task.completed ? 'text-rose-500' : ''}>
                                            {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && <div className="p-6 text-center text-xs text-slate-400 italic">Chưa có công việc nào</div>}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* 3. Links Card */}
        <Card className="shadow-sm border-slate-200">
             <CardHeader className="py-4 px-5 border-b border-slate-100">
                <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wide">Liên kết nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
                <Link href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <span className="text-sm font-medium text-slate-700">Leads quan tâm</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="neutral">2</Badge>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                    </div>
                </Link>
                <Link href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <span className="text-sm font-medium text-slate-700">Deals đang chạy</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="indigo">1</Badge>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                    </div>
                </Link>
            </CardContent>
        </Card>
    </div>
  );
};

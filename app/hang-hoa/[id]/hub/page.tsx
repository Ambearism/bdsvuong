
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Skeleton } from '../../../../components/ui';
import { PropertyTabs } from '../../../../components/hub/PropertyTabs';
import { PropertyRightPanel } from '../../../../components/hub/PropertyRightPanel';
import { Property } from '../../../../data/mockProperties';
import { getPropertyById } from '../../../../data/mockPropertyHub';
import { ChevronLeft, Edit, Plus, AlertCircle } from 'lucide-react';

interface Props {
    params?: { id: string };
    id?: string;
    onBack?: () => void;
}

export default function PropertyHubPage({ params, id, onBack }: Props) {
  const propertyId = id || params?.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
        setLoading(true);
        getPropertyById(propertyId).then((data) => {
            setProperty(data || null);
            setLoading(false);
        });
    }
  }, [propertyId]);

  const handleBack = () => {
    if (onBack) {
        onBack();
    } else {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'hang_hoa' }));
    }
  };

  if (loading) {
    return (
        <div className="flex-1 transition-all duration-300">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="flex gap-6">
                <Skeleton className="flex-1 h-[600px] rounded-xl" />
                <Skeleton className="w-[320px] h-[400px] rounded-xl" />
            </div>
        </div>
    );
  }

  if (!property) {
    return (
        <div className="flex-1 flex items-center justify-center flex-col p-8 transition-all duration-300">
            <div className="text-slate-400 mb-4"><AlertCircle size={48} /></div>
            <h1 className="text-xl font-bold text-slate-800">Không tìm thấy hàng hóa</h1>
            <p className="text-slate-500 mb-6">Hàng hóa #{propertyId} không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200 text-slate-500 shadow-sm">
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span onClick={handleBack} className="hover:underline cursor-pointer">Hàng Hóa</span> 
                        <span>/</span> 
                        <span>{property.code}</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">{property.name}</h1>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="bg-white gap-2 h-9 text-xs">
                    <Edit size={14}/> Chỉnh Sửa
                </Button>
                <Button className="h-9 text-xs gap-2">
                    <Plus size={14}/> Tạo Deal
                </Button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6">
            <PropertyTabs property={property} />
            <div className="w-full lg:w-[320px]">
                <PropertyRightPanel property={property} />
            </div>
        </div>
    </div>
  );
}

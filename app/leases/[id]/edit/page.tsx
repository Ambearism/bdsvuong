
'use client';

import React, { useEffect, useState } from 'react';
import { LeaseForm } from '../../../../components/leases/LeaseForm';
import { Button, Skeleton } from '../../../../components/ui';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { MOCK_LEASES } from '../../../../data/mockLeases';
import { LeaseDraft } from '../../../../types';

interface Props {
    params: { id: string };
    id?: string;
}

export default function EditLeasePage({ params, id }: Props) {
    const leaseId = id || params?.id;
    const [initialData, setInitialData] = useState<Partial<LeaseDraft> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập fetch data
        setLoading(true);
        setTimeout(() => {
            const lease = MOCK_LEASES.find(l => l.id === leaseId);
            if (lease) {
                setInitialData({
                    id: lease.id,
                    code: lease.code,
                    ownerId: lease.ownerId,
                    tenantId: lease.tenantId,
                    propertyId: lease.propertyId,
                    unitCode: lease.unitCode,
                    rentAmountTy: lease.rentAmountTy,
                    depositAmountTy: lease.depositAmountTy,
                    startDate: lease.startDate,
                    endDate: lease.endDate,
                    cycle: lease.cycle,
                    status: lease.status as any,
                });
            }
            setLoading(false);
        }, 500);
    }, [leaseId]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'leases' }));
    };

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-2xl"/></div>;

    if (!initialData) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <AlertTriangle size={48} className="mb-4 text-rose-500"/>
            <p className="text-lg font-bold">Không tìm thấy hợp đồng #{leaseId}</p>
            <Button onClick={handleBack} className="mt-4">Quay lại</Button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200 text-slate-500">
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Cập Nhật Hợp Đồng {initialData.code}</h1>
                    <p className="text-slate-500 text-sm mt-1">Lưu ý: Thay đổi các điều khoản tài chính sẽ tính toán lại lịch thanh toán tương lai</p>
                </div>
            </div>

            <LeaseForm 
                initialData={initialData}
                onCancel={handleBack} 
                onSuccess={handleBack} 
            />
        </div>
    );
}

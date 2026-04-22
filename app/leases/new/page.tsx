
'use client';

import React from 'react';
import { LeaseForm } from '../../../components/leases/LeaseForm';
import { Button } from '../../../components/ui';
import { ChevronLeft } from 'lucide-react';

export default function NewLeasePage() {
    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'leases' }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200 text-slate-500">
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Thiết Lập Hợp Đồng Thuê</h1>
                    <p className="text-slate-500 text-sm mt-1">Khởi tạo các kỳ thanh toán và ràng buộc pháp lý cho kho hàng thuê</p>
                </div>
            </div>

            <LeaseForm 
                onCancel={handleBack} 
                onSuccess={handleBack} 
            />
        </div>
    );
}

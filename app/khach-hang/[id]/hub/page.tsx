
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Tabs } from '../../../../components/ui';
import { CustomerRightPanel } from '../../../../components/customer-hub/CustomerRightPanel';
import { CustomerPropertiesProjectsTab } from '../../../../components/customer-hub/tabs/CustomerPropertiesProjectsTab';
import { CustomerRelationsTab } from '../../../../components/customer-hub/tabs/CustomerRelationsTab';
import { Customer } from '../../../../data/mockCustomers';
import { getCustomerById } from '../../../../data/mockCustomerHub';
import { ChevronLeft, Edit, AlertCircle, Plus } from 'lucide-react';

interface Props {
    params?: { id: string };
    id?: string;
    onBack?: () => void;
}

export default function CustomerHubPage({ params, id, onBack }: Props) {
  const customerId = id || params?.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    if (customerId) {
        setLoading(true);
        getCustomerById(customerId).then((data) => {
            setCustomer(data || null);
            setLoading(false);
        });
    }
  }, [customerId]);

  const handleBack = () => {
    if (onBack) {
        onBack();
    } else {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'khach_hang' }));
    }
  };

  if (loading) {
    return (
        <div className="flex-1 p-8 transition-all duration-300">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="flex gap-6">
                <Skeleton className="flex-1 h-[600px] rounded-xl" />
                <Skeleton className="w-[320px] h-[400px] rounded-xl" />
            </div>
        </div>
    );
  }

  if (!customer) {
    return (
        <div className="flex-1 flex items-center justify-center flex-col p-8 transition-all duration-300">
            <div className="text-slate-400 mb-4"><AlertCircle size={48} /></div>
            <h1 className="text-xl font-bold text-slate-800">Không tìm thấy khách hàng</h1>
            <Button onClick={handleBack} className="mt-4">Quay lại danh sách</Button>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={handleBack} className="bg-white border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50">
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span onClick={handleBack} className="hover:underline hover:text-indigo-600 transition-colors cursor-pointer">Khách Hàng</span> 
                        <span>/</span> 
                        <span className="font-semibold text-slate-700 bg-slate-200/50 px-1.5 rounded">Hub</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">{customer.name}</h1>
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="bg-white gap-2 h-9 text-xs border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200">
                    <Edit size={14}/> Chỉnh Sửa
                </Button>
                <div className="h-9 w-px bg-slate-300 mx-1 hidden sm:block"></div>
                <Button variant="secondary" className="h-9 text-xs gap-2 bg-slate-800 hover:bg-slate-900 text-white shadow-sm">
                    <Plus size={14}/> Tạo Lead
                </Button>
                <Button className="h-9 text-xs gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 text-white">
                    <Plus size={14}/> Tạo Deal
                </Button>
            </div>
        </div>

        {/* Main Hub Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left Content (Tabs) */}
            <div className="flex-1 min-w-0">
                <Tabs 
                    activeTab={activeTab} 
                    onChange={setActiveTab}
                    className="mb-6 bg-slate-100 p-1 w-full sm:w-auto overflow-x-auto"
                    tabs={[
                        { id: 'properties', label: 'BĐS & Dự Án' },
                        { id: 'relations', label: 'Quan Hệ KH-KH' },
                        { id: 'leads_deals', label: 'Leads / Deals' },
                        { id: 'overview', label: 'Tổng Quan' },
                        { id: 'timeline', label: 'Lịch Sử' },
                    ]}
                />

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'properties' && <CustomerPropertiesProjectsTab customer={customer} />}
                    {activeTab === 'relations' && <CustomerRelationsTab customer={customer} />}
                    {activeTab === 'leads_deals' && <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 italic">Tính năng đang phát triển (List Leads/Deals)</div>}
                    {activeTab === 'overview' && <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 italic">Tính năng đang phát triển (Overview Stats)</div>}
                    {activeTab === 'timeline' && <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 italic">Tính năng đang phát triển (Timeline)</div>}
                </div>
            </div>

            {/* Right Sticky Panel */}
            <div className="lg:sticky lg:top-6 w-full lg:w-[320px]">
                <CustomerRightPanel customer={customer} onTabChange={setActiveTab} />
            </div>
        </div>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import { InventoryTab } from '../../../components/InventoryTab';
import { getDashboardData } from '../../../data';
import { DashboardData, DetailedFilterState } from '../../../types';

const DEFAULT_FILTERS: DetailedFilterState = {
    timeRange: "7_ngay_gan_nhat",
    propertyType: "tat_ca",
    itemType: "tat_ca",
    metricMode: "so_luong"
};

export default function InventoryReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [filters, setFilters] = useState<DetailedFilterState>(DEFAULT_FILTERS);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getDashboardData(filters);
            setData(result);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[28px] font-black text-[#1e2b3c] tracking-tight uppercase">Báo cáo Kho Hàng Chi Tiết</h1>
            </div>
            <InventoryTab 
                data={data?.inventoryDetailed || []} 
                filters={filters} 
                setFilters={setFilters} 
                isLoading={loading} 
            />
        </div>
    );
}

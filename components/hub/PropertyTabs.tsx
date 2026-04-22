
import React, { useState } from 'react';
import { Tabs, Button } from '../ui';
import { Property } from '../../data/mockProperties';
import { ShieldCheck } from 'lucide-react';

interface Props {
  property: Property;
}

export const PropertyTabs: React.FC<Props> = ({ property }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 min-w-0">
        <Tabs 
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
                { id: 'overview', label: 'Tổng Quan' },
                { id: 'inspections_link', label: '🛡️ Kiểm định (PB)' },
                { id: 'timeline', label: 'Timeline' },
            ]}
        />
        
        <div className="mt-6">
            {activeTab === 'overview' && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">Nội dung tổng quan về {property.name}</p>
                </div>
            )}
            
            {activeTab === 'inspections_link' && (
                <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    <ShieldCheck size={48} className="mx-auto text-indigo-400 mb-4"/>
                    <h3 className="font-bold text-slate-800">Quản lý kiểm định tài sản</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Theo dõi tình trạng kỹ thuật, điện nước và bảo trì định kỳ.</p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('routeChange', { detail: { route: 'property_inspections', id: property.id } }))}>
                        Mở màn hình Kiểm định
                    </Button>
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">Lịch sử hoạt động của tài sản</p>
                </div>
            )}
        </div>
    </div>
  );
};

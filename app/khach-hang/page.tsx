
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Select, Input } from '../../components/ui';
import { CustomerListTable } from '../../components/customers/CustomerListTable';
import { CreateCustomerModal } from '../../components/customers/CreateCustomerModal';
import { MOCK_CUSTOMERS, Customer } from '../../data/mockCustomers';
import { Search, Filter, RotateCcw, Plus, UserPlus, Download } from 'lucide-react';

export default function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('tat_ca');
  const [source, setSource] = useState('tat_ca');
  const [status, setStatus] = useState('tat_ca');
  
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_CUSTOMERS];
      
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s) || c.phone.includes(s));
      }
      if (segment !== 'tat_ca') filtered = filtered.filter(c => c.segment === segment);
      if (source !== 'tat_ca') filtered = filtered.filter(c => c.source === source);
      if (status !== 'tat_ca') filtered = filtered.filter(c => c.status === status);

      setData(filtered);
      setLoading(false);
    }, 500);
  }, [search, segment, source, status]);

  const handleReset = () => {
    setSearch('');
    setSegment('tat_ca');
    setSource('tat_ca');
    setStatus('tat_ca');
  };

  const handleCreateSuccess = (newCustomer: Customer) => {
      setData(prev => [newCustomer, ...prev]);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <CreateCustomerModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={handleCreateSuccess}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cơ Sở Dữ Liệu Khách Hàng</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý tập trung khách hàng, chủ nhà và các đối tác</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="gap-2 bg-white h-11 border-slate-200">
                    <Download size={18} /> Xuất Excel
                </Button>
                <Button className="gap-2 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 h-11 px-6" onClick={() => setIsCreateModalOpen(true)}>
                    <UserPlus size={18} /> Thêm Khách Hàng
                </Button>
            </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 space-y-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between">
                    <div className="relative w-full xl:w-[450px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                            placeholder="Tìm theo Tên khách, Số điện thoại, Email hoặc Mã KH..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">
                            <Filter size={14} /> Lọc nhanh:
                        </div>
                        <Select 
                            className="w-[160px] h-10" 
                            placeholder="Nhóm KH"
                            value={segment}
                            onChange={setSegment}
                            options={[
                                {label: 'Tất cả nhóm', value: 'tat_ca'},
                                {label: 'Chủ nhà', value: 'chu_nha'},
                                {label: 'Nhà đầu tư', value: 'nha_dau_tu'},
                                {label: 'Khách mua ở', value: 'mua_o'},
                                {label: 'Khách thuê', value: 'thue'},
                                {label: 'CTV / Môi giới', value: 'ctv'}
                            ]}
                        />
                        <Select 
                            className="w-[160px] h-10" 
                            placeholder="Trạng thái"
                            value={status}
                            onChange={setStatus}
                            options={[
                                {label: 'Tất cả trạng thái', value: 'tat_ca'},
                                {label: 'Đang chăm sóc', value: 'dang_cham'},
                                {label: 'Khách tiềm năng', value: 'tiem_nang'},
                                {label: 'Đang chạy deal', value: 'dang_deal'},
                                {label: 'Đã mua/thanh toán', value: 'da_mua'},
                                {label: 'Ngừng liên lạc', value: 'ngung'}
                            ]}
                        />
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-rose-600 transition-colors">
                            <RotateCcw size={14} className="mr-2"/> Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Table - Stretch to fill */}
        <Card className="flex-1 border-slate-200 shadow-md overflow-hidden bg-white flex flex-col min-h-[500px]">
            <div className="flex-1 overflow-auto">
                <CustomerListTable data={data} loading={loading} />
            </div>
            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-600 shrink-0">
                <div>Đang hiển thị <b>1-{data.length}</b> trên <b>120</b> khách hàng</div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="h-9 px-4">Trước</Button>
                    <div className="flex gap-1">
                        <button className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold shadow-md">1</button>
                        <button className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-600 font-bold">2</button>
                        <button className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-600 font-bold">3</button>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-4">Sau</Button>
                </div>
            </div>
        </Card>
    </div>
  );
}

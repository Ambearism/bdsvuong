
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Skeleton, toast } from '../../components/ui';
import { Reminder, ReminderFilterState } from '../../types';
import { getReminders, updateReminderStatus } from '../../data/reminderFactory';
import { ReminderListTable } from '../../components/reminders/ReminderListTable';
import { ReminderFilterBar } from '../../components/reminders/ReminderFilterBar';
import { ReminderDetailDrawer } from '../../components/reminders/ReminderDetailDrawer';
import { CreateReminderModal } from '../../components/reminders/CreateReminderModal';
import { BellRing, Plus, Settings, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const DEFAULT_FILTERS: ReminderFilterState = {
    search: '',
    type: 'tat_ca',
    status: 'tat_ca',
    level: 'tat_ca',
    assignee: 'tat_ca',
    timeRange: 'tat_ca'
};

export default function RemindersPage() {
    const [data, setData] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ReminderFilterState>(DEFAULT_FILTERS);
    
    // UI State
    const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const res = await getReminders();
        
        // Client-side filtering logic (Mock API)
        let filtered = res;
        if(filters.type !== 'tat_ca') filtered = filtered.filter(r => r.type === filters.type);
        if(filters.status !== 'tat_ca') filtered = filtered.filter(r => r.status === filters.status);
        if(filters.level === 'high_critical') filtered = filtered.filter(r => r.level === 'high' || r.level === 'critical');
        else if(filters.level !== 'tat_ca') filtered = filtered.filter(r => r.level === filters.level);
        if(filters.search) filtered = filtered.filter(r => r.title.toLowerCase().includes(filters.search.toLowerCase()) || r.ownerName?.toLowerCase().includes(filters.search.toLowerCase()));

        setData(filtered);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleUpdateStatus = async (id: string, status: string) => {
        await updateReminderStatus(id, status);
        toast("Cập nhật trạng thái thành công");
        if(selectedReminder && selectedReminder.id === id) {
            setSelectedReminder({...selectedReminder, status: status as any});
        }
        fetchData();
    };

    const handleAddLog = async (id: string, content: string) => {
        const newLog = {
            id: Date.now().toString(),
            reminderId: id,
            actor: 'Bạn (Admin)',
            action: 'note',
            content,
            timestamp: new Date().toISOString()
        };
        if(selectedReminder) {
            const updated = {...selectedReminder, logs: [newLog, ...selectedReminder.logs]};
            setSelectedReminder(updated);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 h-full flex flex-col">
            <CreateReminderModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={fetchData} 
            />
            
            <ReminderDetailDrawer 
                reminder={selectedReminder} 
                onClose={() => setSelectedReminder(null)} 
                onUpdateStatus={handleUpdateStatus}
                onAddLog={handleAddLog}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <BellRing size={28} className="text-indigo-600"/> Trung Tâm Nhắc Việc
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Theo dõi công nợ, thuế, phí và các tác vụ vận hành quan trọng.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 font-bold" onClick={() => window.dispatchEvent(new CustomEvent('routeChange', { detail: 'settings_reminder_rules' }))}>
                        <Settings size={18} className="mr-2"/> Rules Engine
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-indigo-100 font-black h-11 px-6 uppercase tracking-tight" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18}/> Tạo Nhắc Việc
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-rose-600 text-white border-none shadow-lg shadow-rose-100 p-5 flex items-center justify-between group overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Quá hạn xử lý</p>
                        <p className="text-3xl font-black mt-1">5 <span className="text-sm font-bold opacity-60">Tasks</span></p>
                    </div>
                    <div className="relative z-10 p-3 bg-white/20 rounded-2xl"><AlertTriangle size={24}/></div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm p-5 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Hạn hôm nay</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">12</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100"><Clock size={24}/></div>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm p-5 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Đã hoàn tất</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">28</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100"><CheckCircle2 size={24}/></div>
                </Card>
            </div>

            <ReminderFilterBar 
                filters={filters} 
                setFilters={setFilters} 
                onReset={() => setFilters(DEFAULT_FILTERS)} 
            />

            <Card className="flex-1 border-slate-200 shadow-md overflow-hidden bg-white flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <ReminderListTable 
                        data={data} 
                        loading={loading} 
                        onViewDetail={setSelectedReminder}
                        onQuickAction={async (id, action) => {
                            if(action === 'mark_done') await handleUpdateStatus(id, 'done');
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}

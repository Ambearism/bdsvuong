
import React from 'react';
import { HistoryLog } from '../../types';
import { cn } from '../../utils';
import { User, RefreshCcw, PlusCircle, Trash2, Phone, StickyNote, AlertCircle } from 'lucide-react';

interface HistoryListProps {
    logs: HistoryLog[];
}

const getIcon = (action: string) => {
    switch(action) {
        case 'create': return <PlusCircle size={14} />;
        case 'update': return <RefreshCcw size={14} />;
        case 'status_change': return <RefreshCcw size={14} />;
        case 'delete': return <Trash2 size={14} />;
        case 'call': return <Phone size={14} />;
        case 'note': return <StickyNote size={14} />;
        default: return <AlertCircle size={14} />;
    }
}

const getColor = (action: string) => {
    switch(action) {
        case 'create': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
        case 'status_change': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
        case 'delete': return 'bg-rose-100 text-rose-600 border-rose-200';
        case 'call': return 'bg-sky-100 text-sky-600 border-sky-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

export const HistoryList: React.FC<HistoryListProps> = ({ logs }) => {
    if (logs.length === 0) return <div className="text-center text-slate-400 py-8 text-sm italic">Chưa có lịch sử hoạt động</div>;

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {logs.map((log) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon */}
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm",
                        getColor(log.action)
                    )}>
                        {getIcon(log.action)}
                    </div>

                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-800 text-sm">{log.title}</div>
                            <time className="font-mono text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('vi-VN')}</time>
                        </div>
                        <div className="text-slate-600 text-xs mb-2">
                             {log.description}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-fit">
                            <User size={10} /> {log.actor}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

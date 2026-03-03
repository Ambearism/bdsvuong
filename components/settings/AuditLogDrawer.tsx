
import React, { useState, useEffect } from 'react';
import { X, History } from 'lucide-react';
import { SettingsAuditLog } from '../../types';
import { getAuditLogs } from '../../data/settingsFactory';
import { Skeleton } from '../ui';
import { formatDateTimeVi } from '../../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<SettingsAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (isOpen) {
          setLoading(true);
          getAuditLogs().then(data => {
              setLogs(data);
              setLoading(false);
          });
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><History size={18}/> Lịch sử thay đổi</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full rounded-xl"/>
                        <Skeleton className="h-20 w-full rounded-xl"/>
                        <Skeleton className="h-20 w-full rounded-xl"/>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 italic">Chưa có lịch sử.</div>
                ) : (
                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                                <div className="text-xs text-slate-400 font-mono mb-1">{formatDateTimeVi(log.timestamp)}</div>
                                <div className="text-sm font-bold text-slate-800">{log.action} Configuration</div>
                                <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    {log.changes}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 font-semibold">Bởi: {log.actor}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

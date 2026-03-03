
import React, { useState } from 'react';
import { Reminder, ReminderLog } from '../../types';
import { Badge, Button, Textarea, Card, CardContent } from '../ui';
import { X, CheckCircle2, Circle, Clock, Send, Paperclip, AlertTriangle, FileText, User, Bell, DollarSign } from 'lucide-react';
import { formatCurrencyTy, formatDateTimeVi, cn } from '../../utils';

interface Props {
  reminder: Reminder | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onAddLog: (id: string, content: string) => void;
}

export const ReminderDetailDrawer: React.FC<Props> = ({ reminder, onClose, onUpdateStatus, onAddLog }) => {
  const [logContent, setLogContent] = useState('');
  
  if (!reminder) return null;

  const handleSendLog = () => {
      if(!logContent.trim()) return;
      onAddLog(reminder.id, logContent);
      setLogContent('');
  };

  const getContextSection = () => {
      if (reminder.type === 'payment') {
          return (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase text-xs tracking-wider">
                      <DollarSign size={14}/> Thông tin công nợ
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                      <div>
                          <p className="text-[10px] text-emerald-600">Phải thu</p>
                          <p className="font-black text-slate-800">{formatCurrencyTy(reminder.relatedAmountTy || 0)}</p>
                      </div>
                      <div>
                          <p className="text-[10px] text-emerald-600">Đã thu</p>
                          <p className="font-bold text-emerald-600">{formatCurrencyTy(reminder.paidAmountTy || 0)}</p>
                      </div>
                      <div>
                          <p className="text-[10px] text-emerald-600">Còn thiếu</p>
                          <p className="font-black text-rose-600">{formatCurrencyTy(reminder.remainingAmountTy || 0)}</p>
                      </div>
                  </div>
                  <div className="text-xs text-slate-500 italic">
                      Liên quan đến hợp đồng: <b>{reminder.leaseCode}</b>
                  </div>
              </div>
          );
      }
      if (reminder.type === 'tax') {
          return (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold uppercase text-xs tracking-wider">
                      <FileText size={14}/> Thông tin thuế
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Doanh thu hiện tại</span>
                      <span className="font-black text-slate-900">{formatCurrencyTy(reminder.relatedAmountTy || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{width: '92%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500">Đã đạt 92% ngưỡng miễn thuế.</div>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant={reminder.level === 'critical' || reminder.level === 'high' ? 'danger' : 'warning'} className="uppercase text-[10px]">
                            {reminder.level} Priority
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">{reminder.code}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">{reminder.title}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Main Description */}
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                    {reminder.description}
                </div>

                {/* Dynamic Context */}
                {getContextSection()}

                {/* Checklist */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-600"/> Quy trình xử lý gợi ý
                    </h3>
                    <div className="space-y-2">
                        {reminder.checklist.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", item.isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                                    {item.isDone && <CheckCircle2 size={14} className="text-white"/>}
                                </div>
                                <span className={cn("text-sm", item.isDone ? "text-slate-400 line-through" : "text-slate-700")}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Actions */}
                {reminder.status !== 'done' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-10" onClick={() => onUpdateStatus(reminder.id, 'processing')}>Đang xử lý</Button>
                        <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100" onClick={() => onUpdateStatus(reminder.id, 'done')}>
                            <CheckCircle2 size={16} className="mr-2"/> Hoàn tất
                        </Button>
                    </div>
                )}

                {/* Logs / Timeline */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} className="text-indigo-600"/> Nhật ký xử lý
                    </h3>
                    
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                        {reminder.logs.map(log => (
                            <div key={log.id} className="relative pl-8">
                                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center z-10">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"/>
                                </div>
                                <div className="text-xs text-slate-500 mb-0.5">{formatDateTimeVi(log.timestamp)}</div>
                                <div className="text-sm font-medium text-slate-800">{log.content}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Bởi: {log.actor}</div>
                            </div>
                        ))}
                    </div>

                    {/* Add Log */}
                    <div className="flex gap-2 items-start pt-2">
                        <Textarea 
                            placeholder="Ghi chú tiến độ, kết quả gọi điện..." 
                            value={logContent}
                            onChange={(e) => setLogContent(e.target.value)}
                            className="text-sm min-h-[80px]"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button className="text-slate-400 hover:text-indigo-600"><Paperclip size={16}/></button>
                            <button className="text-slate-400 hover:text-indigo-600"><Bell size={16}/></button>
                        </div>
                        <Button size="sm" onClick={handleSendLog} disabled={!logContent.trim()}>
                            <Send size={14} className="mr-2"/> Gửi ghi chú
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

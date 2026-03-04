
import React, { useState } from 'react';
import { DebtNote, Lease } from '../../../types';
import { Card, CardContent, Button, Textarea, Badge, toast, TooltipWrapper } from '../../ui';
import { MessageSquare, Plus, User, Clock, Lock, Unlock, Tag, Trash2, Send } from 'lucide-react';
import { cn } from '../../../utils';

interface Props {
  lease: Lease;
  notes: DebtNote[];
}

const TEMPLATES = [
  { label: 'Xin chậm đóng', content: 'Khách hàng liên hệ xin gia hạn ngày đóng tiền đến ngày ...' },
  { label: 'Đã báo chủ nhà', content: 'Đã thông báo cho chủ nhà về việc chậm đóng của khách. Chủ nhà đồng ý.' },
];

export const LeaseDebtNotesTab: React.FC<Props> = ({ lease, notes: initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [assignee, setAssignee] = useState('Trịnh CSKH'); // NEW STATE

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: DebtNote = {
      id: Date.now().toString(), leaseId: lease.id, content: newNote, tag: 'other', isInternal,
      createdAt: new Date().toISOString(), createdBy: 'Admin',
      title: newNote.slice(0, 30) + (newNote.length > 30 ? '...' : '')
    };
    setNotes([note, ...notes]);
    setNewNote('');
    toast("Đã thêm ghi chú");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Editor */}
      <div className="xl:col-span-4 space-y-6">
        <Card className="border-slate-200 shadow-sm sticky top-6 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md"><Plus size={18} /></div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ghi chú tương tác</h3>
          </div>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung trao đổi</label>
              <Textarea
                placeholder="Khách báo gì, kế hoạch thế nào..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={6}
                className="bg-slate-50/30 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setIsInternal(true)} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2", isInternal ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  <Lock size={12} /> Nội bộ
                </button>
                <button onClick={() => setIsInternal(false)} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2", !isInternal ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  <Unlock size={12} /> Công khai
                </button>
              </div>
              <Button onClick={handleAddNote} disabled={!newNote.trim()} className="shadow-lg shadow-indigo-100">
                <Send size={14} className="mr-2" /> Lưu
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Mẫu nhanh</span>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => setNewNote(t.content)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-bold transition-all">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Feed */}
      <div className="xl:col-span-8 space-y-6">
        {notes.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-300">
            Chưa có lịch sử trao đổi.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
            {notes.map((note) => (
              <div key={note.id} className="relative pl-14">
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10 shadow-sm">
                  <MessageSquare size={16} className="text-indigo-600" />
                </div>
                <div className={cn(
                  "bg-white border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all",
                  note.isInternal ? "border-slate-200" : "border-emerald-100 ring-4 ring-emerald-50/50"
                )}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={note.isInternal ? "bg-slate-900 text-white border-transparent" : "bg-emerald-600 text-white border-transparent"}>
                        {note.isInternal ? 'NỘI BỘ' : 'CÔNG KHAI'}
                      </Badge>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5"><User size={12} className="text-indigo-500" /> {note.createdBy}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> {new Date(note.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  {note.title && <h4 className="text-sm font-bold text-slate-800 mb-1">{note.title}</h4>}
                  <p className="text-slate-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
                    <button className="text-slate-300 hover:text-rose-600 p-1 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineCard as PipelineCardType } from '../../types';
import { Badge, Button } from '../ui';
import { cn } from '../../utils';
import { MapPin, Phone, Wallet, StickyNote, Calendar, Briefcase, User, BellRing, Plus, Sparkles, Check, Send } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';

interface Props {
  card: PipelineCardType;
  onClick: () => void;
}

export const PipelineCard: React.FC<Props> = ({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { card } });

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleAddTask = (newTask: any) => {
    card.tasks.push({
      id: `task-${Date.now()}`,
      ...newTask
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-sm p-3 space-y-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group relative",
        isDragging && "ring-2 ring-indigo-500 ring-offset-2 z-50"
      )}
    >
      {/* Top Tags */}
      <div className="flex flex-wrap gap-1.5 mb-1">
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-tight border border-emerald-100 shadow-sm">
          {card.propertyType}
        </span>
        {card.need === 'mua' ? (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[9px] font-black text-blue-600 border border-blue-100 shadow-sm">MUA</span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[9px] font-black text-amber-600 border border-amber-100 shadow-sm">THUÊ</span>
        )}
        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[9px] font-black text-orange-600 border border-orange-100 uppercase shadow-sm">
          {card.source}
        </span>
      </div>

      {/* Customer Info */}
      <div className="space-y-0.5">
        <div className="font-black text-slate-900 text-sm leading-tight">
          {card.customerName}
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {card.phone}
        </div>
      </div>

      {/* Meta Info Grid */}
      <div className="grid grid-cols-2 gap-x-2 pt-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngân sách:</span>
          <span className="text-[11px] font-black text-slate-800 tracking-tighter">{card.budgetRangeText}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Khu Vực:</span>
          <span className="text-[11px] font-black text-slate-800 truncate tracking-tighter">{card.areaText}</span>
        </div>
      </div>

      {/* Notes/Tasks List */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes:</span>
        {card.notes.map((note, idx) => (
          <div key={`note-${idx}`} className="flex items-start gap-2 group/task">
            <div className="w-4 h-4 rounded border border-slate-200 flex items-center justify-center bg-white mt-0.5 shrink-0 group-hover/task:border-indigo-400 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/task:bg-indigo-400 transition-colors" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-slate-600 font-semibold line-clamp-1 leading-tight">{note}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 shrink-0">23/04/2025</span>
          </div>
        ))}
        {card.tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 group/task">
            <div className="w-4 h-4 rounded-md border border-indigo-500 flex items-center justify-center bg-indigo-50 mt-0.5 shrink-0">
              <Check size={10} className="text-indigo-600" strokeWidth={3} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-slate-700 font-bold line-clamp-1 leading-tight">{task.title}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 shrink-0">
              {new Date(task.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        ))}

        <button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1.5 py-1 px-2 hover:bg-indigo-50 rounded-lg w-fit ml-4"
        >
          <Plus size={12} /> Thêm mới
        </button>
      </div>

      {/* Assignee & Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 shrink-0 ring-2 ring-white">
            <User size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black text-slate-800 truncate leading-none mb-1 group-hover:text-indigo-600 transition-colors">{card.assignee}</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={10} className="text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">05/03/2026</span>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full mx-auto h-9 bg-[#1a5f7a] hover:bg-[#144a5f] text-[10px] font-black rounded-xl shadow-lg shadow-blue-100 border-none gap-2 uppercase tracking-tighter"
          onClick={(e: any) => { e.stopPropagation(); /* logic trigger reminder */ }}
        >
          <Send size={12} className="rotate-[-20deg]" /> Gửi Nhắc Việc
        </Button>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTask}
        customerName={card.customerName}
      />
    </div>
  );
};

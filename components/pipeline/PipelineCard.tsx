
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineCard as PipelineCardType } from '../../types';
import { Badge, Button } from '../ui';
import { cn } from '../../utils';
import { MapPin, Phone, Wallet, StickyNote, Calendar, Briefcase, User, BellRing, Plus, Sparkles } from 'lucide-react';

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

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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
      <div className="flex flex-wrap gap-1.5">
         <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200">
             {card.propertyType}
         </span>
         {card.need === 'mua' && <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100">MUA</span>}
         {card.need === 'thue' && <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">THUÊ</span>}
         <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[10px] text-slate-500 border border-slate-100 capitalize">
             {card.source}
         </span>
         {card.hasDeal && <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-50 text-[9px] font-bold text-rose-600 flex items-center gap-1"><Sparkles size={8}/> DEAL</span>}
      </div>

      {/* Customer Info */}
      <div>
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              {card.customerName}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-0.5">
              <Phone size={10} /> {card.phone}
          </div>
      </div>

      {/* Meta Info */}
      <div className="space-y-1 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
             <Wallet size={12} className="text-slate-400" />
             <span className="font-medium text-emerald-600">{card.budgetRangeText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
             <MapPin size={12} className="text-slate-400" />
             <span className="truncate">{card.areaText}</span>
          </div>
      </div>

      {/* Notes Preview */}
      {card.notes.length > 0 && (
          <div className="bg-amber-50/50 p-2 rounded-md border border-amber-100/50 space-y-1">
              {card.notes.slice(0, 2).map((note, idx) => (
                  <div key={idx} className="flex gap-1.5 text-[10px] text-slate-600">
                      <StickyNote size={10} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{note}</span>
                  </div>
              ))}
          </div>
      )}

      {/* Tasks & Actions */}
      <div className="flex items-center justify-between pt-1">
           {card.tasks.length > 0 ? (
               <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                   <Calendar size={10} />
                   <span className="font-medium">{new Date(card.tasks[0].dueAt).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}</span>
               </div>
           ) : (
                <div className="text-[10px] text-slate-300 italic flex items-center gap-1">
                    <Plus size={10}/> Thêm việc
                </div>
           )}
           
           <button 
            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); /* logic trigger reminder */ }}
           >
               <BellRing size={10} /> Gửi nhắc việc
           </button>
      </div>
    </div>
  );
};

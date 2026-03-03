
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PipelineCard as PipelineCardType, PipelineStageKey } from '../../types';
import { PipelineCard } from './PipelineCard';
import { cn, formatNumber } from '../../utils';

interface Props {
  id: PipelineStageKey;
  title: string;
  cards: PipelineCardType[];
  color: string;
  count: number;
  onCardClick: (card: PipelineCardType) => void;
}

export const PipelineColumn: React.FC<Props> = ({ id, title, cards, color, count, onCardClick }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-[280px] shrink-0 h-full max-h-full">
      {/* Header */}
      <div className={cn("px-4 py-3 border-b-2 bg-slate-50/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10 rounded-t-xl", color)}>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate mr-2">{title}</h3>
        <span className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-bold rounded-full shadow-sm border border-slate-200">
            {formatNumber(count)}
        </span>
      </div>

      {/* Card List Area */}
      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-100/50 space-y-2 border-x border-slate-200/50 last:rounded-b-xl"
      >
        <SortableContext id={id} items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
                <PipelineCard key={card.id} card={card} onClick={() => onCardClick(card)} />
            ))}
        </SortableContext>
        
        {cards.length === 0 && (
            <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 italic">
                Kéo thả Lead vào đây
            </div>
        )}
      </div>
    </div>
  );
};

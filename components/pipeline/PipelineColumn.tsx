
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

const colorMap: any = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', badge: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-400', badge: 'bg-amber-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-500', badge: 'bg-orange-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-500', badge: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-500', badge: 'bg-indigo-500' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-500', badge: 'bg-sky-500' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-500', badge: 'bg-teal-500' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-300', badge: 'bg-slate-400' },
};

export const PipelineColumn: React.FC<Props> = ({ id, title, cards, color, count, onCardClick }) => {
  const { setNodeRef } = useDroppable({ id });
  const theme = colorMap[color] || colorMap.slate;

  return (
    <div className="flex flex-col w-[300px] shrink-0 h-full max-h-full">
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b-2 flex items-center justify-between sticky top-0 z-10 rounded-t-xl shrink-0 shadow-sm",
        theme.bg,
        theme.border
      )}>
        <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest truncate mr-2">{title}</h3>
        <span className={cn(
          "px-2.5 py-0.5 text-white text-[11px] font-black rounded-lg shadow-md",
          theme.badge
        )}>
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
            Kéo thả Khách vào đây
          </div>
        )}
      </div>
    </div>
  );
};

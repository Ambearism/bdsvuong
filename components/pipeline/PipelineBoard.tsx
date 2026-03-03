
import React, { useState, useEffect } from 'react';
import { 
  DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, 
  KeyboardSensor, closestCorners, DragStartEvent, DragOverEvent, DragEndEvent 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PipelineColumn } from './PipelineColumn';
import { PipelineCard } from './PipelineCard';
import { PipelineRightPanel } from './PipelineRightPanel';
import { PipelineCard as PipelineCardType, PipelineStageKey } from '../../types';
import { getPipelineCards } from '../../data';
import { toast, Skeleton } from '../ui';

const STAGE_CONFIG: { key: PipelineStageKey; title: string; color: string }[] = [
    { key: 'lead_moi', title: 'LEAD MỚI', color: 'border-emerald-500' },
    { key: 'dang_cham', title: 'ĐANG CHĂM', color: 'border-lime-500' },
    { key: 'hen_xem_nha', title: 'HẸN XEM NHÀ', color: 'border-yellow-400' },
    { key: 'deal_mo', title: 'DEAL MỞ', color: 'border-orange-500' },
    { key: 'dam_phan', title: 'ĐÀM PHÁN', color: 'border-purple-500' },
    { key: 'dat_coc', title: 'ĐẶT CỌC', color: 'border-sky-500' },
    { key: 'gd_hoan_tat', title: 'GIAO DỊCH HOÀN TẤT', color: 'border-blue-700' },
    { key: 'that_bai', title: 'THẤT BẠI', color: 'border-slate-400' },
];

export const PipelineBoard = () => {
    const [cards, setCards] = useState<PipelineCardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCard, setActiveCard] = useState<PipelineCardType | null>(null);
    const [detailCard, setDetailCard] = useState<PipelineCardType | null>(null);

    const columns = STAGE_CONFIG.map(config => ({
        ...config,
        cards: cards.filter(c => c.stage === config.key)
    }));

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getPipelineCards();
                setCards(data);
            } catch (e) {
                toast("Không tải được dữ liệu pipeline", "error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const card = cards.find(c => c.id === active.id);
        if (card) setActiveCard(card);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const card = cards.find(c => c.id === activeId);
        if (!card) return;

        let destStage: PipelineStageKey | undefined;
        const overCard = cards.find(c => c.id === overId);
        
        if (overCard) {
            destStage = overCard.stage;
        } else if (STAGE_CONFIG.some(s => s.key === overId)) {
            destStage = overId as PipelineStageKey;
        }

        if (!destStage || destStage === card.stage) return;

        const sourceIndex = STAGE_CONFIG.findIndex(s => s.key === card.stage);
        const destIndex = STAGE_CONFIG.findIndex(s => s.key === destStage);

        if (destIndex < sourceIndex && destStage !== 'that_bai') {
            if (!window.confirm("Bạn đang kéo ngược tiến trình, vẫn tiếp tục?")) return;
        }

        if (destStage === 'that_bai') {
            if (!window.confirm("Xác nhận chuyển sang Thất Bại?")) return;
        }

        let updatedHasDeal = card.hasDeal;
        if (!card.hasDeal && destIndex >= 3 && destIndex < 7) { 
            updatedHasDeal = true;
            toast("Đã tự động tạo Deal cho khách hàng này");
        }

        setCards(prev => prev.map(c => 
            c.id === activeId ? { ...c, stage: destStage!, hasDeal: updatedHasDeal, updatedAt: new Date().toISOString() } : c
        ));
        
        toast(`Đã chuyển sang ${STAGE_CONFIG.find(s => s.key === destStage)?.title}`);
    };

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto h-full pb-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="w-[280px] shrink-0 space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full pb-6 items-start min-w-fit pr-8">
                {columns.map(col => (
                    <PipelineColumn 
                        key={col.key}
                        id={col.key}
                        title={col.title}
                        color={col.color}
                        cards={col.cards}
                        count={col.cards.length}
                        onCardClick={setDetailCard}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeCard ? <PipelineCard card={activeCard} onClick={()=>{}} /> : null}
            </DragOverlay>

            <PipelineRightPanel card={detailCard} onClose={() => setDetailCard(null)} />
        </DndContext>
    );
};

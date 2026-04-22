import React, { useEffect, useMemo, useRef, useState, memo } from 'react'
import { Card, Typography, Flex, Badge, Spin } from 'antd'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { OpportunityItem, OpportunityListParams } from '@/types/opportunity'
import type { OpportunityStageType } from '@/config/constant'
import { OpportunityStageLabels, OpportunityStageColors } from '@/config/constant'
import InfiniteScroll from 'react-infinite-scroll-component'
import { KanbanCard } from '@/pages/pipelines/KanbanCard'
import type { ApiResponse, ListResponse } from '@/types'
import type { EnumData } from '@/api/types'
import type { OpportunityTaskItem } from '@/types/opportunity-task'
import { useGetPipelineOpportunitiesQuery } from '@/api/opportunity'
import { app } from '@/config/app'

interface KanbanColumnProps {
    stage: OpportunityStageType
    filters: Omit<OpportunityListParams, 'stage'>
    enumData: ApiResponse<EnumData> | undefined
    onAddTask: (itemId: number) => void
    onEditTask: (task: OpportunityTaskItem) => void
    onDeleteTask: (taskId: number) => void
    onSendReminder: (itemId: number, selectedTasks: OpportunityTaskItem[]) => void
    onViewHistory: (itemId: number) => void
    onItemsUpdate?: (stage: OpportunityStageType, items: OpportunityItem[]) => void
    items: OpportunityItem[]
    refreshId?: number
    isOver: boolean
    isOverColumnSelf?: boolean
}

export const KanbanColumn = memo(
    ({
        stage,
        filters,
        enumData,
        onAddTask,
        onEditTask,
        onDeleteTask,
        onSendReminder,
        onViewHistory,
        onItemsUpdate,
        items,
        refreshId,
        isOver,
        isOverColumnSelf,
    }: KanbanColumnProps) => {
        const [isInView, setIsInView] = useState(false)
        const [page, setPage] = useState(app.DEFAULT_PAGE)
        const [hasMore, setHasMore] = useState(true)
        const containerRef = useRef<HTMLDivElement>(null)
        const scrollParentRef = useRef<HTMLDivElement>(null)
        const processedLeadsReference = useRef<ApiResponse<ListResponse<OpportunityItem>> | null>(null)

        const columnId = `column-${stage}`
        const { setNodeRef: setDroppableRef } = useDroppable({
            id: columnId,
        })
        const { setNodeRef: setBottomDroppableRef, isOver: isOverBottomZone } = useDroppable({
            id: `column-bottom-${stage}`,
        })

        useEffect(() => {
            setPage(app.DEFAULT_PAGE)
            setHasMore(true)
        }, [filters, stage])

        useEffect(() => {
            if (!containerRef.current) return

            const observer = new IntersectionObserver(
                ([entry]) => {
                    setIsInView(entry.isIntersecting)
                },
                {
                    root: null,
                    threshold: 0.1,
                    rootMargin: '0px 100px 0px 100px',
                },
            )

            observer.observe(containerRef.current)

            return () => observer.disconnect()
        }, [])

        const queryArguments = useMemo(
            () => ({
                ...filters,
                stage,
                per_page: app.DEFAULT_PAGE_SIZE,
                page,
                refresh_id: refreshId,
            }),
            [filters, stage, page, refreshId],
        )

        const {
            data: leadsData,
            isLoading,
            isFetching,
        } = useGetPipelineOpportunitiesQuery(queryArguments, {
            skip: !isInView,
            refetchOnMountOrArgChange: true,
        })

        useEffect(() => {
            if (!leadsData?.data || leadsData === processedLeadsReference.current) return
            processedLeadsReference.current = leadsData

            const newItems = leadsData.data.items as OpportunityItem[]

            if (page === app.DEFAULT_PAGE) {
                onItemsUpdate?.(stage, newItems)
            } else {
                const merged = [...items, ...newItems]
                const map = new Map()
                merged.forEach(item => map.set(item.id, item))
                onItemsUpdate?.(stage, Array.from(map.values()))
            }
            setHasMore(newItems.length === app.DEFAULT_PAGE_SIZE)
        }, [leadsData, page, items, onItemsUpdate, stage])

        const fetchMoreData = () => {
            if (hasMore && !isFetching) {
                setPage(prev => prev + 1)
            }
        }

        const stageLabel = OpportunityStageLabels[stage]
        const stageColor = OpportunityStageColors[stage]

        const setRefs = (element: HTMLDivElement | null) => {
            setDroppableRef(element)
            ;(containerRef as React.RefObject<HTMLDivElement | null>).current = element
        }

        return (
            <div ref={setRefs} className="flex-shrink-0 w-80 h-full">
                <Card
                    size="small"
                    className={`!h-full !flex !flex-col ${isOver ? '!border-2' : '!border !border-[#e5e7eb]'} 
                    [&>.ant-card-body]:!p-3
                    [&>.ant-card-body]:!h-full
                    [&>.ant-card-body]:!flex
                    [&>.ant-card-body]:!flex-col
                    [&>.ant-card-body]:!min-h-0`}
                    style={{
                        borderColor: isOver ? stageColor : undefined,
                        backgroundColor: isOver ? `${stageColor}10` : undefined,
                    }}>
                    <div
                        className="mb-3 rounded-lg px-3 py-2.5"
                        style={{
                            backgroundColor: `${stageColor}20`,
                        }}>
                        <Flex justify="space-between" align="center">
                            <Typography.Text strong className="!text-sm" style={{ color: stageColor }}>
                                {stageLabel.toUpperCase()}
                            </Typography.Text>
                            <Flex gap={8} align="center">
                                {(isLoading || isFetching) && <Spin size="small" />}
                                <Badge
                                    count={leadsData?.data?.total ?? items.length}
                                    className="!text-white !font-bold !min-w-8 !h-6 !leading-6 !rounded-xl !px-2"
                                    style={{
                                        backgroundColor: stageColor,
                                    }}
                                />
                            </Flex>
                        </Flex>
                    </div>
                    <div
                        id={`scrollable-container-${stage}`}
                        ref={scrollParentRef}
                        className="flex-1 overflow-y-auto pr-2 !min-h-0 !relative">
                        {items.length === 0 && (isLoading || !isInView) && page === app.DEFAULT_PAGE ? (
                            <Flex vertical align="center" justify="center" className="h-40" gap={8}>
                                <Spin />
                                <Typography.Text type="secondary" className="text-xs">
                                    Đang chuẩn bị...
                                </Typography.Text>
                            </Flex>
                        ) : (
                            <InfiniteScroll
                                dataLength={items.length}
                                next={fetchMoreData}
                                hasMore={hasMore}
                                loader={
                                    isFetching && (
                                        <div className="flex justify-center py-4">
                                            <Spin size="small" />
                                        </div>
                                    )
                                }
                                scrollableTarget={`scrollable-container-${stage}`}
                                className="flex flex-col !overflow-visible">
                                <SortableContext
                                    items={items.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}>
                                    {items.map(item => (
                                        <KanbanCard
                                            key={item.id}
                                            item={item}
                                            enumData={enumData}
                                            onAddTask={onAddTask}
                                            onEditTask={onEditTask}
                                            onDeleteTask={onDeleteTask}
                                            onSendReminder={onSendReminder}
                                            onViewHistory={onViewHistory}
                                        />
                                    ))}
                                </SortableContext>
                                {(isOverColumnSelf || isOverBottomZone) && (
                                    <div className="h-1.5 bg-blue-500 mt-2 mb-4 rounded-full w-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                                <div ref={setBottomDroppableRef} className="h-24 w-full" />
                            </InfiniteScroll>
                        )}
                        {isInView && items.length === 0 && !isLoading && <div className="!min-h-[100px] !w-full" />}
                    </div>
                </Card>
            </div>
        )
    },
)

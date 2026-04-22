import React, { useCallback, useMemo, useState } from 'react'
import {
    Card,
    Space,
    Typography,
    Button,
    message,
    Flex,
    Select,
    Tooltip,
    Input,
    Breadcrumb,
    DatePicker,
    Modal,
} from 'antd'
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import {
    useGetPipelineStatisticsQuery,
    useChangeOpportunityStageMutation,
    useUpdateOpportunityPositionsMutation,
} from '@/api/opportunity'
import {
    useCreateOpportunityTaskMutation,
    useUpdateOpportunityTaskMutation,
    useDeleteOpportunityTaskMutation,
} from '@/api/opportunity-task'
import { useGetMyDebtRemindersQuery } from '@/api/debt_note'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery } from '@/api/zone'
import { useGetAccountListQuery } from '@/api/account'
import { useCreateGoogleEventMutation } from '@/api/googleCalendar'
import type { OpportunityItem } from '@/types/opportunity'
import type { OpportunityTaskItem } from '@/types/opportunity-task'
import type { DebtNoteBase } from '@/types/debt-note'
import type { OpportunityStageType } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { GoHome } from 'react-icons/go'
import {
    OpportunityStage,
    NEED_TYPE_OPTIONS,
    BUDGET_OPTIONS,
    PERIOD_TYPE,
    PERIOD_TYPE_OPTIONS,
    TASK_STATUS,
} from '@/config/constant'
import { app } from '@/config/app'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import dayjs from 'dayjs'
import { KanbanColumn } from '@/pages/pipelines/KanbanColumn'
import { DebtReminderColumn } from '@/pages/pipelines/DebtReminderColumn'
import { PipelineStatistics } from '@/pages/pipelines/PipelineStatistics'
import { AddOpportunityTaskModal, type OpportunityTaskFormValues } from '@/components/modals/AddOpportunityTaskModal'
import HistoryModal from '@/components/modals/HistoryModal'
import type { AccountItem } from '@/types/account'
import type { PeriodType } from '@/types'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { useApiError } from '@/utils/error'

const PipelineList: React.FC = () => {
    useDocumentTitle('Tiến trình Pipeline')
    const { hasPermission } = usePermission()
    const { handleError } = useApiError()
    const [province, setProvince] = useState<number | undefined>(undefined)
    const [ward, setWard] = useState<number | undefined>(undefined)
    const [productType, setProductType] = useState<number | undefined>(undefined)
    const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined)
    const [leadSource, setLeadSource] = useState<number[]>([])
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
    const [quickDate, setQuickDate] = useState<PeriodType | undefined>(undefined)
    const [need, setNeed] = useState<string | undefined>(undefined)
    const [budgetFilter, setBudgetFilter] = useState<string | undefined>(undefined)
    const [activeId, setActiveId] = useState<number | null>(null)
    const [overColumnId, setOverColumnId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | number | null>(null)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | undefined>(undefined)
    const [sendingDebtReminderId, setSendingDebtReminderId] = useState<number | undefined>(undefined)
    const { data: provinceData, isLoading: loadingProvince } = useGetProvinceListQuery()
    const { data: enumData } = useGetEnumOptionsQuery(['lead_source', 'opportunity_stage', 'product_types'])
    const { data: accountsData } = useGetAccountListQuery({ per_page: app.FETCH_ALL, is_option: true })
    const [itemsByStage, setItemsByStage] = useState<Record<OpportunityStageType, OpportunityItem[]>>(() => {
        const initial = {} as Record<OpportunityStageType, OpportunityItem[]>
        const stages = [
            OpportunityStage.LEAD_MOI,
            OpportunityStage.DANG_CHAM,
            OpportunityStage.HEN_XEM_NHA,
            OpportunityStage.DEAL_MO,
            OpportunityStage.DAM_PHAN,
            OpportunityStage.DAT_COC,
            OpportunityStage.GD_HOAN_TAT,
            OpportunityStage.HUY,
        ]
        stages.forEach(stage => {
            initial[stage] = []
        })
        return initial
    })

    const allStages: OpportunityStageType[] = useMemo(
        () => [
            OpportunityStage.LEAD_MOI,
            OpportunityStage.DANG_CHAM,
            OpportunityStage.HEN_XEM_NHA,
            OpportunityStage.DEAL_MO,
            OpportunityStage.DAM_PHAN,
            OpportunityStage.DAT_COC,
            OpportunityStage.GD_HOAN_TAT,
            OpportunityStage.HUY,
        ],
        [],
    )

    const [stageRefreshVersions, setStageRefreshVersions] = useState<Record<number, number>>({})

    const triggerStageRefresh = useCallback(
        (stage?: number) => {
            setStageRefreshVersions(prev => {
                if (stage !== undefined) {
                    return { ...prev, [stage]: (prev[stage] || 0) + 1 }
                }
                const next = { ...prev }
                allStages.forEach(s => {
                    next[s as number] = (next[s as number] || 0) + 1
                })
                return next
            })
        },
        [allStages],
    )

    const handleItemsUpdate = useCallback((stage: OpportunityStageType, items: OpportunityItem[]) => {
        setItemsByStage(prev => ({
            ...prev,
            [stage]: items,
        }))
    }, [])

    const filters = useMemo(
        () => ({
            zone_province_id: province,
            zone_ward_id: ward,
            product_type_id: productType,
            assigned_to: assignedTo,
            lead_source_ids: leadSource.length ? leadSource : undefined,
            keyword: search,
            from_date: dateRange?.[0]?.format('YYYY-MM-DD'),
            to_date: dateRange?.[1]?.format('YYYY-MM-DD'),
            budget: budgetFilter,
        }),
        [province, ward, productType, assignedTo, leadSource, search, dateRange, budgetFilter],
    )

    const { data: statisticsData, refetch: refetchStatistics } = useGetPipelineStatisticsQuery(filters, {
        refetchOnMountOrArgChange: true,
    })
    const { data: debtReminderData } = useGetMyDebtRemindersQuery()
    const statistics = statisticsData?.data
    const debtReminderItems = useMemo(
        () => (debtReminderData?.data?.items ?? []) as DebtNoteBase[],
        [debtReminderData?.data?.items],
    )

    const allItems = useMemo(() => {
        return Object.values(itemsByStage).flat()
    }, [itemsByStage])

    const items = useMemo(() => {
        return need ? allItems.filter(item => item.need === need) : allItems
    }, [allItems, need])

    const [changeStage] = useChangeOpportunityStageMutation()
    const [updatePositions] = useUpdateOpportunityPositionsMutation()
    const [createTask, { isLoading: isCreatingTask }] = useCreateOpportunityTaskMutation()
    const [updateTask, { isLoading: isUpdatingTask }] = useUpdateOpportunityTaskMutation()
    const [deleteTask] = useDeleteOpportunityTaskMutation()
    const [createGoogleEvent] = useCreateGoogleEventMutation()
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined)
    const [editingTask, setEditingTask] = useState<OpportunityTaskItem | undefined>(undefined)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    )

    const handleAddTask = useCallback((itemId: number) => {
        setSelectedItemId(itemId)
        setEditingTask(undefined)
        setTaskModalOpen(true)
    }, [])

    const handleEditTask = useCallback((task: OpportunityTaskItem) => {
        setEditingTask(task)
        setSelectedItemId(task.opportunity_id)
        setTaskModalOpen(true)
    }, [])

    const handleDeleteTask = useCallback(
        (taskId: number) => {
            Modal.confirm({
                title: 'Xác nhận xóa tác vụ',
                icon: <ExclamationCircleOutlined />,
                content: 'Bạn có chắc chắn muốn xóa tác vụ này không?',
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                    try {
                        await deleteTask(taskId).unwrap()
                        message.success('Xoá tác vụ thành công')
                        triggerStageRefresh()
                    } catch (error: unknown) {
                        handleError(error, 'Xóa tác vụ thất bại')
                    }
                },
            })
        },
        [deleteTask, handleError, triggerStageRefresh],
    )

    const handleTaskSubmit = useCallback(
        async (values: OpportunityTaskFormValues) => {
            try {
                const payload = {
                    title: values.task,
                    notes: '',
                    assigned_to: values.assignee || 0,
                    start_date: values.startDate?.toISOString() || undefined,
                    end_date: values.endDate.toISOString(),
                    status: values.status || TASK_STATUS.PENDING,
                }

                if (editingTask) {
                    await updateTask({ task_id: editingTask.id, payload }).unwrap()
                    message.success('Cập nhật tác vụ thành công')
                } else {
                    await createTask({ opportunity_id: selectedItemId || 0, payload }).unwrap()
                    message.success('Thêm tác vụ thành công')
                }
                setTaskModalOpen(false)
                setEditingTask(undefined)
                triggerStageRefresh()
            } catch (error: unknown) {
                handleError(error, editingTask ? 'Cập nhật tác vụ thất bại' : 'Thêm tác vụ thất bại')
            }
        },
        [selectedItemId, editingTask, updateTask, createTask, handleError, triggerStageRefresh],
    )

    const handleSendReminder = useCallback(
        async (_itemId: number, selectedTasks: OpportunityTaskItem[]) => {
            const requestData = {
                events: selectedTasks
                    .filter(task => task.assigned_to)
                    .map(task => ({
                        account_id: task.assigned_to!,
                        summary: task.title || '',
                        start_time: dayjs(task.start_date).toISOString(),
                        end_time: dayjs(task.end_date).toISOString(),
                    })),
            }
            try {
                await createGoogleEvent(requestData).unwrap()
                message.success('Đã gửi nhắc việc thành công')
            } catch (error: unknown) {
                handleError(error, 'Gửi nhắc việc thất bại')
            }
        },
        [createGoogleEvent, handleError],
    )

    const handleSendDebtReminder = useCallback(
        async (item: DebtNoteBase) => {
            if (!item.assigned_to) {
                message.error('Không tìm thấy người phụ trách để gửi nhắc việc')
                return
            }

            const reminderDate = dayjs(item.reminder_date)
            if (!reminderDate.isValid()) {
                message.error('Ngày nhắc việc không hợp lệ')
                return
            }

            const startTime = reminderDate.hour(9).minute(0).second(0).millisecond(0)
            const endTime = startTime.add(30, 'minute')

            try {
                setSendingDebtReminderId(item.id)
                await createGoogleEvent({
                    events: [
                        {
                            account_id: item.assigned_to,
                            summary: item.title || 'Debt note reminder',
                            start_time: startTime.toISOString(),
                            end_time: endTime.toISOString(),
                        },
                    ],
                }).unwrap()
                message.success('Đã gửi nhắc việc thành công')
            } catch (err: unknown) {
                handleError(err, 'Gửi nhắc việc thất bại')
            } finally {
                setSendingDebtReminderId(undefined)
            }
        },
        [createGoogleEvent, handleError],
    )

    const handleViewHistory = useCallback((itemId: number) => {
        setSelectedHistoryId(itemId)
        setHistoryModalOpen(true)
    }, [])
    const handleResetFilter = () => {
        setProvince(undefined)
        setWard(undefined)
        setProductType(undefined)
        setAssignedTo(undefined)
        setLeadSource([])
        setSearch(undefined)
        setDateRange(null)
        setQuickDate(undefined)
        setNeed(undefined)
        setBudgetFilter(undefined)
    }
    const handleQuickDate = useCallback((type: PeriodType) => {
        setQuickDate(type)
        if (type === PERIOD_TYPE.LAST_7_DAYS) {
            setDateRange([dayjs().subtract(6, 'day'), dayjs()])
        } else if (type === PERIOD_TYPE.THIS_MONTH) {
            setDateRange([dayjs().startOf('month'), dayjs().endOf('month')])
        } else {
            setDateRange(null)
        }
    }, [])
    const handleQuickDateChange = useCallback(
        (value: PeriodType | undefined) => {
            if (!value) {
                setQuickDate(undefined)
                setDateRange(null)
                return
            }
            handleQuickDate(value)
        },
        [handleQuickDate],
    )
    const handleDateRangeChange = useCallback((value: [Dayjs | null, Dayjs | null] | null) => {
        setDateRange(value)
        setQuickDate(undefined)
    }, [])
    const accountOptions = useMemo(() => {
        const accountList = accountsData?.data?.list || []
        return accountList.map((account: AccountItem) => ({
            label: account.full_name || '',
            value: account.id,
        }))
    }, [accountsData?.data?.list])

    const provinceOptions = useMemo(
        () =>
            provinceData?.data.items.map(item => ({
                value: item.id,
                label: item.name,
            })),
        [provinceData],
    )
    const handleStageChange = useCallback(
        async (
            id: number,
            newStage: OpportunityStageType,
            currentName: string,
            currentAssignedTo: number,
            previousStage?: OpportunityStageType,
        ) => {
            try {
                await changeStage({
                    opportunity_id: id,
                    payload: {
                        stage: newStage,
                        name: currentName,
                        assigned_to: currentAssignedTo,
                    },
                }).unwrap()
                message.success('Cập nhật thành công')
                refetchStatistics()
                triggerStageRefresh(previousStage)
                triggerStageRefresh(newStage)
            } catch (error: unknown) {
                if (previousStage !== undefined) {
                    setItemsByStage(prev => {
                        const sourceItems = [...(prev[newStage] || [])]
                        const destItems = [...(prev[previousStage] || [])]
                        const itemToMove = sourceItems.find(item => item.id === id)

                        if (!itemToMove) return prev

                        return {
                            ...prev,
                            [newStage]: sourceItems.filter(item => item.id !== id),
                            [previousStage]: [{ ...itemToMove, stage: previousStage }, ...destItems],
                        }
                    })
                }
                handleError(error, 'Cập nhật trạng thái thất bại')
            }
        },
        [changeStage, handleError, refetchStatistics, triggerStageRefresh],
    )
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number)
    }
    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        setOverId(over?.id ?? null)
        if (!over) {
            setOverColumnId(null)
            return
        }

        const overIdStr = typeof over.id === 'string' ? over.id : ''
        if (overIdStr.startsWith('column-')) {
            const normalizedColumnId = overIdStr.startsWith('column-bottom-')
                ? overIdStr.replace('column-bottom-', 'column-')
                : overIdStr
            setOverColumnId(normalizedColumnId)
        } else {
            const targetItem = items.find(i => i.id === over.id)
            if (targetItem) {
                setOverColumnId(`column-${targetItem.stage}`)
            } else {
                setOverColumnId(null)
            }
        }
    }
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setOverColumnId(null)
        setOverId(null)
        if (!over) return
        const itemId = active.id as number

        const item = items.find(opportunityItem => opportunityItem.id === itemId)
        if (!item) return

        let targetStage: OpportunityStageType | undefined

        const overIdStr = typeof over.id === 'string' ? over.id : ''
        if (overIdStr.startsWith('column-')) {
            const stageValueStr = overIdStr.startsWith('column-bottom-')
                ? overIdStr.replace('column-bottom-', '')
                : overIdStr.replace('column-', '')
            const stageValue = parseInt(stageValueStr, 10)
            if (allStages.includes(stageValue as OpportunityStageType)) {
                targetStage = stageValue as OpportunityStageType
            }
        } else {
            const targetItem = items.find(opportunityItem => opportunityItem.id === over.id)
            if (targetItem) {
                targetStage = targetItem.stage
            }
        }
        if (!targetStage) return

        if (!hasPermission(RESOURCE_TYPE.PIPELINE_PROCESS, ACTION.UPDATE)) {
            message.error('Bạn không có quyền cập nhật tiến trình pipeline')
            return
        }

        const sourceStage = item.stage
        const destinationStage = targetStage

        const sourceItems = [...(itemsByStage[sourceStage] || [])]
        const destItems = [...(itemsByStage[destinationStage] || [])]

        const nextItemsByStage: Record<OpportunityStageType, OpportunityItem[]> = { ...itemsByStage }

        if (sourceStage === destinationStage) {
            const oldIndex = sourceItems.findIndex((sourceItem: OpportunityItem) => sourceItem.id === itemId)
            let newIndex = sourceItems.findIndex((targetItem: OpportunityItem) => targetItem.id === over.id)

            if (newIndex === -1 && typeof over.id === 'string' && over.id.toString().startsWith('column-')) {
                newIndex = sourceItems.length - 1
            }

            if (oldIndex !== -1 && newIndex !== -1) {
                let targetIndex = newIndex
                const isOverColumn = typeof over.id === 'string' && over.id.toString().startsWith('column-')
                if (oldIndex < newIndex && !isOverColumn) {
                    targetIndex = newIndex - 1
                }

                nextItemsByStage[sourceStage] = arrayMove(sourceItems, oldIndex, targetIndex)
            } else {
                return
            }
        } else {
            const itemToMove = { ...item, stage: destinationStage }
            const overIndex = destItems.findIndex(destItem => destItem.id === over.id)

            const destinationItems =
                overIndex === -1
                    ? [...destItems, itemToMove]
                    : [...destItems.slice(0, overIndex), itemToMove, ...destItems.slice(overIndex)]

            nextItemsByStage[sourceStage] = sourceItems.filter(sourceItem => sourceItem.id !== itemId)
            nextItemsByStage[destinationStage] = destinationItems
        }

        setItemsByStage(nextItemsByStage)

        const destStageItems = nextItemsByStage[destinationStage]
        const positionPayload = {
            items: destStageItems.map((stageItem, index) => ({
                id: stageItem.id,
                position: index + 1,
            })),
        }

        updatePositions(positionPayload)
            .then(() => {
                if (sourceStage === destinationStage) {
                    message.success('Cập nhật thành công')
                }
            })
            .catch(error => {
                handleError(error, 'Cập nhật thất bại')
            })

        if (sourceStage !== destinationStage) {
            const currentAssignedTo = item.assigned_to_info?.id || item.assigned_to || 0
            handleStageChange(itemId, targetStage, item.name, currentAssignedTo, sourceStage)
        }
    }
    const activeItem = useMemo(() => items.find(activeCandidate => activeCandidate.id === activeId), [items, activeId])
    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Kanban Pipeline',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <PipelineStatistics totalLeads={statistics?.total_leads} conversionRates={statistics?.conversion_rates} />
            <Card>
                <Flex gap="small" align="center" className="!mb-4" wrap="wrap">
                    <Tooltip title="Tìm kiếm theo mã, tên, sđt">
                        <Input
                            className="!w-50"
                            placeholder="Tìm Kiếm"
                            allowClear
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value)
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo nguồn">
                        <Select
                            className="!w-36"
                            placeholder="Nguồn Lead"
                            mode="multiple"
                            allowClear
                            maxTagCount="responsive"
                            value={leadSource}
                            onChange={setLeadSource}
                            options={enumData?.data?.lead_source}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo sale phụ trách">
                        <Select
                            className="!w-44"
                            placeholder="Sale Phụ Trách"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            value={assignedTo}
                            onChange={setAssignedTo}
                            options={accountOptions}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo nhu cầu">
                        <Select
                            className="!w-35"
                            placeholder="Nhu Cầu"
                            allowClear
                            value={need}
                            onChange={setNeed}
                            options={NEED_TYPE_OPTIONS}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo loại hình">
                        <Select
                            className="!w-40"
                            placeholder="Loại Hình BĐS"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            value={productType}
                            onChange={setProductType}
                            loading={!enumData}
                            options={enumData?.data?.product_types}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo khu vực">
                        <Select
                            className="!w-40"
                            placeholder="Khu Vực"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={loadingProvince}
                            value={province}
                            onChange={setProvince}
                            options={provinceOptions}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo ngân sách">
                        <Select
                            className="!w-40"
                            placeholder="Ngân Sách"
                            allowClear
                            value={budgetFilter}
                            onChange={value => {
                                setBudgetFilter(value)
                            }}
                            options={BUDGET_OPTIONS}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc nhanh theo thời gian">
                        <Select
                            className="!w-50"
                            placeholder="Chọn Thời Gian"
                            allowClear
                            value={quickDate}
                            options={PERIOD_TYPE_OPTIONS}
                            onChange={handleQuickDateChange}
                        />
                    </Tooltip>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD.MM.YYYY"
                        className="!w-56"
                    />
                    <Button
                        type="primary"
                        onClick={handleResetFilter}
                        className={`shrink-0 ${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border} ${CARE_COLOR_CLASSES.primaryHover.bgHover} ${CARE_COLOR_CLASSES.primaryHover.borderHover}`}>
                        Reset Bộ Lọc
                    </Button>
                </Flex>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4 !h-[calc(100vh-500px)] !min-h-150">
                        <div className="flex-shrink-0 !h-full !min-w-80 !w-80">
                            <DebtReminderColumn
                                items={debtReminderItems}
                                onSendReminder={handleSendDebtReminder}
                                sendingReminderId={sendingDebtReminderId}
                            />
                        </div>
                        {allStages.map(stage => {
                            const columnId = `column-${stage}`
                            return (
                                <div key={stage} className="flex-shrink-0 !h-full !min-w-80 !w-80">
                                    <KanbanColumn
                                        stage={stage}
                                        filters={filters}
                                        items={itemsByStage[stage] || []}
                                        enumData={enumData}
                                        onAddTask={handleAddTask}
                                        onEditTask={handleEditTask}
                                        onDeleteTask={handleDeleteTask}
                                        onSendReminder={handleSendReminder}
                                        onViewHistory={handleViewHistory}
                                        onItemsUpdate={handleItemsUpdate}
                                        refreshId={stageRefreshVersions[stage] || 0}
                                        isOver={overColumnId === columnId}
                                        isOverColumnSelf={overId === columnId}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <DragOverlay dropAnimation={null}>
                        {activeItem ? (
                            <div style={{ transform: 'scale(0.95) rotate(2deg)', cursor: 'grabbing', opacity: 0.9 }}>
                                <Card
                                    size="small"
                                    className="w-80 !border-2 !border-[#1890ff] !shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                                    <Space direction="vertical" size="small" className="w-full">
                                        <Typography.Text strong>{activeItem.name}</Typography.Text>
                                        <Typography.Text type="secondary" className="text-xs">
                                            {activeItem.phone}
                                        </Typography.Text>
                                    </Space>
                                </Card>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </Card>
            <AddOpportunityTaskModal
                open={taskModalOpen}
                onCancel={() => {
                    setTaskModalOpen(false)
                    setEditingTask(undefined)
                }}
                onOk={handleTaskSubmit}
                accountOptions={(accountsData?.data?.list || []).map(item => ({
                    value: item.id,
                    label: item.full_name || item.account_name,
                }))}
                loading={isCreatingTask || isUpdatingTask}
                initialValues={
                    editingTask
                        ? {
                              task: editingTask.title,
                              startDate: editingTask.start_date ? dayjs(editingTask.start_date) : null,
                              endDate: dayjs(editingTask.end_date),
                              assignee: editingTask.assigned_to,
                              status: editingTask.status,
                          }
                        : undefined
                }
            />
            {selectedHistoryId && (
                <HistoryModal
                    open={historyModalOpen}
                    onCancel={() => {
                        setHistoryModalOpen(false)
                        setSelectedHistoryId(undefined)
                    }}
                    opportunityId={selectedHistoryId}
                />
            )}
        </Space>
    )
}
export default PipelineList

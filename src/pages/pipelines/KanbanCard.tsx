import { useMemo, useState, memo } from 'react'
import { Card, Tag, Space, Typography, Button, Flex, Checkbox, Avatar, message } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { UserOutlined, SendOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'

import type { OpportunityItem } from '@/types/opportunity'
import { LeadSourceLabels, NeedTypeLabels, NeedTypeTagColors } from '@/config/constant'
import { app } from '@/config/app'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import dayjs from 'dayjs'
import type { ApiResponse } from '@/types'
import type { EnumData, EnumItem } from '@/api/types'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import type { OpportunityTaskItem } from '@/types/opportunity-task'
import { TASK_STATUS } from '@/config/constant'

export interface KanbanCardProps {
    item: OpportunityItem
    enumData: ApiResponse<EnumData> | undefined
    onAddTask: (itemId: number) => void
    onEditTask: (task: OpportunityTaskItem) => void
    onDeleteTask: (taskId: number) => void
    onSendReminder: (itemId: number, selectedTasks: OpportunityTaskItem[]) => void
    onViewHistory: (itemId: number) => void
}

export const KanbanCard = memo(
    ({ item, enumData, onAddTask, onEditTask, onDeleteTask, onSendReminder, onViewHistory }: KanbanCardProps) => {
        const { hasPermission } = usePermission()
        const { attributes, listeners, setNodeRef, isDragging, over } = useSortable({
            id: item.id,
            disabled: !hasPermission(RESOURCE_TYPE.PIPELINE_PROCESS, ACTION.UPDATE),
        })

        const isOver = over?.id === item.id && !isDragging

        const tasks = useMemo(() => item.tasks || [], [item.tasks])

        const [overrideStatuses, setOverrideStatuses] = useState<Record<number, boolean>>({})

        const taskStatuses = useMemo(() => {
            const initial = tasks.reduce<Record<number, boolean>>((accumulator, task) => {
                accumulator[task.id] = task.status === TASK_STATUS.COMPLETED
                return accumulator
            }, {})
            return { ...initial, ...overrideStatuses }
        }, [tasks, overrideStatuses])

        const style = {
            transform: undefined,
            opacity: isDragging ? 0.4 : 1,
            transition: 'opacity 200ms ease-in-out',
        }

        const productTypeLabel = enumData?.data?.product_types?.find(
            (type: EnumItem) => type.value == item.product_type_id,
        )?.label

        const leadSourceLabel =
            enumData?.data?.lead_source?.find((source: EnumItem) => source.value == item.lead_source)?.label ||
            LeadSourceLabels[item.lead_source as keyof typeof LeadSourceLabels]

        const handleViewHistory = (event: React.MouseEvent) => {
            event.stopPropagation()
            onViewHistory(item.id)
        }

        const handleTaskStatusChange = (taskId: number, checked: boolean, event: CheckboxChangeEvent) => {
            event.stopPropagation()
            setOverrideStatuses(previous => ({
                ...previous,
                [taskId]: checked,
            }))
        }

        const handleEditTaskClick = (task: OpportunityTaskItem, event: React.MouseEvent) => {
            event.stopPropagation()
            onEditTask(task)
        }

        const handleDeleteTaskClick = (taskId: number, event: React.MouseEvent) => {
            event.stopPropagation()
            onDeleteTask(taskId)
        }

        const handleAddTaskClick = (event: React.MouseEvent) => {
            event.stopPropagation()
            onAddTask(item.id)
        }

        const handleSendReminderClick = (event: React.MouseEvent) => {
            event.stopPropagation()
            const selectedTasks = tasks.filter(task => taskStatuses[task.id])
            if (selectedTasks.length === 0) {
                message.error('Vui lòng chọn ít nhất một tác vụ để gửi nhắc việc')
                return
            }
            onSendReminder(item.id, selectedTasks)
        }

        return (
            <div ref={setNodeRef} style={style} {...attributes} className="mb-3">
                {isOver && (
                    <div className="h-1.5 bg-blue-500 mb-2 rounded-full w-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
                <Card
                    size="small"
                    className={`cursor-move hover:shadow-md transition-shadow !border ${isOver ? '!border-blue-500' : '!border-[#e5e7eb]'} !touch-none
                    [&>.ant-card-body]:!p-2.5`}
                    {...listeners}>
                    <Space direction="vertical" size={2} className="w-full">
                        {(productTypeLabel || item.need || leadSourceLabel) && (
                            <Flex gap={4} wrap="wrap" className="mb-1">
                                {productTypeLabel && <Tag color="green">{productTypeLabel}</Tag>}
                                {item.need && (
                                    <Tag
                                        color={
                                            NeedTypeTagColors[item.need as keyof typeof NeedTypeTagColors] || 'default'
                                        }>
                                        {NeedTypeLabels[item.need as keyof typeof NeedTypeLabels] || item.need}
                                    </Tag>
                                )}
                                {leadSourceLabel && <Tag color="orange">{leadSourceLabel}</Tag>}
                            </Flex>
                        )}
                        <Flex align="baseline" gap={6} wrap="wrap">
                            <Typography.Text
                                strong
                                className="text-base cursor-pointer hover:text-blue-500 !leading-none"
                                onClick={handleViewHistory}>
                                {item.name}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="!text-xs">
                                {item.phone || app.EMPTY_DISPLAY}
                            </Typography.Text>
                        </Flex>
                        {item.budget_max && (
                            <Typography.Text className="text-xs">
                                <strong>Ngân sách:</strong> {item.budget_min ? `${item.budget_min} - ` : ''}
                                {item.budget_max} tỷ
                            </Typography.Text>
                        )}
                        {item.zone_province_name && (
                            <Typography.Text className="text-xs">
                                <strong>Khu vực:</strong> {item.zone_province_name}
                                {item.zone_ward_name ? ` - ${item.zone_ward_name}` : ''}
                            </Typography.Text>
                        )}
                        <div className="pt-2">
                            {tasks.length > 0 && (
                                <>
                                    <Typography.Text type="secondary" className="text-xs">
                                        Tác vụ:
                                    </Typography.Text>
                                    <div className="mt-1 space-y-2">
                                        {tasks.map((task: OpportunityTaskItem) => (
                                            <div
                                                key={task.id}
                                                className="bg-gray-50 p-2 rounded border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                                                <Flex align="center" justify="space-between">
                                                    <Checkbox
                                                        checked={taskStatuses[task.id] || false}
                                                        onChange={event =>
                                                            handleTaskStatusChange(task.id, event.target.checked, event)
                                                        }>
                                                        <Typography.Text strong className="text-sm">
                                                            {task.title}
                                                        </Typography.Text>
                                                    </Checkbox>
                                                    <Space size={0}>
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            icon={<EditOutlined className="text-xs" />}
                                                            onClick={event => handleEditTaskClick(task, event)}
                                                        />
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined className="text-xs" />}
                                                            onClick={event => handleDeleteTaskClick(task.id, event)}
                                                        />
                                                    </Space>
                                                </Flex>
                                                <div className="pl-6 mt-0.5">
                                                    <Typography.Text type="secondary" className="!text-xs block">
                                                        {dayjs(task.start_date).format('DD/MM/YYYY HH:mm')} -{' '}
                                                        {dayjs(task.end_date).format('DD/MM/YYYY HH:mm')}
                                                    </Typography.Text>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <Flex justify="center" className="w-full !mt-5">
                                {hasPermission(RESOURCE_TYPE.PIPELINE_PROCESS, ACTION.UPDATE) && (
                                    <Button
                                        type="link"
                                        size="small"
                                        className="!p-0 !h-auto text-xs !text-blue-500 hover:!text-blue-600"
                                        onClick={handleAddTaskClick}>
                                        + Thêm mới
                                    </Button>
                                )}
                            </Flex>
                        </div>
                        <div className="!border-t !border-[#E3E3E3] !mt-2 !mb-2" />
                        <Flex justify="space-between" align="center" className="pt-2">
                            <Flex align="center" gap={4}>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <Typography.Text type="secondary" className="text-xs">
                                    {item.assigned_to_info?.full_name || app.EMPTY_DISPLAY}
                                </Typography.Text>
                            </Flex>
                            {item.created_at && dayjs(item.created_at).isValid() && (
                                <Flex align="center" gap={4}>
                                    <CalendarOutlined className="text-xs text-gray-400" />
                                    <Typography.Text type="secondary" className="text-xs">
                                        {dayjs(item.created_at).format('DD/MM/YYYY')}
                                    </Typography.Text>
                                </Flex>
                            )}
                        </Flex>
                        {tasks.length > 0 && hasPermission(RESOURCE_TYPE.PIPELINE_PROCESS, ACTION.UPDATE) && (
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                block
                                className={`!mt-2 ${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border} !text-white disabled:!bg-[#95bdf8] disabled:!border-[#95bdf8] disabled:!text-white disabled:!opacity-100`}
                                onClick={handleSendReminderClick}>
                                Gửi Nhắc Việc
                            </Button>
                        )}
                    </Space>
                </Card>
            </div>
        )
    },
)

import React, { useMemo } from 'react'
import { Timeline, Typography, Tag, Flex, Avatar, Empty, Tooltip } from 'antd'
import {
    EditOutlined,
    CheckSquareOutlined,
    SwapOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons'
import type { OpportunityTaskItem } from '@/types/opportunity-task'
import type { StageHistoryItem } from '@/types/opportunity'
import {
    ActivityType,
    OpportunityStageLabels,
    OpportunityStageColors,
    TASK_STATUS,
    TASK_STATUS_OPTIONS,
    type OpportunityStageType,
} from '@/config/constant'
import dayjs from 'dayjs'

const { Text } = Typography

// URL regex for auto-linking
const URL_REGEX = /(https?:\/\/[^\s]+)/g

interface ActivityTimelineProps {
    tasks: OpportunityTaskItem[]
    stageHistory: StageHistoryItem[]
}

type TimelineEntry = {
    id: string
    type: 'note' | 'task' | 'stage-change' | 'call'
    label?: string
    title: string
    content?: string
    personName: string
    date: string
    raw: StageHistoryItem | OpportunityTaskItem
}

const taskStatusColors: Record<number, string> = {
    [TASK_STATUS.PENDING]: 'default',
    [TASK_STATUS.IN_PROGRESS]: 'blue',
    [TASK_STATUS.COMPLETED]: 'success',
    [TASK_STATUS.CANCELLED]: 'error',
}

const typeIcons: Record<string, React.ReactNode> = {
    note: <EditOutlined />,
    task: <CheckSquareOutlined />,
    'stage-change': <SwapOutlined />,
    call: <PhoneOutlined />,
}

const typeColors: Record<string, string> = {
    note: '#1677ff',
    task: '#fa8c16',
    'stage-change': '#52c41a',
    call: '#722ed1',
}

const renderContentWithLinks = (text: string) => {
    if (!text) return null
    const parts = text.split(URL_REGEX)
    return parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
            URL_REGEX.lastIndex = 0
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                    {part.length > 60 ? part.slice(0, 57) + '...' : part}
                </a>
            )
        }
        return <span key={i}>{part}</span>
    })
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ tasks, stageHistory }) => {
    const entries = useMemo<TimelineEntry[]>(() => {
        const result: TimelineEntry[] = []

        // Stage history entries
        stageHistory.forEach(item => {
            if (item.action_type === ActivityType.STAGE_CHANGE) {
                result.push({
                    id: `sh-${item.id}`,
                    type: 'stage-change',
                    title: 'Đổi trạng thái',
                    content: undefined,
                    personName: item.changed_by_name || item.changed_by_rel?.full_name || 'Hệ thống',
                    date: item.changed_at,
                    raw: item,
                })
            } else {
                // Notes from stage history (action_type = NOTE/CALL etc.)
                const isCall = item.action_type === ActivityType.CALL
                result.push({
                    id: `sh-${item.id}`,
                    type: isCall ? 'call' : 'note',
                    label: isCall ? 'Cuộc gọi' : 'Chăm sóc',
                    title: item.title || (isCall ? 'Ghi log cuộc gọi' : 'Ghi chú'),
                    content: item.notes,
                    personName: item.changed_by_name || item.changed_by_rel?.full_name || 'Hệ thống',
                    date: item.changed_at,
                    raw: item,
                })
            }
        })

        // Task entries
        tasks.forEach(task => {
            result.push({
                id: `task-${task.id}`,
                type: 'task',
                label: 'Tác vụ',
                title: task.title,
                content: task.notes !== task.title ? task.notes : undefined,
                personName:
                    task.assigned_to_info?.full_name || task.assigned_to_info?.account_name || 'Chưa phân công',
                date: task.created_at || task.start_date || task.end_date,
                raw: task,
            })
        })

        // Sort by date descending (newest first)
        result.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())

        return result
    }, [tasks, stageHistory])

    // Group entries by date
    const groupedEntries = useMemo(() => {
        const groups: { dateLabel: string; items: TimelineEntry[] }[] = []
        let currentDateLabel = ''

        entries.forEach(entry => {
            const dateLabel = dayjs(entry.date).format('DD/MM/YYYY')
            if (dateLabel !== currentDateLabel) {
                currentDateLabel = dateLabel
                groups.push({ dateLabel, items: [] })
            }
            groups[groups.length - 1].items.push(entry)
        })

        return groups
    }, [entries])

    if (entries.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có hoạt động nào"
                className="!my-10"
            />
        )
    }

    const renderStageChange = (item: StageHistoryItem) => {
        const fromLabel =
            OpportunityStageLabels[item.from_stage as OpportunityStageType] || 'Khởi tạo'
        const toLabel = OpportunityStageLabels[item.to_stage as OpportunityStageType] || '?'
        const toColor = OpportunityStageColors[item.to_stage as OpportunityStageType] || 'blue'

        return (
            <Flex gap={8} align="center" className="mt-1">
                <Tag>{fromLabel}</Tag>
                <span className="text-gray-400">→</span>
                <Tag color={toColor}>{toLabel}</Tag>
            </Flex>
        )
    }

    const renderTaskStatus = (task: OpportunityTaskItem) => {
        const option = TASK_STATUS_OPTIONS.find(opt => opt.value === task.status)
        const color = taskStatusColors[task.status] || 'default'
        return (
            <Flex gap={8} align="center" className="mt-1" wrap="wrap">
                <Tag color={color}>{option?.label || 'Chưa xác định'}</Tag>
                {task.end_date && (
                    <Text className="!text-xs !text-gray-400">
                        <ClockCircleOutlined className="mr-1" />
                        Hạn: {dayjs(task.end_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                )}
            </Flex>
        )
    }

    const timelineItems = groupedEntries.flatMap(group => {
        const items: { color?: string; dot?: React.ReactNode; children: React.ReactNode }[] = []

        // Date group header
        items.push({
            dot: <div className="w-2 h-2 rounded-full bg-gray-300" />,
            children: (
                <div className="activity-timeline__date-group">
                    {dayjs(group.items[0].date).format('DD/MM/YYYY')} — {dayjs(group.items[0].date).format('dddd')}
                </div>
            ),
        })

        // Entries within this date
        group.items.forEach(entry => {
            const entryColor = typeColors[entry.type] || '#1677ff'

            items.push({
                dot: (
                    <Avatar
                        size={28}
                        style={{ backgroundColor: entryColor }}
                        icon={typeIcons[entry.type]}
                        className="!text-xs"
                    />
                ),
                children: (
                    <div className={`activity-timeline__entry activity-timeline__entry--${entry.type}`}>
                        <Flex justify="space-between" align="start">
                            <div className="flex-1 min-w-0">
                                <Flex gap={8} align="center" wrap="wrap" className="mb-1">
                                    <Text strong className="!text-sm">
                                        {entry.title}
                                    </Text>
                                    {entry.label && (
                                        <Tag
                                            color={entry.type === 'call' ? 'purple' : entry.label === 'Phản hồi KH' ? 'green' : 'blue'}
                                            className="!text-xs !m-0">
                                            {entry.label}
                                        </Tag>
                                    )}
                                </Flex>

                                {entry.type === 'stage-change' && renderStageChange(entry.raw as StageHistoryItem)}

                                {entry.type === 'task' && renderTaskStatus(entry.raw as OpportunityTaskItem)}

                                {entry.content && (
                                    <div className="activity-timeline__content mt-1">
                                        {renderContentWithLinks(entry.content)}
                                    </div>
                                )}
                            </div>

                            <Text className="!text-xs !text-gray-400 !flex-shrink-0 !ml-3">
                                {dayjs(entry.date).format('HH:mm')}
                            </Text>
                        </Flex>

                        <div className="activity-timeline__meta">
                            <Tooltip title={entry.personName}>
                                <Flex align="center" gap={4}>
                                    <UserOutlined className="text-gray-400" />
                                    <span className="date-person">{entry.personName}</span>
                                </Flex>
                            </Tooltip>
                        </div>
                    </div>
                ),
            })
        })

        return items
    })

    return (
        <div className="activity-timeline">
            <Timeline items={timelineItems} />
        </div>
    )
}

export default React.memo(ActivityTimeline)

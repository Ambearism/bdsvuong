import React, { useState, useMemo } from 'react'
import { Button, Card, Empty, Flex, List, Tag, Typography, message, Skeleton } from 'antd'
import { CalendarOutlined, PlusOutlined, UserOutlined, CheckSquareOutlined, EditOutlined } from '@ant-design/icons'
import { AddTaskModal, type TaskFormValues } from '@/components/modals/AddTaskModal'
import { useGetAccountListQuery } from '@/api/account'
import {
    useGetCareCaseTasksQuery,
    useAddCareCaseTaskMutation,
    useUpdateCareCaseTaskMutation,
} from '@/api/care-case-task'
import dayjs from 'dayjs'
import type { AccountItem } from '@/types/account'
import type { CareCaseTaskItem } from '@/types/care-case-task'
import { TASK_STATUS_LABELS, TASK_STATUS, TASK_PRIORITY, type TaskPriorityType } from '@/config/constant'

import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { app } from '@/config/app'

interface Task {
    id: number
    title: string
    priority: TaskPriorityType
    dueDate: string
    assignee: string
    assigneeId: number | undefined
    linkedEntity?: string
    status: number
}

interface CareCaseTasksTabProps {
    caseId: number
}

const CareCaseTasksTab: React.FC<CareCaseTasksTabProps> = ({ caseId }) => {
    const { hasPermission } = usePermission()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    const { data: accountsData } = useGetAccountListQuery({ per_page: app.FETCH_ALL, is_option: true })
    const { data: tasksData, isLoading: isLoadingTasks, refetch } = useGetCareCaseTasksQuery(caseId)
    const [addTask, { isLoading: isAddingTask }] = useAddCareCaseTaskMutation()
    const [updateTask, { isLoading: isUpdatingTask }] = useUpdateCareCaseTaskMutation()

    const accountOptions = useMemo(
        () =>
            (accountsData?.data?.list ?? []).map((acc: AccountItem) => ({
                label: acc.full_name,
                value: acc.id,
            })),
        [accountsData],
    )

    const tasks = useMemo(() => {
        const list = tasksData?.data ?? []
        return list.map(
            (item: CareCaseTaskItem): Task => ({
                id: item.id,
                title: item.title || item.notes || 'Untitled Task',
                priority: TASK_PRIORITY.NORMAL,
                dueDate: item.due_date || item.created_at,
                assignee: item.assigned_to_rel?.full_name || 'System',
                assigneeId: item.assigned_to,
                status: Number(item.status) || TASK_STATUS.PENDING,
                linkedEntity: undefined,
            }),
        )
    }, [tasksData])

    const handleAddTask = async (values: TaskFormValues) => {
        try {
            if (editingTask) {
                await updateTask({
                    task_id: editingTask.id,
                    care_case_id: caseId,
                    payload: {
                        title: values.task,
                        due_date: values.deadline.format('YYYY-MM-DD'),
                        assigned_to: values.assignee,
                        status: values.status,
                    },
                }).unwrap()
                message.success('Đã cập nhật tác vụ')
            } else {
                await addTask({
                    payload: {
                        care_case_id: caseId,
                        title: values.task,
                        due_date: values.deadline.format('YYYY-MM-DD'),
                        assigned_to: values.assignee,
                        status: values.status || TASK_STATUS.PENDING,
                    },
                }).unwrap()
                message.success('Đã thêm tác vụ mới')
            }
            refetch()
            setIsAddModalOpen(false)
            setEditingTask(null)
        } catch {
            message.error(editingTask ? 'Không thể cập nhật tác vụ' : 'Không thể thêm tác vụ')
        }
    }

    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setIsAddModalOpen(true)
    }

    const getStatusTag = (status: number) => {
        const label = TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] || 'UNKNOWN'
        switch (status) {
            case TASK_STATUS.IN_PROGRESS:
                return (
                    <Tag color="warning" className="!m-0 font-bold">
                        {label}
                    </Tag>
                )
            case TASK_STATUS.COMPLETED:
                return (
                    <Tag color="success" className="!m-0 font-bold">
                        {label}
                    </Tag>
                )
            case TASK_STATUS.CANCELLED:
                return (
                    <Tag color="error" className="!m-0 font-bold">
                        {label}
                    </Tag>
                )
            default:
                return (
                    <Tag color="default" className="!m-0 font-bold">
                        {label}
                    </Tag>
                )
        }
    }

    if (isLoadingTasks) {
        return (
            <div className="space-y-4">
                <Skeleton active />
                <Skeleton active />
            </div>
        )
    }

    return (
        <Card className="!rounded-xl !border-slate-200 shadow-sm">
            <Flex justify="space-between" align="center" className="!mb-6">
                <Typography.Text strong className="text-base flex items-center gap-2 !text-slate-800">
                    <CheckSquareOutlined className="text-blue-600 text-xl" /> Danh sách việc cần làm
                </Typography.Text>
                {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.CREATE) && (
                    <Button
                        type="default"
                        icon={<PlusOutlined />}
                        className="h-9 font-bold border-slate-200 hover:!border-blue-400 hover:!text-blue-600"
                        onClick={() => {
                            setEditingTask(null)
                            setIsAddModalOpen(true)
                        }}>
                        Thêm việc
                    </Button>
                )}
            </Flex>

            {tasks.length > 0 ? (
                <List
                    dataSource={tasks}
                    renderItem={(item: Task) => (
                        <Card
                            key={item.id}
                            className="!mb-4 !border-slate-200 shadow-sm hover:!border-blue-200 transition-all group bg-white">
                            <Flex align="center" gap={20}>
                                <div
                                    className={`w-1.5 self-stretch rounded-full ${item.priority === TASK_PRIORITY.HIGH ? 'bg-red-500' : 'bg-slate-200'}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <Typography.Text className="block text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                        {item.title}
                                    </Typography.Text>
                                    <div className="flex flex-wrap gap-5 mt-2">
                                        <Typography.Text className="text-[12px] text-slate-500 font-bold flex items-center gap-1.5">
                                            <CalendarOutlined className="text-[14px]" />{' '}
                                            {dayjs(item.dueDate).format('DD/MM/YYYY')}
                                        </Typography.Text>
                                        <Typography.Text className="text-[12px] text-slate-500 font-bold flex items-center gap-1.5">
                                            <UserOutlined className="text-[14px]" /> {item.assignee}
                                        </Typography.Text>
                                        {item.linkedEntity && (
                                            <Tag
                                                color="blue"
                                                className="!text-[10px] !leading-5 !px-2 !m-0 !border-0 font-bold">
                                                {item.linkedEntity}
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                                <Flex align="center" gap={16}>
                                    <div className="flex-shrink-0">{getStatusTag(item.status)}</div>
                                    {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                                        <Button
                                            type="text"
                                            size="middle"
                                            icon={
                                                <EditOutlined className="text-slate-400 group-hover:text-blue-500 text-lg" />
                                            }
                                            onClick={() => openEditModal(item)}
                                        />
                                    )}
                                </Flex>
                            </Flex>
                        </Card>
                    )}
                />
            ) : (
                <Empty
                    description={
                        <Typography.Text type="secondary" italic>
                            Chưa có tác vụ nào được tạo
                        </Typography.Text>
                    }
                    className="p-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30"
                />
            )}

            <AddTaskModal
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false)
                    setEditingTask(null)
                }}
                onOk={handleAddTask}
                accountOptions={accountOptions}
                loading={isAddingTask || isUpdatingTask}
                initialValues={
                    editingTask
                        ? {
                              task: editingTask.title,
                              deadline: dayjs(editingTask.dueDate),
                              assignee: editingTask.assigneeId,
                              status: editingTask.status,
                          }
                        : undefined
                }
            />
        </Card>
    )
}

export default CareCaseTasksTab

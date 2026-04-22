import React, { useState } from 'react'
import { Button, Tooltip } from 'antd'
import {
    EditOutlined,
    CheckSquareOutlined,
    PhoneOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import { AddOpportunityTaskModal, type OpportunityTaskFormValues } from '@/components/modals/AddOpportunityTaskModal'
import {
    useCreateOpportunityTaskMutation,
} from '@/api/opportunity-task'
import { useGetAccountListQuery } from '@/api/account'
import { app } from '@/config/app'
import { message } from 'antd'

interface QuickActionBarProps {
    opportunityId: number
    isLead: boolean
    onNoteClick: () => void
    onStageClick?: () => void
    onConvertClick?: () => void
    onTaskCreated?: () => void
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    opportunityId,
    isLead,
    onNoteClick,
    onConvertClick,
    onTaskCreated,
}) => {
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [createTask, { isLoading: isCreatingTask }] = useCreateOpportunityTaskMutation()

    const { data: accountsData } = useGetAccountListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    const accountOptions = React.useMemo(
        () =>
            (accountsData?.data?.list ?? []).map(account => ({
                value: account.id,
                label: account.full_name || account.account_name || `#${account.id}`,
            })),
        [accountsData],
    )

    const handleTaskSubmit = async (values: OpportunityTaskFormValues) => {
        try {
            await createTask({
                opportunity_id: opportunityId,
                payload: {
                    title: values.task,
                    notes: values.task,
                    assigned_to: values.assignee,
                    start_date: values.startDate?.toISOString() || undefined,
                    end_date: values.endDate.toISOString(),
                    status: values.status || 1,
                },
            }).unwrap()
            message.success('Thêm tác vụ thành công')
            setTaskModalOpen(false)
            onTaskCreated?.()
        } catch {
            message.error('Thêm tác vụ thất bại')
        }
    }

    return (
        <>
            <div className="quick-action-bar">
                <Tooltip title="Thêm ghi chú nhanh">
                    <Button icon={<EditOutlined />} onClick={onNoteClick}>
                        Ghi chú
                    </Button>
                </Tooltip>
                <Tooltip title="Thêm tác vụ / nhắc việc">
                    <Button icon={<CheckSquareOutlined />} onClick={() => setTaskModalOpen(true)}>
                        Tác vụ
                    </Button>
                </Tooltip>
                <Tooltip title="Ghi log cuộc gọi">
                    <Button icon={<PhoneOutlined />} onClick={onNoteClick}>
                        Cuộc gọi
                    </Button>
                </Tooltip>
                {isLead && onConvertClick && (
                    <Tooltip title="Chuyển Lead thành Deal">
                        <Button type="primary" icon={<SwapOutlined />} onClick={onConvertClick}>
                            Chuyển Deal
                        </Button>
                    </Tooltip>
                )}
            </div>

            <AddOpportunityTaskModal
                open={taskModalOpen}
                onCancel={() => setTaskModalOpen(false)}
                onOk={handleTaskSubmit}
                accountOptions={accountOptions}
                loading={isCreatingTask}
            />
        </>
    )
}

export default React.memo(QuickActionBar)

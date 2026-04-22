import React, { useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Row, Col, Space, Spin, Flex, message } from 'antd'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
    useGetOpportunityDetailQuery,
    useGetOpportunityHistoryQuery,
    useLogOpportunityActivityMutation,
} from '@/api/opportunity'
import { useGetTasksByOpportunityQuery } from '@/api/opportunity-task'
import { LEAD_STAGES, ActivityType } from '@/config/constant'
import type { OpportunityStageType } from '@/config/constant'

import OpportunityHubHeader from '@/components/opportunity-hub/OpportunityHubHeader'
import CustomerInfoCard from '@/components/opportunity-hub/CustomerInfoCard'
import NeedsCard from '@/components/opportunity-hub/NeedsCard'
import LinkedProductCard from '@/components/opportunity-hub/LinkedProductCard'
import DocumentsCard from '@/components/opportunity-hub/DocumentsCard'
import StageStatusBar from '@/components/opportunity-hub/StageStatusBar'
import QuickActionBar from '@/components/opportunity-hub/QuickActionBar'
import ActivityTimeline from '@/components/opportunity-hub/ActivityTimeline'
import QuickNoteInput from '@/components/opportunity-hub/QuickNoteInput'

// TODO: Remove mock imports when real API is connected
import {
    MOCK_LEAD,
    MOCK_DEAL,
    MOCK_STAGE_HISTORY,
    MOCK_TASKS,
} from '@/mocks/opportunity-mock-data'

import '@/assets/styles/opportunity-hub.scss'

interface OpportunityHubProps {
    type: 'lead' | 'deal'
}

const OpportunityHub: React.FC<OpportunityHubProps> = ({ type }) => {
    const isLead = type === 'lead'
    const labelType = isLead ? 'Lead' : 'Deal'
    useDocumentTitle(`Chi tiết ${labelType}`)

    const { opportunityId } = useParams<{ opportunityId: string }>()
    const id = Number(opportunityId)
    const navigate = useNavigate()
    const noteInputRef = useRef<HTMLDivElement>(null)

    const {
        data: detailData,
        isLoading: isLoadingDetail,
        isError: isDetailError,
        refetch: refetchDetail,
    } = useGetOpportunityDetailQuery(
        { opportunity_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
        },
    )

    // Use mock data as fallback when API is unavailable
    const mockFallback = isLead ? MOCK_LEAD : MOCK_DEAL
    const opportunity = useMemo(
        () => detailData?.data || (isDetailError ? { ...mockFallback, id } : undefined),
        [detailData, isDetailError, mockFallback, id],
    )

    const {
        data: historyData,
        isError: isHistoryError,
        refetch: refetchHistory,
    } = useGetOpportunityHistoryQuery(
        { opportunity_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
        },
    )

    const stageHistory = useMemo(() => {
        const items = historyData?.data || (isHistoryError ? MOCK_STAGE_HISTORY : [])
        return items.map(item => ({
            ...item,
            action_type: Number(item.action_type),
            changed_at: item.changed_at || (item as unknown as { created_at: string }).created_at,
            old: item.old ?? {},
            new: item.new ?? {},
        }))
    }, [historyData, isHistoryError])

    const {
        data: tasksData,
        isError: isTasksError,
        refetch: refetchTasks,
    } = useGetTasksByOpportunityQuery(id, { skip: Number.isNaN(id) })

    const tasks = useMemo(
        () => tasksData?.data || (isTasksError ? MOCK_TASKS : []),
        [tasksData, isTasksError],
    )

    const [logActivity, { isLoading: isLoggingActivity }] = useLogOpportunityActivityMutation()

    const refetchAll = useCallback(() => {
        refetchDetail()
        refetchHistory()
        refetchTasks()
    }, [refetchDetail, refetchHistory, refetchTasks])

    const handleNoteSubmit = useCallback(
        async (content: string, label: string) => {
            try {
                const actionTypeMap: Record<string, number> = {
                    care: ActivityType.NOTE,
                    response: ActivityType.NOTE,
                    call: ActivityType.CALL,
                    note: ActivityType.NOTE,
                }
                const titleMap: Record<string, string> = {
                    care: 'Chăm sóc',
                    response: 'Phản hồi KH',
                    call: 'Ghi log cuộc gọi',
                    note: 'Ghi chú',
                }

                await logActivity({
                    opportunity_id: id,
                    payload: {
                        action_type: actionTypeMap[label] || ActivityType.NOTE,
                        notes: content,
                        title: titleMap[label] || 'Ghi chú',
                    },
                }).unwrap()
                message.success('Đã thêm ghi chú')
                refetchHistory()
            } catch {
                message.error('Thêm ghi chú thất bại')
            }
        },
        [id, logActivity, refetchHistory],
    )

    const handleNoteClick = useCallback(() => {
        noteInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Focus the textarea inside
        setTimeout(() => {
            const textarea = noteInputRef.current?.querySelector('textarea')
            textarea?.focus()
        }, 300)
    }, [])

    const handleConvertClick = useCallback(() => {
        if (!opportunity) return
        navigate(
            `/deals/create?customer_id=${opportunity.customer_id || ''}&product_id=${opportunity.product_id || ''}`,
        )
    }, [navigate, opportunity])

    // Determine if this opportunity is actually a lead based on its stage
    const isActuallyLead = useMemo(() => {
        if (!opportunity) return isLead
        return LEAD_STAGES.includes(opportunity.stage as OpportunityStageType)
    }, [opportunity, isLead])

    if (isLoadingDetail && !isDetailError) {
        return (
            <Flex align="center" justify="center" className="h-96">
                <Spin size="large" tip={`Đang tải ${labelType}...`} />
            </Flex>
        )
    }

    if (!opportunity) {
        navigate(isLead ? '/leads' : '/deals', { replace: true })
        return null
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            {/* Header */}
            <OpportunityHubHeader opportunity={opportunity} isLead={isActuallyLead} />

            {/* Stage Bar */}
            <StageStatusBar
                opportunity={opportunity}
                isLead={isActuallyLead}
                onStageChanged={refetchAll}
            />

            {/* 2-Column Layout */}
            <Row gutter={16} className="mb-4">
                {/* Left Column - Customer Info */}
                <Col xs={24} lg={8} xxl={7} className="mb-4 lg:mb-0">
                    <Space direction="vertical" size="middle" className="!w-full opportunity-hub__left-col">
                        <CustomerInfoCard opportunity={opportunity} />
                        <NeedsCard opportunity={opportunity} />
                        <LinkedProductCard opportunity={opportunity} />
                        <DocumentsCard opportunity={opportunity} />
                    </Space>
                </Col>

                {/* Right Column - Timeline + Actions */}
                <Col xs={24} lg={16} xxl={17}>
                    <Space direction="vertical" size="middle" className="!w-full opportunity-hub__right-col">
                        {/* Quick Actions */}
                        <QuickActionBar
                            opportunityId={id}
                            isLead={isActuallyLead}
                            onNoteClick={handleNoteClick}
                            onConvertClick={handleConvertClick}
                            onTaskCreated={refetchAll}
                        />

                        {/* Quick Note Input */}
                        <div ref={noteInputRef}>
                            <QuickNoteInput onSubmit={handleNoteSubmit} loading={isLoggingActivity} />
                        </div>

                        {/* Activity Timeline */}
                        <ActivityTimeline tasks={tasks} stageHistory={stageHistory} />
                    </Space>
                </Col>
            </Row>
        </Space>
    )
}

export default OpportunityHub


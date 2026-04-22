import React, { useMemo } from 'react'
import { Card, Flex, Tag, Modal, message } from 'antd'
import { CaretRightFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import type { OpportunityItem } from '@/types/opportunity'
import {
    OpportunityStageLabels,
    OpportunityStageColors,
    LEAD_STAGES,
    DEAL_STAGES,
    OpportunityPriorityLabels,
    OpportunityPriorityColors,
    type OpportunityStageType,
    type OpportunityPriorityType,
} from '@/config/constant'
import { useChangeOpportunityStageMutation } from '@/api/opportunity'

interface StageStatusBarProps {
    opportunity: OpportunityItem
    isLead: boolean
    onStageChanged?: () => void
}

const StageStatusBar: React.FC<StageStatusBarProps> = ({ opportunity, isLead, onStageChanged }) => {
    const [changeStage] = useChangeOpportunityStageMutation()

    const stages = useMemo(() => (isLead ? LEAD_STAGES : DEAL_STAGES), [isLead])

    const currentStageIndex = useMemo(
        () => stages.findIndex(s => s === opportunity.stage),
        [stages, opportunity.stage],
    )

    const handleStageClick = async (stage: OpportunityStageType) => {
        if (stage === opportunity.stage) return

        const stageLabel = OpportunityStageLabels[stage]
        Modal.confirm({
            title: 'Xác nhận đổi trạng thái',
            icon: <ExclamationCircleOutlined />,
            content: `Chuyển trạng thái sang "${stageLabel}"?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await changeStage({
                        opportunity_id: opportunity.id,
                        payload: { stage },
                    }).unwrap()
                    message.success(`Đã chuyển sang ${stageLabel}`)
                    onStageChanged?.()
                } catch {
                    message.error('Đổi trạng thái thất bại')
                }
            },
        })
    }

    return (
        <Card size="small" className="!mb-0">
            <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                <div className="stage-status-bar">
                    {stages.map((stage, index) => {
                        const isActive = stage === opportunity.stage
                        const isCompleted = index < currentStageIndex

                        let cls = 'stage-status-bar__step'
                        if (isActive) cls += ' stage-status-bar__step--active'
                        else if (isCompleted) cls += ' stage-status-bar__step--completed'

                        const color = OpportunityStageColors[stage] || '#1677ff'

                        return (
                            <React.Fragment key={stage}>
                                {index > 0 && (
                                    <CaretRightFilled className="stage-status-bar__step-arrow" />
                                )}
                                <div
                                    className={cls}
                                    style={
                                        isActive
                                            ? { background: color, borderColor: color, color: '#fff' }
                                            : undefined
                                    }
                                    onClick={() => handleStageClick(stage)}>
                                    {OpportunityStageLabels[stage]}
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>

                {opportunity.priority && (
                    <Tag
                        color={OpportunityPriorityColors[opportunity.priority as OpportunityPriorityType]}
                        className="!m-0 !font-medium">
                        {OpportunityPriorityLabels[opportunity.priority as OpportunityPriorityType]}
                    </Tag>
                )}
            </Flex>
        </Card>
    )
}

export default React.memo(StageStatusBar)

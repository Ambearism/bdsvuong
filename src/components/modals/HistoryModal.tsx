import React from 'react'
import { Modal, Spin } from 'antd'
import { useGetOpportunityHistoryQuery } from '@/api/opportunity'
import HistoryTimeline from '@/components/timeline/HistoryTimeline'

type Props = {
    open: boolean
    onCancel: () => void
    opportunityId: number
}

const HistoryModal: React.FC<Props> = ({ open, onCancel, opportunityId }) => {
    const { data, isLoading } = useGetOpportunityHistoryQuery(
        { opportunity_id: opportunityId },
        { skip: !open || !opportunityId, refetchOnMountOrArgChange: true },
    )

    return (
        <Modal title="Lịch sử hoạt động" open={open} onCancel={onCancel} footer={null} width={600} centered>
            <Spin spinning={isLoading}>
                <HistoryTimeline items={data?.data || []} />
            </Spin>
        </Modal>
    )
}

export default HistoryModal

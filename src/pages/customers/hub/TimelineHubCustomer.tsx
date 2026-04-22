import React from 'react'
import { Card, Empty } from 'antd'
import { useParams } from 'react-router'
import { useGetCustomerTimelineQuery } from '@/api/customer'
import HistoryTimeline from '@/components/timeline/HistoryTimeline'
import { CUSTOMER_HUB_TIMELINE_UI_TEXT } from '@/config/constant'
import type { StageHistoryItem } from '@/types/opportunity'

const TimelineHubCustomer = () => {
    const { customer_id } = useParams<{ customer_id: string }>()
    const customerId = Number(customer_id)

    const { data: timelineData } = useGetCustomerTimelineQuery(
        { customer_id: customerId },
        {
            skip: Number.isNaN(customerId),
            refetchOnMountOrArgChange: true,
        },
    )

    const items: StageHistoryItem[] = (timelineData?.data || []).map(item => ({
        ...item,
        action_type: Number(item.action_type),
        changed_at: item.changed_at || item.created_at,
        old: item.old ?? {},
        new: item.new ?? {},
    })) as StageHistoryItem[]

    return (
        <Card>
            {items.length ? (
                <HistoryTimeline items={items} />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={CUSTOMER_HUB_TIMELINE_UI_TEXT.NO_DATA}
                    className="!my-10"
                />
            )}
        </Card>
    )
}

export default React.memo(TimelineHubCustomer)

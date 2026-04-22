import { Card, Space, Row, Col, Timeline, type TimelineItemProps, Typography, Flex, Empty, Tag } from 'antd'
import { InfoCircleOutlined, PlusCircleOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { useGetLeaseContractTimelineQuery } from '@/api/lease-contract'
import { useParams } from 'react-router'
import { LEASE_CONTRACT_LOG_TYPE, LEASE_CONTRACT_LOG_TYPE_LABEL } from '@/config/constant'
import type { LeaseContractTimelineItem } from '@/types/lease-contract'
import dayjs from 'dayjs'
import { app } from '@/config/app'

const { Text } = Typography

const TRANSFER_TARGET_LABEL: Record<string, string> = {
    TENANT: 'khách thuê',
    LANDLORD: 'chủ nhà',
    PRODUCT: 'căn / đơn vị',
}

const BILLING_UNIT_LABEL: Record<string, string> = {
    MONTH: 'tháng',
    YEAR: 'năm',
}

const formatMilionAmount = (amount: unknown): string | null => {
    if (amount == null || amount === '') return null
    const number = Number(amount)
    if (Number.isNaN(number)) return null
    return `${number} triệu`
}

const formatDateValue = (value: unknown): string => {
    if (!value) return app.EMPTY_DISPLAY
    const parsed = dayjs(String(value))
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : app.EMPTY_DISPLAY
}

const formatBillingCycleValue = (billingUnit: unknown, billingPeriod: unknown): string => {
    if (!billingUnit && (billingPeriod == null || billingPeriod === '')) {
        return 'Thanh toán 1 lần'
    }

    const periodNumber = Number(billingPeriod)
    const unitKey = String(billingUnit || '').toUpperCase()
    const unitLabel = BILLING_UNIT_LABEL[unitKey]

    if (!unitLabel || Number.isNaN(periodNumber) || periodNumber <= 0) {
        return app.EMPTY_DISPLAY
    }

    return `${periodNumber} ${unitLabel}`
}

const buildActionRows = (item: LeaseContractTimelineItem): string[] => {
    const oldData = item.old || {}
    const newData = item.new || {}

    if (item.type === LEASE_CONTRACT_LOG_TYPE.CREATE) return []

    if (item.type === LEASE_CONTRACT_LOG_TYPE.UPDATE) {
        const changes: string[] = []

        const oldStartDate = formatDateValue(oldData.start_date)
        const newStartDate = formatDateValue(newData.start_date)
        if (oldStartDate !== newStartDate) {
            changes.push(`Ngày bắt đầu: ${oldStartDate} -> ${newStartDate}`)
        }

        const oldEndDate = formatDateValue(oldData.end_date)
        const newEndDate = formatDateValue(newData.end_date)
        if (oldEndDate !== newEndDate) {
            changes.push(`Ngày kết thúc: ${oldEndDate} -> ${newEndDate}`)
        }

        const oldCycle = formatBillingCycleValue(oldData.billing_unit, oldData.billing_period)
        const newCycle = formatBillingCycleValue(newData.billing_unit, newData.billing_period)
        if (oldCycle !== newCycle) {
            changes.push(`Chu kỳ thanh toán: ${oldCycle} -> ${newCycle}`)
        }

        const oldPrice = formatMilionAmount(oldData.price) || app.EMPTY_DISPLAY
        const newPrice = formatMilionAmount(newData.price) || app.EMPTY_DISPLAY
        if (oldPrice !== newPrice) {
            changes.push(`Tiền thuê: ${oldPrice} -> ${newPrice}`)
        }

        const oldDeposit = formatMilionAmount(oldData.deposit) || app.EMPTY_DISPLAY
        const newDeposit = formatMilionAmount(newData.deposit) || app.EMPTY_DISPLAY
        if (oldDeposit !== newDeposit) {
            changes.push(`Tiền cọc: ${oldDeposit} -> ${newDeposit}`)
        }

        return changes.length ? changes : ['Cập nhật thông tin hợp đồng']
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.ADD_INVOICE) {
        const periodName = (newData.title as string | undefined) || 'Kỳ thanh toán'
        const dueDate = dayjs(newData.due_date as string).format('DD/MM/YYYY')

        const amountText = formatMilionAmount(newData.amount) || '-'
        return [`${periodName} hạn ${dueDate} (${amountText})`]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.RENEW) {
        const endDate = dayjs(newData.end_date as string).format('DD/MM/YYYY')
        const amountText = formatMilionAmount(newData.price) || '-'
        return [`Gia hạn hợp đồng tới ${endDate} (${amountText} / kỳ)`]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.ADD_PAYMENT) {
        const periodName = (newData.period_name as string | undefined) || 'Kỳ thanh toán'
        const amountText = formatMilionAmount(newData.amount) || '-'
        return [`${periodName} (${amountText})`]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.APPROVE_PAYMENT) {
        const periodName = (newData.period_name as string | undefined) || 'Kỳ thanh toán'
        return [periodName]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.REJECT_PAYMENT) {
        const periodName = (newData.period_name as string | undefined) || 'Kỳ thanh toán'
        return [periodName]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.UPDATE_PAYMENT_ALLOCATIONS) {
        return []
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.ADD_TRANSFER) {
        const targetType = String(newData.target_type || '').toUpperCase()
        const targetLabel = TRANSFER_TARGET_LABEL[targetType] || 'đối tượng'
        const targetName = (newData.target_name as string | undefined)?.trim() || app.EMPTY_DISPLAY
        const effectiveDateRaw =
            (newData.effective_date as string | undefined) || (newData.start_date as string | undefined)
        const effectiveDate = effectiveDateRaw ? dayjs(effectiveDateRaw).format('DD/MM/YYYY') : app.EMPTY_DISPLAY
        return [`Chuyển nhượng hợp đồng cho ${targetLabel}: ${targetName} vào ${effectiveDate}`]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.ADD_DEBT_NOTE) {
        const title = (newData.title as string | undefined) || 'ghi nợ'
        const reminderDate = dayjs(newData.reminder_date as string).format('DD/MM/YYYY')
        const amountText = formatMilionAmount(newData.amount)
        return [amountText ? `${title} (${amountText})` : title, `Hạn nhắc nợ ${reminderDate}`]
    }

    if (item.type === LEASE_CONTRACT_LOG_TYPE.DELETE_DEBT_NOTE) {
        const title = (oldData.title as string | undefined) || app.EMPTY_DISPLAY
        return [title]
    }

    return []
}

const buildContent = (item: LeaseContractTimelineItem): string[] => {
    return buildActionRows(item)
}

const getTimelineLabel = (item: LeaseContractTimelineItem): string => {
    return LEASE_CONTRACT_LOG_TYPE_LABEL[item.type] ?? item.type
}

const TimelineHubLeaseContract = () => {
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()
    const leaseContractId = Number(lease_contract_id)

    const { data: timelineData } = useGetLeaseContractTimelineQuery(
        { lease_contract_id: leaseContractId },
        {
            refetchOnMountOrArgChange: true,
        },
    )

    const timelineItems = (timelineData?.data.items || []).map<TimelineItemProps>((item, index) => {
        const title = getTimelineLabel(item)
        const contentRows = buildContent(item)

        const isCreate = item.type === LEASE_CONTRACT_LOG_TYPE.CREATE
        const isDelete = item.type === LEASE_CONTRACT_LOG_TYPE.DELETE_DEBT_NOTE

        const dot = isCreate ? (
            <PlusCircleOutlined className="text-lg !text-green-500" />
        ) : isDelete ? (
            <DeleteOutlined className="text-lg !text-red-400" />
        ) : (
            <InfoCircleOutlined className="text-lg" />
        )

        return {
            dot,
            children: (
                <Row justify={index % 2 === 0 ? 'start' : 'end'}>
                    <Col span={18}>
                        <Card size="small">
                            <Space className="!w-full" direction="vertical" size={4}>
                                <Space className="!justify-between !w-full">
                                    <Text strong>{title}</Text>
                                    <Text type="secondary" className="!text-xs">
                                        {item.created_at}
                                    </Text>
                                </Space>

                                {contentRows.length > 0 && (
                                    <Space direction="vertical" size={2} className="!w-full" align="start">
                                        {contentRows.map((row, rowIndex) => (
                                            <Text key={`${item.id}-${rowIndex}`} className="!w-full">
                                                {row}
                                            </Text>
                                        ))}
                                    </Space>
                                )}

                                {item.reason && (
                                    <div className="rounded-md bg-amber-50 px-3 py-2">
                                        <Text className="!text-xs !font-semibold !uppercase !text-amber-700">
                                            Ghi chú
                                        </Text>
                                        <div>
                                            <Text className="!text-xs">{item.reason}</Text>
                                        </div>
                                    </div>
                                )}

                                <Flex gap={4} className="!mt-2">
                                    <Tag>
                                        <UserOutlined />
                                        <Text type="secondary" className="!text-xs">
                                            {item.created_by_name}
                                        </Text>
                                    </Tag>
                                </Flex>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            ),
        }
    })

    return (
        <Card>
            {timelineItems.length ? (
                <Timeline mode="alternate" items={timelineItems} />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            )}
        </Card>
    )
}

export default TimelineHubLeaseContract

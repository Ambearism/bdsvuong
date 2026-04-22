import { formatNumber } from '@/utils/number-utils'
import type { Dayjs } from 'dayjs'
import { Avatar, Card, Empty, Flex, List, Typography } from 'antd'
import { useMemo } from 'react'
import { BILLING_CYCLE_VALUE, LEASE_CONTRACT_DUE_DATE_RULE } from '@/config/constant'
import type { BillingCycleValue, DueDateRuleValue } from '@/types/lease-contract'

const { Text, Title } = Typography

type LeasePaymentProjectionProps = {
    startDate?: Dayjs
    endDate?: Dayjs
    price?: number
    billingCycle?: BillingCycleValue
    dueDateRule?: DueDateRuleValue
    closeDay?: number
    gracePeriodDays?: number
}

type Installment = {
    index: number
    dueDate: Dayjs
    amount: number
}

const BILLING_CYCLE_MONTH_STEP_MAP: Record<Exclude<BillingCycleValue, 'ONE_TIME'>, number> = {
    [BILLING_CYCLE_VALUE.MONTHLY]: 1,
    [BILLING_CYCLE_VALUE.QUARTERLY]: 3,
    [BILLING_CYCLE_VALUE.HALF_YEARLY]: 6,
    [BILLING_CYCLE_VALUE.YEARLY]: 12,
}

const resolveDueDate = (
    dueDateRule: DueDateRuleValue | undefined,
    dueAnchorDate: Dayjs,
    closeDay: number | undefined,
    gracePeriodDays: number | undefined,
) => {
    const dueDate =
        dueDateRule === LEASE_CONTRACT_DUE_DATE_RULE.START_OF_PERIOD
            ? dueAnchorDate
            : dueAnchorDate.date(Math.max(1, Math.min(closeDay ?? dueAnchorDate.date(), dueAnchorDate.daysInMonth())))

    return dueDate.add(Math.max(0, gracePeriodDays ?? 0), 'day')
}

const LeasePaymentProjection = ({
    startDate,
    endDate,
    price,
    billingCycle,
    dueDateRule,
    closeDay,
    gracePeriodDays,
}: LeasePaymentProjectionProps) => {
    const installments = useMemo<Installment[]>(() => {
        if (!startDate || !endDate || !price || price <= 0 || !billingCycle) return []
        if (endDate.isBefore(startDate, 'day')) return []

        if (billingCycle === BILLING_CYCLE_VALUE.ONE_TIME) {
            return [
                {
                    index: 1,
                    dueDate: resolveDueDate(dueDateRule, startDate, closeDay, gracePeriodDays),
                    amount: price,
                },
            ]
        }

        const monthStep = BILLING_CYCLE_MONTH_STEP_MAP[billingCycle]
        const nextInstallments: Installment[] = []

        let index = 1
        let periodStart = startDate

        while (periodStart.isBefore(endDate, 'day') && index <= 240) {
            const nextPeriodStart = periodStart.add(monthStep, 'month')

            nextInstallments.push({
                index,
                dueDate: resolveDueDate(dueDateRule, nextPeriodStart, closeDay, gracePeriodDays),
                amount: price,
            })

            periodStart = nextPeriodStart
            index += 1
        }

        return nextInstallments
    }, [billingCycle, closeDay, dueDateRule, endDate, gracePeriodDays, price, startDate])

    const totalAmount = useMemo(() => {
        return installments.reduce((sum, installment) => sum + installment.amount, 0)
    }, [installments])

    return (
        <Card size="small" className="!mb-4" title={<Text strong>Lịch thanh toán dự kiến</Text>}>
            {!installments.length ? (
                <Empty description="Nhập ngày bắt đầu, ngày kết thúc, giá thuê và chu kỳ để xem lịch thanh toán" />
            ) : (
                <>
                    <List<Installment>
                        dataSource={installments}
                        renderItem={installment => (
                            <List.Item>
                                <Flex align="center" justify="space-between" className="w-full" gap={12}>
                                    <Flex align="center" gap={12}>
                                        <Avatar size="small">{installment.index}</Avatar>
                                        <div>
                                            <Text strong>Kỳ thanh toán {installment.index}</Text>
                                            <Text type="secondary" className="block">
                                                {installment.dueDate.format('DD/MM/YYYY')}
                                            </Text>
                                        </div>
                                    </Flex>
                                    <Text type="success" strong>
                                        {formatNumber(installment.amount)} triệu
                                    </Text>
                                </Flex>
                            </List.Item>
                        )}
                    />

                    <Flex justify="space-between" align="center" className="!pt-4 !mt-4 border-t border-gray-200">
                        <Text className="!text-lg" strong>
                            Tổng giá trị HĐ
                        </Text>
                        <Title level={4} className="!my-0">
                            {formatNumber(totalAmount)} triệu
                        </Title>
                    </Flex>
                </>
            )}
        </Card>
    )
}

export default LeasePaymentProjection

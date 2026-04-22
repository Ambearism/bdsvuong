import React from 'react'
import { Card, Typography, Flex, Tag } from 'antd'
import {
    EnvironmentOutlined,
    DollarOutlined,
    ExpandOutlined,
    CalendarOutlined,
    CreditCardOutlined,
} from '@ant-design/icons'
import type { OpportunityItem } from '@/types/opportunity'
import { NeedTypeLabels, type NeedTypeType } from '@/config/constant'
import { useGetEnumOptionsQuery } from '@/api/types'

const { Text } = Typography

interface NeedsCardProps {
    opportunity: OpportunityItem
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => {
    if (!value) return null
    return (
        <div className="info-card__row">
            <Flex align="center" gap={6} className="flex-shrink-0">
                <span className="text-gray-400 text-xs">{icon}</span>
                <Text className="!text-xs !text-gray-500">{label}</Text>
            </Flex>
            <Text className="!text-sm !font-medium !text-right !max-w-[60%] !truncate">{value}</Text>
        </div>
    )
}

const NeedsCard: React.FC<NeedsCardProps> = ({ opportunity }) => {
    const { data: enumData } = useGetEnumOptionsQuery(['product_types'])

    const needLabel = opportunity.need ? NeedTypeLabels[opportunity.need as NeedTypeType] : null

    const productTypeLabel = React.useMemo(() => {
        if (!opportunity.product_type_id || !enumData?.data?.product_types) return null
        const found = enumData.data.product_types.find(pt => pt.value === opportunity.product_type_id)
        return found?.label || null
    }, [opportunity.product_type_id, enumData])

    const budgetDisplay = React.useMemo(() => {
        if (!opportunity.budget_min && !opportunity.budget_max) return null
        if (opportunity.budget_min && opportunity.budget_max)
            return `${opportunity.budget_min} - ${opportunity.budget_max} tỷ`
        if (opportunity.budget_min) return `Từ ${opportunity.budget_min} tỷ`
        return `Đến ${opportunity.budget_max} tỷ`
    }, [opportunity.budget_min, opportunity.budget_max])

    const acreageDisplay = React.useMemo(() => {
        if (!opportunity.min_acreage && !opportunity.max_acreage) return null
        if (opportunity.min_acreage && opportunity.max_acreage)
            return `${opportunity.min_acreage} - ${opportunity.max_acreage} m²`
        if (opportunity.min_acreage) return `Từ ${opportunity.min_acreage} m²`
        return `Đến ${opportunity.max_acreage} m²`
    }, [opportunity.min_acreage, opportunity.max_acreage])

    const locationDisplay = React.useMemo(() => {
        const parts = []
        if (opportunity.zone_ward_rel?.name) parts.push(opportunity.zone_ward_rel.name)
        if (opportunity.zone_province_rel?.name) parts.push(opportunity.zone_province_rel.name)
        return parts.length > 0 ? parts.join(', ') : null
    }, [opportunity.zone_ward_rel, opportunity.zone_province_rel])

    return (
        <Card
            size="small"
            title={
                <Text strong className="!text-xs !uppercase !tracking-wider !text-gray-500">
                    Nhu cầu
                </Text>
            }>
            {needLabel && (
                <div className="mb-2">
                    <Tag color="blue">{needLabel}</Tag>
                </div>
            )}

            <div>
                <InfoRow icon={<ExpandOutlined />} label="Loại BĐS" value={productTypeLabel} />
                <InfoRow icon={<EnvironmentOutlined />} label="Khu vực" value={locationDisplay} />
                {opportunity.project_rel && (
                    <InfoRow icon={<EnvironmentOutlined />} label="Dự án" value={opportunity.project_rel.name} />
                )}
                <InfoRow icon={<DollarOutlined />} label="Ngân sách" value={budgetDisplay} />
                <InfoRow icon={<ExpandOutlined />} label="Diện tích" value={acreageDisplay} />
                <InfoRow icon={<CreditCardOutlined />} label="Thanh toán" value={opportunity.payment_method} />
                <InfoRow icon={<CalendarOutlined />} label="Thời gian GD" value={opportunity.expected_date} />
            </div>
        </Card>
    )
}

export default React.memo(NeedsCard)

import React from 'react'
import { Breadcrumb, Card, Flex, Button, Tag, Typography, Space, Tooltip } from 'antd'
import { GoHome } from 'react-icons/go'
import { Link, useNavigate } from 'react-router'
import {
    EditOutlined,
    PhoneOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import type { OpportunityItem } from '@/types/opportunity'
import {
    OpportunityStageLabels,
    OpportunityStageColors,
    LeadSourceLabels,
    type OpportunityStageType,
    type LeadSourceType,
} from '@/config/constant'

const { Text, Title } = Typography

interface OpportunityHubHeaderProps {
    opportunity: OpportunityItem
    isLead: boolean
}

const OpportunityHubHeader: React.FC<OpportunityHubHeaderProps> = ({ opportunity, isLead }) => {
    const navigate = useNavigate()
    const labelType = isLead ? 'Lead' : 'Deal'
    const listPath = isLead ? '/leads' : '/deals'
    const updatePath = isLead
        ? `/leads/${opportunity.id}/update`
        : `/deals/${opportunity.id}/update`

    const customerName = opportunity.customer_rel?.name || opportunity.name || 'N/A'
    const phone = opportunity.customer_rel?.phone || opportunity.phone

    const stageLabel = OpportunityStageLabels[opportunity.stage as OpportunityStageType]
    const stageColor = OpportunityStageColors[opportunity.stage as OpportunityStageType]

    const sourceLabel = opportunity.lead_source
        ? LeadSourceLabels[opportunity.lead_source as LeadSourceType]
        : null

    const assigneeName =
        opportunity.assigned_to_info?.full_name ||
        opportunity.assigned_to_rel?.full_name ||
        opportunity.assigned_to_rel?.account_name ||
        'Chưa phân công'

    return (
        <Card className="!py-2">
            <Flex className="w-full" justify="space-between" align="center" gap="middle" wrap="wrap">
                {/* Left: Breadcrumb + Title */}
                <div>
                    <Breadcrumb
                        className="*:items-center !mb-2"
                        items={[
                            {
                                title: (
                                    <Link to="/">
                                        <GoHome size={20} />
                                    </Link>
                                ),
                            },
                            {
                                title: <Link to={listPath}>Danh sách {labelType}</Link>,
                                className: 'text-sm',
                            },
                            {
                                title: `Chi tiết ${labelType}`,
                                className: 'text-sm font-medium',
                            },
                        ]}
                    />
                    <Flex gap={12} align="center" wrap="wrap">
                        <Title level={4} className="!m-0">
                            {customerName}
                        </Title>
                        <Tag color="blue" className="!m-0">
                            {opportunity.code || `#${opportunity.id}`}
                        </Tag>
                        {stageLabel && (
                            <Tag color={stageColor} className="!m-0">
                                {stageLabel}
                            </Tag>
                        )}
                        {sourceLabel && (
                            <Tag className="!m-0 !text-xs">Nguồn: {sourceLabel}</Tag>
                        )}
                    </Flex>

                    <Flex gap={16} className="mt-2" align="center" wrap="wrap">
                        {phone && (
                            <Text className="!text-sm !text-gray-500">
                                📞 <a href={`tel:${phone}`}>{phone}</a>
                            </Text>
                        )}
                        <Text className="!text-sm !text-gray-500">
                            👤 CV: <strong>{assigneeName}</strong>
                        </Text>
                    </Flex>
                </div>

                {/* Right: Action buttons */}
                <Space wrap>
                    {phone && (
                        <Tooltip title="Gọi điện">
                            <Button icon={<PhoneOutlined />} href={`tel:${phone}`}>
                                Gọi
                            </Button>
                        </Tooltip>
                    )}
                    {phone && (
                        <Tooltip title="Nhắn Zalo">
                            <Button
                                href={`https://zalo.me/${phone}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                Zalo
                            </Button>
                        </Tooltip>
                    )}
                    {isLead && (
                        <Tooltip title="Chuyển thành Deal">
                            <Button
                                type="primary"
                                ghost
                                icon={<SwapOutlined />}
                                onClick={() =>
                                    navigate(`/deals/create?customer_id=${opportunity.customer_id}&product_id=${opportunity.product_id || ''}`)
                                }>
                                Chuyển Deal
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip title="Chỉnh sửa thông tin chi tiết">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(updatePath)}>
                            Sửa
                        </Button>
                    </Tooltip>
                </Space>
            </Flex>
        </Card>
    )
}

export default React.memo(OpportunityHubHeader)
